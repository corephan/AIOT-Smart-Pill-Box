import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER: str = os.getenv("SMTP_SERVER", "")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "")
SENDER_PASSWORD: str = os.getenv("SENDER_PASSWORD", "")

VERIFICATION_EMAIL_SUBJECT = "Action Required: Verify Your Email Address"
VERIFICATION_EMAIL_BODY_TEMPLATE = """Hi {user_name},

We received a request to verify your email address for your account.
To proceed, please click the link below:

{link}

If you did not request this, please ignore this message. Your account will remain secure.

Best regards,
{sender_name}
"""

RESET_PASSWORD_SUBJECT = "Action Required: Reset Your Password"
RESET_PASSWORD_BODY_TEMPLATE = """Hi {user_name},

We received a request to reset your password.
To proceed, please click the link below:

{link}

If you did not request this, please ignore this message. Your account will remain secure.

Best regards,
{sender_name}
"""

def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Send an email using SMTP.
    Returns True if sent successfully, False otherwise.
    """
    if not all([SMTP_SERVER, SENDER_EMAIL, SENDER_PASSWORD]):
        return False

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
    except Exception:
        return False

def send_email_verification(
    email: str,
    link: str,
    user_name: str = "User",
    sender_name: str = "Your Team"
) -> bool:
    """
    Send an email verification link to the user.
    """
    body = VERIFICATION_EMAIL_BODY_TEMPLATE.format(
        user_name=user_name, link=link, sender_name=sender_name
    )
    return send_email(email, VERIFICATION_EMAIL_SUBJECT, body)

def send_reset_password(
    email: str,
    link: str,
    user_name: str = "User",
    sender_name: str = "Your Team"
) -> bool:
    """
    Send a password reset link to the user.
    """
    body = RESET_PASSWORD_BODY_TEMPLATE.format(
        user_name=user_name, link=link, sender_name=sender_name
    )
    return send_email(email, RESET_PASSWORD_SUBJECT, body)