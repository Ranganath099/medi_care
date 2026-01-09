from django.contrib import admin
from .models import User,DoctorProfile,PatientProfile



@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'is_doctor', 'is_patient')
    search_fields = ('username', 'email')

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'specialization', 'phone')
    search_fields = ('user__username', 'specialization')


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'age', 'gender', 'phone')
    search_fields = ('user__username',)


