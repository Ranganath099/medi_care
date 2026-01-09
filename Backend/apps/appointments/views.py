from django.http import FileResponse, Http404
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from django.utils.dateparse import parse_datetime

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Appointment, Prescription
from .serializers import AppointmentSerializer, PrescriptionSerializer
from apps.users.models import DoctorProfile, PatientProfile
from .permissions import IsDoctor, IsPatient


class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DoctorProfile.objects.select_related("user").all()
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        data = [
            {
                "id": d.id,
                "username": d.user.username,
                "first_name": d.user.first_name,
                "last_name": d.user.last_name,
                "specialization": d.specialization,
            }
            for d in self.queryset
        ]
        return Response(data)

def mark_missed_appointments():
    Appointment.objects.filter(
        status="confirmed",
        scheduled_time__lt=timezone.now() - timedelta(minutes=5),
        started_at__isnull=True,
        meet_link__isnull=True,
    ).update(status="missed")


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related('patient__user', 'doctor__user').all()
    serializer_class = AppointmentSerializer

    def get_permissions(self):
        if self.action == 'upload_prescription':
            return [IsDoctor()]

        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsPatient()]

        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsDoctor()]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        patient_profile = getattr(self.request.user, 'patient_profile', None)
        if not patient_profile:
            raise PermissionError("Only patients can create appointments.")
        serializer.save(patient=patient_profile)

    def perform_update(self, serializer):
        appointment = self.get_object()

        doctor_profile = getattr(self.request.user, 'doctor_profile', None)
        if not doctor_profile or appointment.doctor != doctor_profile:
            raise PermissionError("You are not allowed to update this appointment.")

        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsDoctor])
    def upload_prescription(self, request, pk=None):
        appointment = self.get_object()
        file = request.FILES.get('file')
        notes = request.data.get('notes', '')
        pres = Prescription.objects.create(
            appointment=appointment,
            uploaded_by=request.user.doctor_profile,
            file=file,
            notes=notes
        )
        return Response(PrescriptionSerializer(pres, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsDoctor])
    def start_meet(self, request, pk=None):
        appointment = self.get_object()
        now = timezone.now()
        
        start = appointment.scheduled_time
        end = start + timedelta(minutes=30)
        if not (start <= now <= end):
            return Response(
                {
                    "detail": "Meeting can only be started during scheduled time window"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.started_at = timezone.now()
        appointment.status = "confirmed"
        appointment.save()

        return Response({"detail": "Meeting started"})
    
    @action(detail=True, methods=['post'], permission_classes=[IsDoctor])
    def complete_meet(self, request, pk=None):
        appointment = self.get_object()

        appointment.completed_at = timezone.now()
        appointment.status = "completed"
        appointment.save()

        return Response({"detail": "Meeting completed"})
    @action(detail=True, methods=['post'], permission_classes=[IsDoctor])
    def reschedule(self, request, pk=None):
        appointment = self.get_object()

        if appointment.completed_at:
            return Response(
                {"detail": "Only missed or pending appointments can be rescheduled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_time = request.data.get("scheduled_time")
        if not new_time:
            return Response(
                {"detail": "scheduled_time is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        parsed_time = parse_datetime(new_time)
        if not parsed_time:
            return Response(
                {"detail": "Invalid datetime format"},
                status=status.HTTP_400_BAD_REQUEST
            )
        appointment.scheduled_time = parsed_time
        appointment.status = "confirmed"
        appointment.started_at = None
        appointment.completed_at = None
        appointment.meet_link = None 
        appointment.save()

        return Response(
            {"detail": "Appointment rescheduled successfully"},
            status=status.HTTP_200_OK
        )
    @action(detail=True, methods=["post"], permission_classes=[IsDoctor])
    def set_meet_link(self, request, pk=None):
        appointment = self.get_object()
        appointment.meet_link = request.data.get("meet_link")
        appointment.status = "confirmed"
        appointment.started_at = None          
        appointment.completed_at = None 
        appointment.save()
        return Response({"detail": "Meet link saved"})

    
    def create(self, request, *args, **kwargs):
        print("REQUEST DATA:", request.data)
        return super().create(request, *args, **kwargs)


    def list(self, request, *args, **kwargs):
        mark_missed_appointments()   
        return super().list(request, *args, **kwargs)


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.select_related('appointment__patient__user', 'uploaded_by__user').all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]


class PrescriptionDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            pres = Prescription.objects.select_related(
                'appointment__patient__user',
                'uploaded_by__user'
            ).get(pk=pk)
        except Prescription.DoesNotExist:
            raise Http404("Prescription not found")

        user = request.user
        appointment_owner = getattr(pres.appointment.patient, 'user', None)
        uploader_user = getattr(pres.uploaded_by, 'user', None)

        allowed = (
            appointment_owner == user
            or uploader_user == user
            or user.is_staff
            or user.is_superuser
        )
        if not allowed:
            return Response({'detail': 'Not authorized to access this file.'}, status=403)

        if not pres.file:
            raise Http404("File not available")

        file_handle = pres.file.open('rb')
        filename = pres.file.name.split('/')[-1]
        response = FileResponse(file_handle, as_attachment=True, filename=filename)
        return response


class AnalyticsPatientsPerDoctor(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = DoctorProfile.objects.annotate(
            patient_count=Count('appointments__patient', distinct=True)
        ).values('id', 'user__username', 'specialization', 'patient_count')
        return Response(list(data))


class AppointmentsPerDayView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        qs = Appointment.objects.annotate(date=TruncDate('scheduled_time')).values('date').annotate(count=Count('id')).order_by('date')
        return Response(list(qs))
