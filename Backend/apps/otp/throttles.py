from rest_framework.throttling import SimpleRateThrottle

class OTPSendThrottle(SimpleRateThrottle):
    scope = "otp_send"

    def get_cache_key(self, request, view):
        data = request.data or {}
        target = data.get("target")
        user_id = data.get("user_id")
        ident = target or user_id or self.get_ident(request)
        if not ident:
            return None
        return self.cache_format % {"scope": self.scope, "ident": str(ident)}
