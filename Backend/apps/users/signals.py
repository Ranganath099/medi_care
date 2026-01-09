from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, DoctorProfile, PatientProfile
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def create_profile_for_user(sender, instance, created, **kwargs):
    
    if not created:
        return

    try:
        if getattr(instance, 'is_doctor', False):
            DoctorProfile.objects.get_or_create(user=instance)
            logger.debug("Ensured DoctorProfile exists for user %s", instance.username)

        if getattr(instance, 'is_patient', False):
            PatientProfile.objects.get_or_create(user=instance)
            logger.debug("Ensured PatientProfile exists for user %s", instance.username)
    except Exception as e:
        logger.exception("Error creating profile for user %s: %s", instance.username, e)
