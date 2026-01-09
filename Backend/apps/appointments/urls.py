from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, PrescriptionViewSet, AnalyticsPatientsPerDoctor, AppointmentsPerDayView, DoctorViewSet

app_name = 'appointments'

router = DefaultRouter()
router.register(r'', AppointmentViewSet, basename='appointments')

router.register(r'prescriptions', PrescriptionViewSet, basename='prescriptions')
router.register(r'doctors', DoctorViewSet, basename='doctors')

urlpatterns = [
    path('doctors/', DoctorViewSet.as_view({'get': 'list'}), name='doctor-list'),
    path('', include(router.urls)),
    path('analytics/patients-per-doctor/', AnalyticsPatientsPerDoctor.as_view(), name='patients_per_doctor'),
    path('analytics/appointments-per-day/', AppointmentsPerDayView.as_view(), name='appointments_per_day'),
]
