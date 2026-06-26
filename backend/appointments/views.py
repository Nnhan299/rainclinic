from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import AllowAny
from .models import Appointment
from .serializers import AppointmentAdminSerializer

# API 7: Lấy danh sách toàn bộ lịch hẹn & Bộ lọc
class AdminAppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentAdminSerializer
    # Tạm thời tắt phân quyền để bạn dễ test nghiệm thu, sau này sẽ bật lại
    # permission_classes = [IsAuthenticated, IsAdminRole] 
    permission_classes = [AllowAny]
    authentication_classes = []

    def get_queryset(self):
        queryset = Appointment.objects.all().order_by('-date', '-created_at')
        
        # Nhận tham số lọc từ URL (VD: ?date=2026-06-25&status=pending)
        date_param = self.request.query_params.get('date')
        status_param = self.request.query_params.get('status')
        search_param = self.request.query_params.get('search')

        if date_param:
            queryset = queryset.filter(date=date_param)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if search_param:
            # Tìm kiếm gần đúng theo tên hoặc email
            queryset = queryset.filter(
                Q(patient__username__icontains=search_param) |
                Q(patient__email__icontains=search_param)
            )
        return queryset

# API 8: Phê duyệt/Xác nhận lịch hẹn
class ConfirmAppointmentView(APIView):
    # permission_classes = [IsAuthenticated, IsAdminRole]
    permission_classes = [AllowAny]
    authentication_classes = []

    def put(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
            if appointment.status != 'pending':
                return Response(
                    {"error": "Chỉ có thể xác nhận lịch hẹn đang chờ duyệt."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            appointment.status = 'confirmed'
            appointment.save()
            return Response({"message": "Đã duyệt thành công!"}, status=status.HTTP_200_OK)
        except Appointment.DoesNotExist:
            return Response({"error": "Không tìm thấy lịch hẹn."}, status=status.HTTP_404_NOT_FOUND)