from django.core.mail import send_mail
from django.conf import settings
import logging
from typing import Optional

logger = logging.getLogger(__name__)

def send_registration_email(user, otp: Optional[str] = None):
    
    if not getattr(user, "email", None):
        logger.warning("User has no email: %s", getattr(user, "username", "<unknown>"))
        return False

    subject = "Welcome to MediCare — Registration Successful"
    message = f"Hi {user.get_full_name() or user.username},\n\nYour account has been created successfully."

    if otp:
        message += f"\n\nYour verification OTP is: {otp}\nIt will expire in 10 minutes."

    try:
        send_mail(
            subject,
            message,
            getattr(settings, "DEFAULT_FROM_EMAIL", None),
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.exception("Failed to send registration email to %s: %s", user.email, e)
        return False
