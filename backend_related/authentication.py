import re
import string 

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
VIETNAMESE_PHONE_NUMBER_REGEX = r'^(03|05|07|08|09)\d{8}$'
USERNAME_REGEX = r'^[\w\sÀ-ỹà-ỹ]+$' 

# --- PASSWORD VALIDATION ---
PASSWORD_MIN_LENGTH = 8 
PASSWORD_HAS_DIGIT_REGEX = r'\d'
PASSWORD_HAS_UPPERCASE_REGEX = r'[A-Z]'
PASSWORD_HAS_LOWERCASE_REGEX = r'[a-z]'
PASSWORD_HAS_SPECIAL_CHAR_REGEX = f"[{re.escape(string.punctuation)}]"

# --- VALIDATION FUNCTIONS ---

def is_valid_email(email: str) -> bool:
    return bool(re.fullmatch(EMAIL_REGEX, email))

def check_password(password: str) -> str | None:
    
    if len(password) < PASSWORD_MIN_LENGTH:
        return f"Password must be at least {PASSWORD_MIN_LENGTH} characters long."
    
    if not re.search(PASSWORD_HAS_DIGIT_REGEX, password):
        return "Password must contain at least one digit."
    
    if not re.search(PASSWORD_HAS_UPPERCASE_REGEX, password):
        return "Password must contain at least one uppercase letter."
    
    if not re.search(PASSWORD_HAS_LOWERCASE_REGEX, password):
        return "Password must contain at least one lowercase letter."
    
    if not re.search(PASSWORD_HAS_SPECIAL_CHAR_REGEX, password):
        return "Password must contain at least one special character."
    
    return None

def is_valid_vietnamese_phone_number(phone_number: str) -> bool:
    return bool(re.fullmatch(VIETNAMESE_PHONE_NUMBER_REGEX, phone_number))

def is_valid_username(username: str) -> bool:
    MAX_USERNAME_LENGTH = 10
    if len(username) > MAX_USERNAME_LENGTH:
        return False
    
    return bool(re.fullmatch(USERNAME_REGEX, username, re.UNICODE))