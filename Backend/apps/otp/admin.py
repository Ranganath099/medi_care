from django.contrib import admin
from .models import Verification

@admin.register(Verification)
class VerificationAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "verif_type",
        "target",
        "used",          
        "attempts",
        "created_at",
        "expires_at",
    )
    list_filter = ("verif_type", "used")   
    search_fields = ("target", "user__username", "user__email")
