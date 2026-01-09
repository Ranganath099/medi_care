from rest_framework import serializers
from .models import Appointment, Prescription
from apps.users.serializers import (
    DoctorProfileReadSerializer,
    DoctorProfileWriteSerializer,
    PatientProfileReadSerializer,
    PatientProfileWriteSerializer
)
from apps.users.models import DoctorProfile, PatientProfile
from django.utils import timezone
from datetime import timedelta



class DoctorSimpleSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    class Meta:
        model = DoctorProfile
        fields = ['id','user','specialization']
    def get_user(self, obj):
        return{'id':obj.user.id,'username':obj.user.username,'first_name':obj.user.first_name,'last_name':obj.user.last_name}

class PatientSimpleSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    class Meta:
        model = PatientProfile
        fields = ['id','user']
    def get_user(self, obj):
        return{'id':obj.user.id,'username':obj.user.username,'first_name':obj.user.first_name,'last_name':obj.user.last_name}
        

class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSimpleSerializer(read_only=True)
    patient = PatientSimpleSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(queryset=DoctorProfile.objects.all(), source='doctor', write_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(queryset=PatientProfile.objects.all(), source='patient', write_only=True, required=False)
    meet_link = serializers.URLField(required=False, allow_null=True)

    class Meta:
        model = Appointment
        fields = ['id','patient','patient_id','doctor','doctor_id','scheduled_time','status','reason','created_at','meet_link','started_at', 'completed_at']
        read_only_fields = ['id','patient','doctor','created_at','started_at', 'completed_at',]

    
    def validate(self, attrs):
        if self.instance:
            allowed_fields = {"status", "meet_link"}
            if set(attrs.keys()).issubset(allowed_fields):
                return attrs

        scheduled_time = attrs.get('scheduled_time')
        doctor = attrs.get('doctor')

        if not scheduled_time:
            raise serializers.ValidationError(
                {"scheduled_time": "Scheduled time is required."}
            )

        now = timezone.now()
        if scheduled_time <= now:
            raise serializers.ValidationError(
                {"scheduled_time": "Scheduled time must be in the future."}
            )

        buffer = timedelta(minutes=30)

        if doctor:
            conflict_qs = Appointment.objects.filter(
                doctor=doctor,
                status__in=["requested", "confirmed"],
                scheduled_time__gte=scheduled_time - buffer,
                scheduled_time__lte=scheduled_time + buffer,
            )
            if self.instance:
                conflict_qs = conflict_qs.exclude(pk=self.instance.pk)

            if conflict_qs.exists():
                raise serializers.ValidationError(
                    {"scheduled_time": "Doctor is not available at the chosen time."}
                )

        return attrs



    def create(self, validated_data):
        patient = validated_data.get('patient', None)
        if not patient:
            request = self.context.get('request', None)
            if request and hasattr(request.user, 'patient_profile'):
                validated_data['patient'] = request.user.patient_profile
            else:
                raise serializers.ValidationError({"patient": "Patient not provided and cannot be inferred from request."})
        return super().create(validated_data)


class PrescriptionSerializer(serializers.ModelSerializer):
    uploaded_by = DoctorSimpleSerializer(read_only=True)
    appointment = AppointmentSerializer(read_only=True)
    appointment_id = serializers.PrimaryKeyRelatedField(queryset=Appointment.objects.all(), source='appointment', write_only=True)
    class Meta:
        model = Prescription
        fields = ['id','appointment','uploaded_by','file','notes','created_at']