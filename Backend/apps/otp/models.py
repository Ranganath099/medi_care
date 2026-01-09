import secrets
import hashlib
import hmac
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL  

class Verification(models.Model):
    VERIF_TYPE_CHOICES = (
        ("email", "Email"),
        ("phone", "Phone"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verifications")
    verif_type = models.CharField(max_length=10, choices=VERIF_TYPE_CHOICES)
    target = models.CharField(max_length=255)  

    otp_hash = models.CharField(max_length=256, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    max_attempts = models.PositiveSmallIntegerField(default=5)
    used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["user", "verif_type", "target", "created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.verif_type} - {self.target}"

    def generate_otp(self, ttl_minutes: int = 10, length: int = 6) -> str:
        otp_int = secrets.randbelow(10 ** length)
        otp = str(otp_int).zfill(length)

        salt = secrets.token_hex(16)
        digest = hashlib.sha256((salt + otp).encode("utf-8")).hexdigest()
        self.otp_hash = f"{salt}${digest}"
        self.expires_at = timezone.now() + timedelta(minutes=ttl_minutes)
        self.attempts = 0
        self.used = False
        # save only these fields
        self.save(update_fields=["otp_hash", "expires_at", "attempts", "used"])
        return otp

    def is_expired(self) -> bool:
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    def verify_otp(self, code: str):
        if self.used:
            return False, "already_used"
        if self.is_expired():
            return False, "expired"
        if self.attempts >= (self.max_attempts or 5):
            return False, "too_many_attempts"

        try:
            salt, stored_digest = self.otp_hash.split("$")
        except Exception:
            return False, "invalid"

        computed = hashlib.sha256((salt + str(code)).encode("utf-8")).hexdigest()
        self.attempts += 1

        ok = hmac.compare_digest(computed, stored_digest)
        if ok:
            self.used = True
            self.save(update_fields=["attempts", "used"])
            return True, "verified"

        self.save(update_fields=["attempts"])
        return False, "invalid"
