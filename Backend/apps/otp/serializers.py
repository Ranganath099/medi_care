from rest_framework import serializers

class SendOTPSerializer(serializers.Serializer):
    verif_type = serializers.ChoiceField(choices=["email", "phone"])
    target = serializers.CharField()
    user_id = serializers.IntegerField(required=False)  

class VerifyOTPSerializer(serializers.Serializer):
    verif_type = serializers.ChoiceField(choices=["email", "phone"])
    target = serializers.CharField()
    otp = serializers.CharField(max_length=6)
