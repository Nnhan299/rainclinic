from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from .models import Appointment, MedicalService, TimeSlot

User = get_user_model()


@override_settings(ALLOWED_HOSTS=['testserver', 'localhost', '127.0.0.1'])
class AppointmentCreationTests(TestCase):
    def test_patient_can_create_appointment_without_sending_patient_id(self):
        user = User.objects.create_user(
            username='patient1',
            password='Testpass123',
            role='patient',
        )
        service = MedicalService.objects.create(
            name='Khám tổng quát',
            description='Test service',
            category='General',
            price='100000',
            doctor_name='BS. Test',
            duration_minutes=30,
        )
        time_slot = TimeSlot.objects.create(
            start_time='09:00:00',
            end_time='09:30:00',
        )

        client = APIClient()
        client.force_authenticate(user=user)

        response = client.post('/api/appointments/create/', {
            'service': service.id,
            'time_slot': time_slot.id,
            'appointment_date': '2026-06-25',
            'symptoms': 'Đau đầu',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Appointment.objects.count(), 1)
        appointment = Appointment.objects.get()
        self.assertEqual(appointment.patient, user)
        self.assertEqual(appointment.service, service)
        self.assertEqual(appointment.time_slot, time_slot)
