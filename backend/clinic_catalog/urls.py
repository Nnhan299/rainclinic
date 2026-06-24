from django.urls import path
from .views import (
    ServiceListView, ServiceCreateView, ServiceDeleteView,
    TimeSlotListView, TimeSlotCreateView, TimeSlotDeleteView
)

urlpatterns = [
    # Services Endpoints
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('admin/services/', ServiceCreateView.as_view(), name='service-create'),
    path('admin/services/<int:pk>/', ServiceDeleteView.as_view(), name='service-delete'),

    # Time Slots Endpoints
    path('time-slots/', TimeSlotListView.as_view(), name='timeslot-list'),
    path('admin/time-slots/', TimeSlotCreateView.as_view(), name='timeslot-create'),
    path('admin/time-slots/<int:pk>/', TimeSlotDeleteView.as_view(), name='timeslot-delete'),
]