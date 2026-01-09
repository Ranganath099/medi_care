import json
import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from .models import User, DoctorProfile, PatientProfile
from .serializers import UserRegisterSerializer, UserDetailSerializer, UserUpdateSerializer, CustomTokenObtainPairSerializer
from .permissions import IsSuperUser  
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

    def get_permissions(self):
        if self.action == 'register':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsSuperUser]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'me']:
            return UserDetailSerializer
        if self.action == 'register' or self.action == 'create':
            return UserRegisterSerializer
        return UserRegisterSerializer

    @action(methods=['post'], detail=False, permission_classes=[AllowAny])
    def register(self, request):
        data = request.data.copy()
        role = (data.get('role') or 'patient').lower()

        data['is_doctor'] = role == 'doctor'
        data['is_patient'] = role == 'patient'

        serializer = UserRegisterSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # # Helper: extract nested profile data if present, else fallback to top-level keys
        # def _get_nested(dct, key):
        #     # if payload used nested patient_profile / doctor_profile, use that dict
        #     nested = dct.get(f"{key}_profile") or dct.get(f"{key}Profile") or {}
        #     if isinstance(nested, dict):
        #         return nested
        #     return {}

        # # Create or update profile safely (use provided fields)
        # try:
        #     if role == 'doctor':
        #         doctor_in = _get_nested(data, 'doctor')
        #         doctor_data = {
        #             'specialization': doctor_in.get('specialization') or data.get('specialization') or '',
        #             'bio': doctor_in.get('bio') or data.get('bio') or '',
        #             'phone': doctor_in.get('phone') or data.get('phone') or '',
        #         }
        #         DoctorProfile.objects.update_or_create(user=user, defaults=doctor_data)

        #     if role == 'patient':
        #         patient_in = _get_nested(data, 'patient')
        #         # age: allow integer or None (model field allows null)
        #         raw_age = patient_in.get('age', data.get('age'))
        #         age = None
        #         if raw_age not in (None, '', 'null'):
        #             try:
        #                 age = int(raw_age)
        #             except (TypeError, ValueError):
        #                 age = None

        #         # gender: DB column is NOT NULL (currently), so keep empty string when missing
        #         gender = (patient_in.get('gender') or data.get('gender')) or ''
        #         phone = (patient_in.get('phone') or data.get('phone')) or ''

        #         patient_data = {
        #             'age': age,
        #             'gender': gender,
        #             'phone': phone,
        #         }
        #         PatientProfile.objects.update_or_create(user=user, defaults=patient_data)

        # except Exception as e:
        #     # log server-side for debugging and return a readable error
        #     logger.exception("Failed to create/update profile for new user %s", getattr(user, "id", None))
        #     return Response(
        #         {"detail": "Failed to create user profile", "error": str(e)},
        #         status=status.HTTP_400_BAD_REQUEST,
        #     )

        return Response(
            UserDetailSerializer(user, context={'request': request}).data,
            status=status.HTTP_201_CREATED
            )



@method_decorator(csrf_exempt, name='dispatch')
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]




@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token required"}, status=400)

        try:
            RefreshToken(refresh_token).blacklist()
        except:
            return Response({"detail": "Invalid token"}, status=400)

        return Response({"detail": "Logout successful"}, status=205)

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    # -------------------- GET PROFILE --------------------
    def get(self, request):
        logger.info(
            "MeView GET -- user=%s authenticated=%s active=%s",
            request.user,
            request.user.is_authenticated,
            request.user.is_active,
        )
        serializer = UserDetailSerializer(
            request.user, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    # -------------------- UPDATE PROFILE --------------------
    def put(self, request):
        """
        Handles:
        - JSON updates (user + patient/doctor profile)
        - multipart updates (profile picture)
        - mixed JSON + multipart (FormData with 'data' key)
        """

        # 🔥 IMPORTANT: start with a REAL dict, NOT QueryDict
        data = {}

        # ---------- 1️⃣ Extract JSON payload (if sent) ----------
        raw_json = request.data.get("data")
        if raw_json:
            try:
                data = json.loads(raw_json)
            except Exception as e:
                logger.warning("Invalid JSON in 'data': %s", e)
                data = {}

        # ---------- 2️⃣ Merge top-level simple fields ----------
        # (first_name, last_name, email, etc.)
        for key, value in request.data.items():
            if key == "data":
                continue
            if "." not in key:
                data[key] = value

        # ---------- 3️⃣ Collect nested multipart keys ----------
        def collect_nested(prefix):
            nested = {}

            # collect dotted keys (e.g. patient_profile.age)
            for key, value in request.data.items():
                if key.startswith(prefix):
                    subkey = key[len(prefix):]
                    if isinstance(value, str) and value.strip() == "":
                        continue
                    nested[subkey] = value

            # collect file (profile picture)
            file_key = f"{prefix}profile_picture"
            if file_key in request.FILES:
                nested["profile_picture"] = request.FILES[file_key]

            return nested

        patient_nested = collect_nested("patient_profile.")
        doctor_nested = collect_nested("doctor_profile.")

        if patient_nested:
            data["patient_profile"] = patient_nested

        if doctor_nested:
            data["doctor_profile"] = doctor_nested

        # 🔍 DEBUG (keep temporarily if needed)
        logger.debug("FINAL DATA TO SERIALIZER: %s", data)

        # ---------- 4️⃣ Run serializer ----------
        serializer = UserUpdateSerializer(
            request.user,
            data=data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # ---------- 5️⃣ Return fresh profile ----------
        return Response(
            UserDetailSerializer(
                request.user, context={"request": request}
            ).data,
            status=status.HTTP_200_OK,
        )

    # PATCH behaves same as PUT
    def patch(self, request):
        return self.put(request)
@ensure_csrf_cookie
def get_csrf(request):
    # returns 200 and sets the csrftoken cookie
    return JsonResponse({"detail": "CSRF cookie set"})