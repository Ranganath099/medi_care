from django.core.mail import send_mail
from django.conf import settings
import logging
import requests
from typing import Tuple, Optional

logger = logging.getLogger(__name__)


def send_email_otp(to_email: str, otp: str) -> Tuple[bool, Optional[str]]:
    subject = "Your verification code"
    message = f"Your verification code is: {otp}"
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None)
    try:
        send_mail(subject, message, from_email, [to_email], fail_silently=False)
        return True, None
    except Exception as e:
        logger.exception("Failed to send email OTP")
        return False, str(e)


def send_sms_otp(phone: str, otp: str) -> Tuple[bool, Optional[str]]:
   
    api_key = getattr(settings, "SMS_API_KEY", None)
    if not api_key:
        return False, "sms_not_configured"

    url = "https://www.fast2sms.com/dev/bulkV2"
    payload = {
        "message": f"Your verification code is: {otp}",
        "language": "english",
        "route": "q",
        "numbers": phone,
    }
    headers = {
        "authorization": api_key,
        "Content-Type": "application/json"
    }

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=10)
        if resp.status_code == 200:
            return True, None
        return False, f"{resp.status_code}: {resp.text}"
    except Exception as e:
        logger.exception("Failed to send SMS OTP")
        return False, str(e)
