from django.db import models
from apps.users.models import DoctorProfile, PatientProfile


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('requested','Requested'),
        ('confirmed','Confirmed'),
        ('completed','Completed'),
        ('cancelled','Cancelled'),
        ('pending', 'Pending'),
        ('missed','Missed'),
    ]
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    scheduled_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    reason = models.TextField(blank=True, null=True)
    meet_link = models.URLField(null=True, blank=True)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-scheduled_time']
    def __str__(self):
        return f"Appointment: {self.patient} with {self.doctor} at {self.scheduled_time}"


class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription')
    uploaded_by = models.ForeignKey(DoctorProfile, on_delete=models.SET_NULL, null=True)
    file = models.FileField(upload_to='prescriptions/')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)