# SOME STANDARD LIBRARY
import re
import string
from datetime import timedelta
import smtplib
from email.mime.text import MIMEText
import datetime
import pytz
import qrcode 
import io 

# FLASK AND FIREBASE LIBRARY
import bcrypt
import requests
from flask import Flask, jsonify, request, session, send_file
from flask_cors import CORS
from flask_session import Session
from firebase_admin import auth, credentials, db, firestore, initialize_app
from flask_apscheduler import APScheduler

# PROJECT MODULES
from authentication import check_password, is_valid_email, is_valid_vietnamese_phone_number, is_valid_username
from mail_services import send_email_verification, send_reset_password
from API import GoogleCalendarAPI

# GOOGLE CALENDAR LIBRARIES:
import datetime 
import os.path 
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]
calendar_api = GoogleCalendarAPI()
# DECLARATION SOME NESSCARY THINGS:
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = "no_one_knows_this_secret_key"
app.permanent_session_lifetime = timedelta(days=365)

# DECALARATION FOR DATABASE-RELATED:
cred = credentials.Certificate('key.json')
initialize_app(cred, {
    "databaseURL": "https://aiot-medical-box-default-rtdb.asia-southeast1.firebasedatabase.app/"
})
FIREBASE_AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAhRZ159X6lSY5ewAXS55Rd7zqR0wjNAEk"
scheduler = APScheduler()
scheduler.init_app(app)
utc_plus_7 = datetime.timezone(datetime.timedelta(hours=7))

