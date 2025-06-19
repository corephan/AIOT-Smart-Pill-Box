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
from redis import Redis
# PROJECT MODULES
from authentication import check_password, is_valid_email, is_valid_vietnamese_phone_number, is_valid_username
from mail_services import send_email_verification, send_reset_password, send_email
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
utc_plus_7 = datetime.timezone(datetime.timedelta(hours=7))
app.config['SESSION_TYPE'] = 'filesystem'
# app.config['SESSION_REDIS'] = Redis(host='localhost', port=6379, db=0)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
Session(app)

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

FIRST_MIN = 30
SECOND_MIN = 60



def check_pill_reminders():
    with app.app_context():
        now_local = datetime.datetime.now(utc_plus_7)
        users_ref = db.reference("users")
        users = users_ref.get()
        if not users:
            return

        for user_id, user_data in users.items():
            user_info = user_data.get('user_info', {})
            if not user_info:
                continue
            user_email = user_info.get('email', '')
            if not user_email:
                continue

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
                            time_difference = (now_local - scheduled_start_time_local)
                            time_difference_minutes = time_difference.total_seconds() / 60

                            # Flags to track if reminders have been triggered
                            fifteen_min_triggered = log_data.get('fifteen_min_triggered', False)
                            sixty_min_triggered = log_data.get('sixty_min_triggered', False)
                            missed = log_data.get('missed', False)
                            med_name = log_data.get('name', 'Unknown Medication')

                            # Chỉ xử lý event nếu thời điểm hiện tại đã vượt qua scheduled_start_time_local
                            if time_difference_minutes >= FIRST_MIN and time_difference_minutes < SECOND_MIN and not fifteen_min_triggered:
                                users_ref.child(user_id).child('pill_logs').child(log_id).update({'fifteen_min_triggered': True})
                                subject = "Friendly First Reminder: Time to take your medication"
                                body = f"Hi there! This is a friendly reminder that it's time to take your medication: {med_name}. Please make sure to take it as scheduled."
                                send_email(user_email, subject, body)
                                
                                

                            # Đúng 60 phút sau scheduled time, chưa mark thì mới mark
                            elif time_difference_minutes >= SECOND_MIN and not sixty_min_triggered:
                                users_ref.child(user_id).child('pill_logs').child(log_id).update({'missed': False, 'sixty_min_triggered': True})
                                subject = "Friendly Second Reminder: Time to take your medication"
                                body = f"Hi there! This is a friendly reminder that it's time to take your medication: {med_name}. Please make sure to take it as scheduled."
                                send_email(user_email, subject, body)
                                

                            # Sau 115 phút mà chưa mark missed thì mới mark
                            elif time_difference_minutes > 115 and not missed:
                                users_ref.child(user_id).child('pill_logs').child(log_id).update({'missed': True})
                                subject = "MISSED MEDICATION ALERT"
                                body = f"Hi there! This is an important alert that you have missed your medication: {med_name}. Please take it as soon as possible and consult your doctor if needed."
                                send_email(user_email, subject, body)
                                

                        except ValueError as e:
                            print(f"Error processing time for user {user_id}, log {log_id}: {e}")
                        except KeyError as e:
                            print(f"Missing key in data for user {user_id}, log {log_id}: {e}")

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
    except Exception as e:
        print(f"[REGISTER ERROR]: {e}")
        return error_response("INTERNAL_ERROR", "Internal server error. Please try again later!")
    
    try:
        verification_link = auth.generate_email_verification_link(email)
        send_email_verification(email, verification_link, user_name=username, sender_name="Duck's Service")
    except Exception:
        print(f"[EMAIL VERIFICATION ERROR] {e}")

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
        return error_response("AUTHE_FAILED", "Authentication failed due to credentials, network or server issues.")
        
    except Exception as e:
        print(f"[LOGIN ERROR] {e}")
        return error_response("INTERNAL_ERROR", "Internal server error. Please try again later.")

