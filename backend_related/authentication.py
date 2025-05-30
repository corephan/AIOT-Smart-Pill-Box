import re
import string 
import smtplib 
from email.mime.text import MIMEText

def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email) is not None

def check_password(password, confirm_password=None):
    if confirm_password and password != confirm_password:
        return "Password and confirm password do not match."
    if len(password) <= 6:
        return "Password must be longer than 6 characters."
    if not any(char in string.punctuation for char in password):
        return "Password must contain at least one special character."
    return None

def is_valid_vietnamese_phone_number(phone_number: str) -> bool:
    pattern = r'^(03|05|07|08|09)\d{8}$'
    return bool(re.match(pattern, phone_number))

def is_valid_username(username: str) -> bool:
    if len(username) > 10:
        return False
    
    pattern = r'^[\w\sÀ-ỹà-ỹ]+$'
    
    return bool(re.match(pattern, username, re.UNICODE))