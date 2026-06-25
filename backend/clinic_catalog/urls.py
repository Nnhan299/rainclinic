from django.urls import path
from .views import (
    ServiceListView, ServiceCreateView, ServiceDeleteView,
    TimeSlotListView, TimeSlotCreateView, TimeSlotDeleteView,
    AppointmentListView, AppointmentCreateView, AppointmentUpdateView, AppointmentDeleteView
)

urlpatterns = [
    # Services Endpoints
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('admin/services/', ServiceCreateView.as_view(), name='service-create'),
    path('admin/services/<int:pk>/', ServiceDeleteView.as_view(), name='service-delete'),

    # Time Slots Endpoints (Đã đổi từ dấu gạch nối '-' sang gạch dưới '_' để đồng bộ với Frontend)
    path('time_slots/', TimeSlotListView.as_view(), name='timeslot_list'),
    path('admin/time_slots/', TimeSlotCreateView.as_view(), name='timeslot_create'),
    path('admin/time_slots/<int:pk>/', TimeSlotDeleteView.as_view(), name='timeslot_delete'),

    # Appointments Endpoints
    path('appointments/', AppointmentListView.as_view(), name='appointment-list'),
    path('appointments/create/', AppointmentCreateView.as_view(), name='appointment-create'),
    path('appointments/<int:pk>/update/', AppointmentUpdateView.as_view(), name='appointment-update'),
    path('appointments/<int:pk>/delete/', AppointmentDeleteView.as_view(), name='appointment-delete'),
]