# THE BLOCK OF CODE FOR PASSWORD RESET:
@app.route("/reset_password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return error_response("EMAIL_REQUIRED", "Email is required.")
    if not is_valid_email(email):
        return error_response("EMAIL_INVALID", "Invalid email format")
    
    try:
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
        print(f"[RESET PASSWORD ERROR] {e}")
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

    try:
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
    
    except Exception as e:
        print(f"[QR CODE ERROR] {e}")
        return jsonify({"message": "Failed to generate QR code."}), 500

# -------------------- THE BLOCK OF CODE FOR CREATING QR CODE -------------------- (I don't need this block anymore)
@app.route("/add_patient_list", methods=["POST"])
def add_profile():
    data = request.get_json()
    uid = session.get("uid") or data.get("uid")
    if not uid:
        return error_response("UNAUTHORIZED", "User not logged in", 401)
    name = data.get("name")
    condition = data.get("condition")
    allergic = data.get("allergic", "")
    if not name or not condition:
        return error_response("MISSING_FIELDS", "Name and disease name are required", 400)
    profile_data = {
        "name": name,
        "condition": condition,
        "allergy": allergic,  # <-- Use 'allergy' to match frontend
        "medications": {}
    }
    ref = db.reference(f"users/{uid}/patient_lists")
    new_list_ref = ref.push(profile_data)
    return jsonify({"message": "Patient list added successfully", "list_id": new_list_ref.key}), 201

# THE BLOCK FOR ADDING PILL:
@app.route("/medical_management", methods=["POST"])
def medical_management():
    data = request.get_json()
    uid = session.get("uid") 
    email = session.get("email") 

    if not uid or not email:
        return error_response("UNAUTHORIZED", "User not logged in", 401)
    
    # ---- Medication info ----:
    medical_time = data.get("medical_time") 
    medical_duration_days = data.get("medical_duration_days")
    medical_name = data.get("medical_name")
    medical_note = data.get("note", "")
    dose = data.get("dose")
    list_id = data.get("list_id")  # Optional: for adding to a specific patient list

    if not medical_time or not medical_duration_days or not medical_name or not medical_note or not dose or not list_id:
        return error_response("MISSING_FIELDS", "Medical time, duration, name, note, dose, and list_id are required", 400)
    try:
        medical_duration_days = int(medical_duration_days)
        if medical_duration_days <= 0:
            return error_response("INVALID_DURATION", "Duration must be greater than 0.")
    except Exception:
        return error_response("INVALID_DURATION", "Duration must be an integer greater than 0.")
    
    medication_data = {
        "name": medical_name,
        "dose": dose,
        "time": medical_time,
        "note": medical_note,
        "durationOfDays": medical_duration_days,
        "createdAt": datetime.datetime.now().isoformat()
    }

    if list_id:
        list_med_ref = db.reference(f"users/{uid}/patient_lists/{list_id}/medications")
        list_med_ref.push(medication_data)
    med_ref = db.reference(f"users/{uid}/medical_info/{medical_name}")
    med_ref.set(medication_data)

    try:
        local_time = datetime.datetime.strptime(medical_time, "%H:%M").time()
        utc_plus_7 = datetime.timezone(datetime.timedelta(hours=7))
        today_local = datetime.datetime.now(utc_plus_7).date()
        local_datetime = datetime.datetime.combine(today_local, local_time).replace(tzinfo=utc_plus_7)  # Combine date and time, set to UTC+7
        
    except ValueError:
        return error_response("INVALID_TIME", "Time must be in HH:MM format", 400)

    try:
        api = GoogleCalendarAPI()
        service = api.authenticate_google_calendar()
        event = {
            'summary': f"Medication Reminder: {medical_name}",
            'start': {
                'dateTime': local_datetime.isoformat(),
                'timeZone': 'Asia/Ho_Chi_Minh'
            },
            'end': {
                'dateTime': (local_datetime + datetime.timedelta(minutes=15)).isoformat(),
                'timeZone': 'Asia/Ho_Chi_Minh'
            },
            'recurrence': [f'RRULE:FREQ=DAILY;COUNT={medical_duration_days}'],
            'attendees': [{'email': email}],
        }
        created_event = service.events().insert(calendarId='primary', body=event).execute()

        pill_logs_ref = db.reference(f"users/{uid}/pill_logs")
        instances = service.events().instances(
            calendarId='primary',
            eventId=created_event['id'],
            timeMin=local_datetime.isoformat(),
            maxResults=medical_duration_days
        ).execute().get('items', [])

        updates = {}
        for instance in instances:
            instance_time_utc = datetime.datetime.fromisoformat(instance['start']['dateTime'])
            updates[instance['id']] = {
                "googleEventInstanceId": instance['id'],
                "masterEventId": created_event['id'],
                "name": medical_name,
                "scheduledStartTime": instance_time_utc.isoformat(timespec='seconds').replace('+00:00', 'Z'),
                "isTaken": False,
                "takenAt": None
            }

        pill_logs_ref.update(updates)
        return jsonify({
            "message": "Medication and schedule created",
            "event_count": len(instances)
        }), 201

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

        pill_logs_ref = db.reference(f"users/{uid}/pill_logs")
        all_logs = pill_logs_ref.get() or {}

        for instance_id, log in all_logs.items():
            scheduled_utc = datetime.datetime.fromisoformat(log["scheduledStartTime"].replace('Z', '+00:00'))
            scheduled_local = scheduled_utc.astimezone(utc_plus_7)
            time_diff = abs((current_time - scheduled_local).total_seconds() / 60)
            if time_diff <= 90:
                if log.get("isTaken"):
                    # Send email warning about double-taking
                    user_info = db.reference(f"users/{uid}/user_info").get() or {}
                    user_email = user_info.get("email")
                    med_name = log.get("name", "Unknown Medication")
                    if user_email:
                        subject = "Warning: Duplicate Pill Intake Attempt"
                        body = f"Hi, you have already marked your medication '{med_name}' as taken for this period. Please do not take it again."
                        send_email(user_email, subject, body)
                    return error_response("ALREADY_TAKEN", "Pill already marked as taken for this period.", 400)
                else:
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

@app.route("/get_medications")
def get_medications():
    uid = session.get("uid")
    if not uid:
        return error_response("UNAUTHORIZED", "User not logged in", 401)
    ref = db.reference(f"users/{uid}/medical_info")
    meds = ref.get() or {}
    # Chuyển dict về list cho frontend dễ dùng
    return jsonify({"medications": list(meds.values())}), 200

@app.route("/user_info")
def user_info():
    uid = session.get("uid")
    email = session.get("email")
    if not uid or not email:
        return error_response("UNAUTHORIZED", "User not logged in", 401)
    user_ref = db.reference(f"users/{uid}/user_info")
    user_data = user_ref.get() or {}

    complete_user_data = {
        "uid": uid,
        "email": email,
        "phone_number": user_data.get("phone_number", ""),
        "username": user_data.get("username", ""),
        "phone": user_data.get("phone_number", ""),
    }
    return jsonify(complete_user_data), 200

@app.route("/get_patient_lists", methods=["GET"])
def get_patient_lists():
    uid = session.get("uid")
    if not uid:
        return error_response("UNAUTHORIZED", "User not logged in", 401)
    ref = db.reference(f"users/{uid}/patient_lists")
    lists = ref.get() or {}

    # Convert Firebase dict to array, and ensure 'medications' is always a list
    result = []
    for list_id, list_data in lists.items():
        # Convert medications dict to list, or empty list if not present
        meds = list(list_data.get("medications", {}).values()) if "medications" in list_data else []
        result.append({
            "name": list_data.get("name", ""),
            "condition": list_data.get("condition", ""),
            "allergy": list_data.get("allergy", ""),  # <-- Use 'allergy' to match frontend
            "medications": meds,
            "list_id": list_id  # Useful for frontend to update/delete
        })
    return jsonify({"patient_lists": result}), 200

@app.route("/me")
def me():
    uid = session.get("uid")
    email = session.get("email")
    if not uid or not email:
        return error_response("UNAUTHORIZED", "User not logged in", 401)
    # Fetch user info from Firebase
    ref = db.reference(f"users/{uid}/user_info")
    user_info = ref.get() or {}
    user_info["email"] = email  # Ensure email is always present
    return jsonify({"user": user_info}), 200

@app.route('/news_history', methods=['GET'])
def get_news_history():
    uid = session.get("uid")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    ref = db.reference(f"users/{uid}/news_history")
    history = ref.get() or []
    return jsonify({"history": history}), 200

@app.route('/news_history/clear', methods=['POST'])
def clear_news_history():
    uid = session.get("uid")
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    ref = db.reference(f"users/{uid}/news_history")
    ref.set([])
    return jsonify({"message": "News history cleared"}), 200

@app.route("/delete_patient_list", methods=["POST"])
def delete_patient_list():
    uid = session.get("uid")
    email = session.get("email")
    data = request.get_json()
    list_id = data.get("list_id")
    if not uid or list_id is None:
        return error_response("MISSING_FIELDS", "User or list_id missing", 400)

    # 1. Get all medications in the patient list
    list_ref = db.reference(f"users/{uid}/patient_lists/{list_id}")
    list_data = list_ref.get()
    if not list_data:
        return error_response("NOT_FOUND", "Patient list not found", 404)
    med_names = [med.get("name") for med in list_data.get("medications", {}).values() if med.get("name")]

    # 2. Get all pill logs for this user
    pill_logs_ref = db.reference(f"users/{uid}/pill_logs")
    pill_logs = pill_logs_ref.get() or {}

    # 3. Authenticate Google Calendar
    try:
        api = GoogleCalendarAPI()
        service = api.authenticate_google_calendar()
    except Exception as e:
        print(f"[CALENDAR AUTH ERROR] {e}")
        return error_response("CALENDAR_AUTH_ERROR", "Failed to authenticate with Google Calendar", 500)

    # 4. Delete related calendar events and pill logs
    master_event_ids = set()
    for log_id, log in pill_logs.items():
        med_name = log.get("name")
        if med_name in med_names:
            master_event_id = log.get("masterEventId")
            if master_event_id:
                master_event_ids.add(master_event_id)
            pill_logs_ref.child(log_id).delete()  # Delete all logs for these meds

    for event_id in master_event_ids:
        try:
            service.events().delete(calendarId='primary', eventId=event_id).execute()
            print(f"Deleted calendar event {event_id}")
        except Exception as e:
            print(f"Failed to delete calendar event {event_id}: {e}")

    # 5. Delete the patient list itself
    med_info_ref = db.reference(f"users/{uid}/medical_info")
    for med_name in med_names:
        med_info_ref.child(med_name).delete()
    list_ref.delete()
    return jsonify({"message": "List and related pill reminders deleted"}), 200


@app.route("/delete_medication", methods=["POST"])
def delete_medication():
    uid = session.get("uid")
    data = request.get_json()
    list_id = data.get("list_id")
    med_name = data.get("med_name")
    if not uid or not list_id or not med_name:
        return error_response("MISSING_FIELDS", "User, list_id, or med_name missing", 400)
    meds_ref = db.reference(f"users/{uid}/patient_lists/{list_id}/medications")
    meds = meds_ref.get() or {}

    # Authenticate Google Calendar
    try:
        api = GoogleCalendarAPI()
        service = api.authenticate_google_calendar()
    except Exception as e:
        print(f"[CALENDAR AUTH ERROR] {e}")
        return error_response("CALENDAR_AUTH_ERROR", "Failed to authenticate with Google Calendar", 500)

    # Delete related pill logs and collect master event IDs
    pill_logs_ref = db.reference(f"users/{uid}/pill_logs")
    pill_logs = pill_logs_ref.get() or {}
    master_event_ids = set()
    for log_id, log in pill_logs.items():
        if log.get("name") == med_name:
            master_event_id = log.get("masterEventId")
            if master_event_id:
                master_event_ids.add(master_event_id)
            pill_logs_ref.child(log_id).delete()

    # Delete recurring events from Google Calendar
    for event_id in master_event_ids:
        try:
            service.events().delete(calendarId='primary', eventId=event_id).execute()
            print(f"Deleted calendar event {event_id} for medication {med_name}")
        except Exception as e:
            print(f"Failed to delete calendar event {event_id}: {e}")

    # Delete medication from patient list
    for med_id, med in meds.items():
        if med.get("name") == med_name:
            meds_ref.child(med_id).delete()

    # Remove from user's medical_info
    med_info_ref = db.reference(f"users/{uid}/medical_info/{med_name}")
    med_info_ref.delete()

    return jsonify({"message": "Medication and related reminders deleted"}), 200

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/check_pill', methods = ['POST'])
def run_pill_reminders():
    check_pill_reminders()
    return jsonify({"message": "Pill reminders checked"}), 200

if __name__ == "__main__":
    app.run(debug=True, ssl_context=('cert.pem', 'key.pem'))