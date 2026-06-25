from django.urls import path
from .views import AdminAppointmentListView, ConfirmAppointmentView

urlpatterns = [
    path('appointments/', AdminAppointmentListView.as_view(), name='admin-appointments-list'),
    path('appointments/<int:pk>/confirm/', ConfirmAppointmentView.as_view(), name='admin-appointment-confirm'),
]