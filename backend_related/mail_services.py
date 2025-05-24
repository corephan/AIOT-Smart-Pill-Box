import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

def send_email(to_email: str, subject: str, body: str) -> bool:
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg['To'] = to_email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_email_verification(email: str, link: str) -> bool:
    subject = "Action required: Verify your email"
    body = f"Hi User,\nWe received a request to verify your email address.\nTo proceed, please click the links below:\n{link}\nIf you did not request this, please ignore this message. Your account will remain secure.\nBest regards,\nDuck"
    return send_email(email, subject, body)

def send_reset_password(email: str, link: str) -> bool:
    subject = "Action required: Reset your password"
    body = f"Hi User,\nWe received a request to verify your email address.\nTo proceed, please click the links below:\n{link}\nIf you did not request this, please ignore this message. Your account will remain secure.\nBest regards,\nDuck"
    return send_email(email, subject, body)