# SOME USEFUL FUNCTIONS FOR SOME FUNCTIONALITIES:
def id_token_c(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying ID token: {e}")
        return None

def error_response(code: str, message: str, status: int = 400):
    return jsonify({
        "code": code,
        "message": message
    }), status

def check_pill_reminders():
    with app.app_context():
        now_local = datetime.datetime.now(utc_plus_7)
        users_ref = db.reference("users")
        users = users_ref.get()

        if users:
            for user_id, user_data in users.items():
                if 'pill_logs' in user_data:
                    for log_id, log_data in user_data['pill_logs'].items():
                        if not log_data.get('isTaken'):
                            try:
                                scheduled_start_time_str = log_data['scheduledStartTime']
                                # Assuming scheduledStartTime is stored in UTC with 'Z'
                                if scheduled_start_time_str.endswith('Z'):
                                    scheduled_start_time_utc = datetime.datetime.fromisoformat(scheduled_start_time_str.replace('Z', '+00:00'))
                                else:
                                    scheduled_start_time_utc = datetime.datetime.fromisoformat(scheduled_start_time_str)

                                scheduled_start_time_local = scheduled_start_time_utc.astimezone(utc_plus_7)
                                time_difference = now_local - scheduled_start_time_local
                                time_difference_minutes = time_difference.total_seconds() / 60

                                # Flags to track if reminders have been triggered
                                fifteen_min_triggered = log_data.get('fifteen_min_triggered', False)
                                sixty_min_triggered = log_data.get('sixty_min_triggered', False)

                                if 15 <= time_difference_minutes < 60 and not fifteen_min_triggered:
                                    print(f"[{now_local.strftime('%Y-%m-%d %H:%M:%S')}] User {user_id}: 15-Minute Reminder - Has not taken pill scheduled for {scheduled_start_time_local.strftime('%H:%M')}.")
                                    # Trigger notification here
                                    users_ref.child(user_id).child('pill_logs').child(log_id).update({'fifteen_min_triggered': True})


                                elif time_difference_minutes >= 60 and not sixty_min_triggered:
                                    users_ref.child(user_id).child('pill_logs').child(log_id).update({'missed': True, 'sixty_min_triggered': True})
                                    print(f"[{now_local.strftime('%Y-%m-%d %H:%M:%S')}] User {user_id}: Marked pill scheduled for {scheduled_start_time_local.strftime('%H:%M')} as forgotten.")
                                    # Log this event

                            except ValueError as e:
                                print(f"Error processing time for user {user_id}, log {log_id}: {e}")
                            except KeyError as e:
                                print(f"Missing key in data for user {user_id}, log {log_id}: {e}")
scheduler.add_job(id='check_pill_reminders', func=check_pill_reminders, trigger='interval', minutes=1)

# THE BLOCK OF CODE USED FOR REGISTERATION:
@app.route("/register", methods = ["POST"])
def register():
    data = request.get_json() or {}

    email = data["email"]
    password = data["password"]
    phone_number = data.get("phone_number")
    username = data.get("username") 

    # --- FORM CHECKING ---
    if not username:
        return error_response("USERNAME_REQUIRED", "Username is required")
    if not email:
        return error_response("EMAIL_REQUIRED", "Email is required")
    if not is_valid_email(email):
        return error_response("EMAIL_INVALID", "Invalid email format")
    if not password:
        return error_response("PASSWORD_REQUIRED", "Password is required")
    password_validation_error = check_password(password)
    if password_validation_error:
        return error_response("PASSWORD_INVALID", "Password does not meet security requirements.")
    if not phone_number:
        return error_response("PHONE_NUMBER_REQUIRED", "Phone number is required")
    if not is_valid_vietnamese_phone_number(phone_number):
        return error_response("PHONE_NUMBER_INVALID", "Invalid Vietnamese phone number format")
    if not is_valid_username(username):
        return error_response("USERNAME_INVALID", "Username must be 10 characters or less and can only contain letters, numbers, and spaces.")
    
    try:
        user = auth.create_user(email=email, password=password)
    except auth.EmailAlreadyExistsError:
        return error_response("EMAIL_ALREADY_EXISTS", "Email already exists")
    except Exception:
        return error_response("INTERNAL_ERROR", "Internal server error. Please try again later.")
    try:
        verification_link = auth.generate_email_verification_link(email)
        send_email_verification(email, verification_link, user_name=username, sender_name="Duck")
    except Exception:
        # If fail -> Still allow to register
        pass 
    # --- FLASK SESSION SAVING ---
    session["uid"] = user.uid
    session["email"] = email
    # --- FIREBASE DATABASE SAVING ---
    ref = db.reference("users")
    user_data = {
        user.uid: {
            "user_info":{
                "email": email,
                "phone_number": phone_number,
                "username": username
            }
        }
    }
    ref.update(user_data)
    return jsonify({
        "message": "User created successfully",
        "uid": user.uid,
        "email": email
    }), 201

# APP BLOCK FOR LOGIN
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    # --- FORM CHECKING ---
    if not email:
        return error_response("EMAIL_REQUIRED", "Email is required")
    if not is_valid_email(email):
        return error_response("EMAIL_INVALID", "Invalid email format")
    if not password:
        return error_response("PASSWORD_REQUIRED", "Password is required")
    password_error =  check_password(password)
    if check_password(password):
        return error_response("PASSWORD_INVALID", password_error)

    try:
        response = requests.post(FIREBASE_AUTH_URL, json={
            "email": email,
            "password": password,
            'returnSecureToken': True
        })
        response.raise_for_status()
        if response.status_code == 200:
            user = auth.get_user_by_email(email) # To get the status whether user is verified or not.
            
            # Block to check the verifitcation.
            if not user.email_verified:
                return error_response("EMAIL_NOT_VERIFIED", "Email not verified") 
            
            response = response.json()
            id_token = response["idToken"]
            uid = response["localId"]
            # SAVE INFORMATION TO SESSION HERE:
            session["uid"] = uid
            session["email"] = email
            # SAVE SOMETHING TO DATABASE HERE:
            return jsonify({
                "message": "Login successful",
                "uid": uid,
                "email": email,
                "id_token": id_token
            }), 200
            
    except requests.exceptions.HTTPError as err:
        if err.response.status_code == 400:
            error_data = err.response.json()
            error_message = error_data.get("error", {}).get("message")

            if error_message == "EMAIL_NOT_FOUND":
                return error_response("EMAIL_NOT_FOUND", "Email not found")
            elif error_message == "INVALID_PASSWORD":
                return error_response("INVALID_PASSWORD", "Invalid password")
            else:
                return error_response("AUTH_FAILED", error_message)
        
        return error_response("AUTH_FAILED", "Authentication failed due to credentials, network or server issues.")
    except Exception:
        return error_response("INTERNAL_ERROR", "Internal server error. Please try again later.")

# THE BLOCK OF CODE FOR PASSWORD RESET:
@app.route("/reset_password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")

    try:
        if not email:
            return error_response("EMAIL_REQUIRED", "Email is required")
        if not is_valid_email(email):
            return error_response("EMAIL_INVALID", "Invalid email format")
        
        # Send the verification link to user.
        user = auth.get_user_by_email(email)
        reset_link = auth.generate_password_reset_link(email)

        if send_reset_password(email, reset_link):
            return jsonify({"message": "Reset password link sent to your email"}), 200
        else:
            return error_response("FAILED", "Please check whether you have typed email correctly.")
    except auth.UserNotFoundError:
        return error_response("EMAIL_NOT_FOUND", "Email not found.")
    except Exception as e:
        return error_response("INTERNAL_ERROR", "Internal server error. Please try again later.")
    
# -------------------- THE BLOCK OF CODE FOR DEVICES REGISTERATION --------------------:
@app.route("/pair_device", methods=["POST"])
def pair_device():
    uid = session.get("uid")
    if not uid:
        return jsonify({"message": "User not authenticated!"}), 401
    
    data = request.get_json()
    device_udid = data.get("device_uid") if data else None
    if not device_udid:
        return jsonify({"message": "Device UDID is required."}), 400

    device_owner_ref = db.reference(f'device_owners/{device_udid}')
    current_owner_uid = device_owner_ref.get()

    if current_owner_uid:
        if current_owner_uid == uid:
            return jsonify({"message": "Device already paired with this user."}), 200
        else:
            return jsonify({"message": "Device already paired with another user"}), 400
    try:
        device_owner_ref.set(uid)
        user_owned_devices_ref = db.reference(f"users/{uid}/owned_iot_devices")
        user_owned_devices_ref.update({
            device_udid: True
        })

        print(f"Device {device_udid} paired with user {uid}")
        return jsonify({"message": "Device paired successfully!", "device_uid": device_udid}), 200
    except Exception as e:
        print(f"[ERROR] Device pairing failed for UID {uid}, UDID {device_udid}: {e}")
        return jsonify({"message": f"Failed to pair device: {str(e)}"}), 500

# -------------------- THE BLOCK OF CODE FOR CREATING QR CODE --------------------:

@app.route("/generate_QR_code", methods=["POST"])
def generate_QR_code():
    data = request.get_json(silent=True)
    device_udid = data.get("device_udid") if data else None
    if not device_udid:
        return jsonify({"message": "Device UDID is required."}), 400

    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(device_udid)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    # Stream QR image to client
    img_io = io.BytesIO()
    img.save(img_io, format="PNG")
    img_io.seek(0)

    return send_file(
        img_io,
        mimetype='image/png',
        as_attachment=True,
        download_name=f"{device_udid}.png"
    )

# THE BLOCK FOR ADDING PILL:
@app.route("/medical_management", methods=["POST"])
def medical_management():
    data = request.get_json()
    uid = session.get("uid") or data.get("uid")
    email = session.get("email") or data.get("email")
    
    if not uid or not email:
        return error_response("UNAUTHORIZED", "User not logged in", 401)
    
    medical_time = data.get("medical_time") 
    medical_duration_days = data.get("medical_duration_days")
    
    try:
        local_time = datetime.datetime.strptime(medical_time, "%H:%M").time()
        utc_plus_7 = datetime.timezone(datetime.timedelta(hours=7))
        today_local = datetime.datetime.now(utc_plus_7).date()
        local_datetime = datetime.datetime.combine(today_local, local_time).astimezone(utc_plus_7)
        utc_time = local_datetime.astimezone(datetime.timezone.utc)  # Convert to UTC
    except ValueError:
        return error_response("INVALID_TIME", "Time must be in HH:MM format", 400)

    try:
        api = GoogleCalendarAPI()
        service = api.authenticate_google_calendar()
        event = {
            'summary': "Take Medication",
            'start': {
                'dateTime': utc_time.isoformat(),
                'timeZone': 'UTC'
            },
            'end': {
                'dateTime': (utc_time + datetime.timedelta(minutes=15)).isoformat(),
                'timeZone': 'UTC'
            },
            'recurrence': [f'RRULE:FREQ=DAILY;COUNT={medical_duration_days}']
        }
        created_event = service.events().insert(calendarId='primary', body=event).execute()

        pill_logs_ref = db.reference(f"users/{uid}/pill_logs")
        instances = service.events().instances(
            calendarId='primary',
            eventId=created_event['id'],
            timeMin=utc_time.isoformat(),
            maxResults=medical_duration_days
        ).execute().get('items', [])

        updates = {}
        for instance in instances:
            instance_time_utc = datetime.datetime.fromisoformat(instance['start']['dateTime'])
            updates[instance['id']] = {
                "googleEventInstanceId": instance['id'],
                "scheduledStartTime": instance_time_utc.isoformat(timespec='seconds').replace('+00:00', 'Z'),
                "isTaken": False,
                "takenAt": None
            }

        pill_logs_ref.update(updates)
        return jsonify({"message": "Schedule created", "event_count": len(instances)}), 200

    except Exception as e:
        return error_response("CALENDAR_ERROR", str(e), 500)

@app.route("/mark_pill_taken", methods=["POST"])
def mark_pill_taken():
    data = request.get_json() or {}
    device_id = data.get("device_id")
    if not device_id:
        return error_response("DEVICE_ID_REQUIRED", "Device ID is required.", 400)
    device_owner_ref = db.reference(f"device_owners/{device_id}")
    uid = device_owner_ref.get()
    if not uid:
        return error_response("UNAUTHORIZED", "User not logged in", 401)

    try:
        utc_now = datetime.datetime.now(datetime.timezone.utc)
        utc_plus_7 = datetime.timezone(datetime.timedelta(hours=7))
        current_time = utc_now.astimezone(utc_plus_7)  

        # Just mathcing ~ 30 mins.
        pill_logs_ref = db.reference(f"users/{uid}/pill_logs")
        all_logs = pill_logs_ref.get() or {}
        
        for instance_id, log in all_logs.items():
            if log.get("isTaken"):
                continue

            scheduled_utc = datetime.datetime.fromisoformat(log["scheduledStartTime"].replace('Z', '+00:00'))
            scheduled_local = scheduled_utc.astimezone(utc_plus_7)  # Convert to UTC+7
            
            time_diff = abs((current_time - scheduled_local).total_seconds() / 60)
            if time_diff <= 30: # THE CODE FOR MATCHING TIME.
                pill_logs_ref.child(instance_id).update({
                    "isTaken": True,
                    "takenAt": current_time.isoformat(timespec='seconds')
                })
                return jsonify({
                    "message": "Pill marked as taken",
                    "scheduled_time": scheduled_local.strftime("%H:%M"),
                    "taken_at": current_time.strftime("%H:%M")
                }), 200

        return error_response("NO_MATCH", "No active pill within ±30 minutes", 400)

    except Exception as e:
        return error_response("SERVER_ERROR", str(e), 500)

if __name__ == "__main__":
    scheduler.start()
    app.run(debug=True)