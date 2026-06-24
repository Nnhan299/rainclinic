from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicalServiceViewSet, TimeSlotViewSet, AppointmentViewSet

router = DefaultRouter()
router.register(r'services', MedicalServiceViewSet, basename='service')
router.register(r'slots', TimeSlotViewSet, basename='slot')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
]
