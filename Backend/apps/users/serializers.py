from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, DoctorProfile, PatientProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_doctor', 'is_patient']


class DoctorProfileReadSerializer(serializers.ModelSerializer):
    user = UserReadSerializer(read_only=True)
    profile_picture = serializers.ImageField(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'specialization', 'bio', 'phone', 'profile_picture']
    



class PatientProfileReadSerializer(serializers.ModelSerializer):
    user = UserReadSerializer(read_only=True)
    profile_picture = serializers.ImageField(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'age', 'gender', 'phone', 'profile_picture']


class DoctorProfileWriteSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = DoctorProfile
        fields = ['specialization', 'bio', 'phone', 'profile_picture']
        extra_kwargs = {
            'specialization': {'required': False},
            'bio': {'required': False},
            'phone': {'required': False},
        }
    def validate_phone(self, value):
        if not value:
            return value  
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain digits only.")
        if len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value


class PatientProfileWriteSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = PatientProfile
        fields = ['age', 'gender', 'phone', 'profile_picture']
        extra_kwargs = {
            'age': {'required': False},
            'gender': {'required': False},
            'phone': {'required': False},
        }
    def validate_age(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Age cannot be negative.")
        return value

    def validate_phone(self, value):
        if not value:
            return value  
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain digits only.")
        if len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    specialization = serializers.CharField(write_only=True, required=False, allow_blank=True)
    doctor_profile = DoctorProfileWriteSerializer(required=False)
    patient_profile = PatientProfileWriteSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'is_doctor', 'is_patient',
            'doctor_profile', 'patient_profile',  "specialization",
        ]

    def validate(self, attrs):
        is_doc = attrs.get('is_doctor', False)
        is_pat = attrs.get('is_patient', False)
        if is_doc and 'doctor_profile' not in attrs:
            raise serializers.ValidationError({"doctor_profile": "Required when is_doctor is true."})
        if is_pat and 'patient_profile' not in attrs:
            raise serializers.ValidationError({"patient_profile": "Required when is_patient is true."})
        return attrs

    def create(self, validated_data):
        
        doctor_data = validated_data.pop('doctor_profile', None)
        patient_data = validated_data.pop('patient_profile', None)
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if doctor_data:
            DoctorProfile.objects.update_or_create(user=user, defaults = doctor_data)

        if patient_data:
            PatientProfile.objects.update_or_create(user=user, defaults = patient_data)

       

        return user


class UserDetailSerializer(serializers.ModelSerializer):
    doctor_profile = DoctorProfileReadSerializer(read_only=True)
    patient_profile = PatientProfileReadSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_doctor', 'is_patient', 'doctor_profile', 'patient_profile'
        ]
class UserUpdateSerializer(serializers.ModelSerializer):
    doctor_profile = DoctorProfileWriteSerializer(required=False)
    patient_profile = PatientProfileWriteSerializer(required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'doctor_profile', 'patient_profile']
        extra_kwargs = {'email': {'required': False}}

    def update(self, instance, validated_data):
        doctor_data = validated_data.pop('doctor_profile', None)
        patient_data = validated_data.pop('patient_profile', None)

        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if doctor_data is not None:
            DoctorProfile.objects.update_or_create(user=instance, defaults=doctor_data)

        if patient_data is not None:
            PatientProfile.objects.update_or_create(user=instance, defaults=patient_data)

        return instance
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserDetailSerializer(self.user).data  
        return data