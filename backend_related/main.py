# SOME STANDARD LIBRARY
import re
import string
from datetime import timedelta
import smtplib
from email.mime.text import MIMEText

# FLASK AND FIREBASE LIBRARY
import bcrypt
import requests
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_session import Session
from firebase_admin import auth, credentials, db, firestore, initialize_app

# PROJECT MODULES
from authentication import check_password, is_valid_email
from mail_services import send_email_verification, send_reset_password

# DECLARATION SOME NESSCARY THINGS:
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = "no_one_knows_this_secret_key"
app.permanent_session_lifetime = timedelta(days=365)

# DECALARATION FOR DATABASE-RELATED:
cred = credentials.Certificate('key.json')
initialize_app(cred)
FIREBASE_AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAAftkUDGwBx0oyV3mWRp9VYrhxdk6gdeI"
db = firestore.client()

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

# THE BLOCK OF CODE USED FOR REGISTERATION:
@app.route("/register", methods = ["POST"])
def register():
    data = request.get_json() or {}
    email = data["email"]
    password = data["password"]

    # Check validation of email and password:
    if not email:
        return error_response("EMAIL_REQUIRED", "Email is required")
    if not is_valid_email(email):
        return error_response("EMAIL_INVALID", "Invalid email format")
    if not password:
        return error_response("PASSWORD_REQUIRED", "Password is required")
    if check_password(password):
        return error_response("PASSWORD_INVALID", "Password does not meet security requirements.")
    
    if not email or not password:
        return jsonify({"message": "Email or password are required"}), 400
    try:
        user = auth.create_user(email=email, password=password)
    except auth.EmailAlreadyExistsError:
        return error_response("EMAIL_ALREADY_EXISTS", "Email already exists")
    except Exception:
        return error_response("INTERNAL_ERROR", "Internal server error. Please try again later.")
    try:
        verification_link = auth.generate_email_verification_link(email)
        send_email_verification(email, verification_link)
    except Exception:
        # If fail -> Still allow to register
        pass 
    # Save something to session:

    # Save something to the database:

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

    # Check validation of email and password:
    if not email:
        return error_response("EMAIL_REQUIRED", "Email is required")
    if not is_valid_email(email):
        return error_response("EMAIL_INVALID", "Invalid email format")
    if not password:
        return error_response("PASSWORD_REQUIRED", "Password is required")
    if not is_valid_email(email):
        return error_response("EMAIL_INVALID", "Invalid email format")

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
            if error_data.get("error", {}).get("message") == "EMAIL_NOT_FOUND":
                return error_response("EMAIL_NOT_FOUND", "Email not found")
        return error_response("AUTH_FAILED", "Invalid email or password")
    except Exception as e:
        app.logger.error(f"Error during login: {e}")
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
    
# THE BLOCK OF CODE TO HANDLE OTP-AUTHENTICATION:
@app.route('/OTP_login', methods=['POST'])
def firebase_login():
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({'error': 'Missing or invalid token'}), 401

    id_token = auth_header.split(' ')[1]

    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        phone_number = decoded_token.get('phone_number')
        return jsonify({'message': f'Logged in as UID {uid}', 'phone': phone_number}), 200
    except Exception as e:
        return jsonify({'error': 'Token verification failed', 'details': str(e)}), 403

if __name__ == "__main__":
    app.run(debug=True)