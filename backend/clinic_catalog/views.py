from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import MedicalService, TimeSlot
from .serializers import MedicalServiceSerializer, TimeSlotSerializer

# --- PHÂN HỆ DỊCH VỤ Y TẾ ---
class ServiceListView(ListAPIView):
    queryset = MedicalService.objects.all().order_by('-id')
    serializer_class = MedicalServiceSerializer
    permission_classes = [AllowAny] # Công khai

class ServiceCreateView(CreateAPIView):
    queryset = MedicalService.objects.all()
    serializer_class = MedicalServiceSerializer
    permission_classes = [IsAuthenticated, IsAdminUser] # Chỉ Admin

class ServiceDeleteView(DestroyAPIView):
    queryset = MedicalService.objects.all()
    serializer_class = MedicalServiceSerializer
    permission_classes = [IsAuthenticated, IsAdminUser] # Chỉ Admin

# --- PHÂN HỆ KHUNG GIỜ KHÁM ---
class TimeSlotListView(ListAPIView):
    queryset = TimeSlot.objects.all().order_by('start_time')
    serializer_class = TimeSlotSerializer
    permission_classes = [AllowAny] # Công khai

class TimeSlotCreateView(CreateAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated, IsAdminUser] # Chỉ Admin

class TimeSlotDeleteView(DestroyAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated, IsAdminUser] # Chỉ Admin