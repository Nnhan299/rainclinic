"""
URL patterns cho các API clinic (services, time-slots, appointments).
"""

from django.urls import path
from . import views

urlpatterns = [
    # Services (Member 2)
    path('services/', views.ServiceListView.as_view(), name='service-list'),
    path('admin/services/', views.ServiceCreateView.as_view(), name='service-create'),
    path('admin/services/<int:pk>/', views.ServiceDeleteView.as_view(), name='service-delete'),

    # Time slots (Member 2)
    path('time-slots/', views.TimeSlotListView.as_view(), name='timeslot-list'),
    path('admin/time-slots/', views.TimeSlotCreateView.as_view(), name='timeslot-create'),
    path('admin/time-slots/<int:pk>/', views.TimeSlotDeleteView.as_view(), name='timeslot-delete'),

    # Appointments (Member 3)
    path('appointments/', views.PatientAppointmentListView.as_view(), name='patient-appointment-list'),
    path('appointments/book/', views.BookAppointmentView.as_view(), name='appointment-book'),
    path('appointments/<int:pk>/cancel/', views.CancelAppointmentView.as_view(), name='appointment-cancel'),

    # Appointments (Member 4)
    path('admin/appointments/', views.AdminAppointmentListView.as_view(), name='admin-appointment-list'),
    path('admin/appointments/<int:pk>/confirm/', views.ConfirmAppointmentView.as_view(), name='appointment-confirm'),
]
