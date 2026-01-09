from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Verification
from .serializers import SendOTPSerializer, VerifyOTPSerializer
from .utils import send_email_otp, send_sms_otp
from .throttles import OTPSendThrottle

User = get_user_model()

class SendOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [OTPSendThrottle, AnonRateThrottle]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verif_type = serializer.validated_data["verif_type"]
        target = serializer.validated_data["target"]
        user_id = serializer.validated_data.get("user_id")

        if not user_id:
            return Response(
                {"detail": "Provide user_id to request OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        verif = Verification.objects.create(user=user, verif_type=verif_type, target=target)
        otp = verif.generate_otp(ttl_minutes=getattr(settings, "OTP_TTL_MINUTES", 10))

        sent = False
        error = None
        if verif_type == "email":
            sent, error = send_email_otp(target, otp)
        else:
            sent, error = send_sms_otp(target, otp)

        if sent:
            return Response({"detail": "If the account exists, an OTP has been sent."}, status=status.HTTP_200_OK)
        return Response({"detail": "Failed to send OTP."}, status=status.HTTP_502_BAD_GATEWAY)


class VerifyOTPView(APIView):
    """
    POST /api/otp/verify/
    Body: { "verif_type": "email"|"phone", "target": "...", "otp": "123456" }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verif_type = serializer.validated_data["verif_type"]
        target = serializer.validated_data["target"]
        otp = serializer.validated_data["otp"]

        verif = Verification.objects.filter(verif_type=verif_type, target=target).order_by("-created_at").first()
        if not verif:
            return Response({"detail": "Verification not found."}, status=status.HTTP_404_NOT_FOUND)

        ok, reason = verif.verify_otp(otp)
        if not ok:
            if reason == "expired":
                return Response({"detail": "OTP expired. Request a new OTP."}, status=status.HTTP_400_BAD_REQUEST)
            if reason == "too_many_attempts":
                return Response({"detail": "Too many attempts."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            if reason == "already_used":
                return Response({"detail": "OTP already used."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

        user = verif.user
        changed = False
        if verif_type == "email" and hasattr(user, "email_verified"):
            user.email_verified = True
            changed = True
        if verif_type == "phone" and hasattr(user, "phone_verified"):
            user.phone_verified = True
            changed = True
        if changed:
            user.save(update_fields=[f"{verif_type}_verified"])

        return Response({"detail": f"{verif_type} verified."}, status=status.HTTP_200_OK)
