from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from clinic.models import MedicalService, TimeSlot, Appointment
import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Pre-populates the database with default Medical Services, Time Slots, and Mock Users/Appointments.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # 1. Create Default Users (if not exists)
        # Patient
        patient_user, p_created = User.objects.get_or_create(
            username='patient',
            defaults={
                'email': 'patient@rainclinic.med',
                'full_name': 'Jane Doe',
                'phone': '+1 (555) 234-5678',
                'role': 'patient'
            }
        )
        if p_created:
            patient_user.set_password('patient123')
            patient_user.save()
            self.stdout.write(self.style.SUCCESS('Created patient user: username: patient / password: patient123'))

        # Admin
        admin_user, a_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@rainclinic.med',
                'full_name': 'Dr. Arthur Rain',
                'phone': '+1 (555) 987-6543',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if a_created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user: username: admin / password: admin123'))

        # 2. Create Services
        services_data = [
            {
                'id': 'srv-1',
                'name': 'Khám Sức khỏe Tổng quát',
                'category': 'Y học Gia đình',
                'duration_min': 30,
                'price': 45,
                'doctor_name': 'BS. Evelyn Reed',
                'description': 'Kiểm tra sức khỏe tổng quát toàn diện, khám lâm sàng và quản lý đơn thuốc.',
            },
            {
                'id': 'srv-2',
                'name': 'Tầm soát Tim mạch',
                'category': 'Khoa Tim mạch',
                'duration_min': 45,
                'price': 120,
                'doctor_name': 'BS. Marcus Sterling',
                'description': 'Đánh giá tim mạch nâng cao, đo điện tâm đồ (ECG) và theo dõi huyết áp.',
            },
            {
                'id': 'srv-3',
                'name': 'Khám sức khỏe Nhi khoa',
                'category': 'Khoa Nhi',
                'duration_min': 30,
                'price': 50,
                'doctor_name': 'BS. Sarah Jenkins',
                'description': 'Theo dõi sự phát triển thể chất, đánh giá tiêm chủng và tư vấn chăm sóc sức khỏe trẻ em.',
            },
            {
                'id': 'srv-4',
                'name': 'Khám Cơ Xương Khớp',
                'category': 'Chấn thương Chỉnh hình',
                'duration_min': 45,
                'price': 95,
                'doctor_name': 'BS. Thomas Vance',
                'description': 'Tư vấn các bệnh đau khớp, tư thế cột sống, sức khỏe xương khớp và phục hồi chấn thương.',
            },
            {
                'id': 'srv-5',
                'name': 'Khám Chuyên khoa Da liễu',
                'category': 'Khoa Da liễu',
                'duration_min': 30,
                'price': 75,
                'doctor_name': 'BS. Chloe Winters',
                'description': 'Khám và tư vấn chuyên sâu về da, mụn trứng cá, tầm soát nốt ruồi và kế hoạch điều trị chàm da.',
            },
        ]

        services_map = {}
        for s in services_data:
            obj, created = MedicalService.objects.get_or_create(
                name=s['name'],
                defaults={
                    'category': s['category'],
                    'duration_min': s['duration_min'],
                    'price': s['price'],
                    'doctor_name': s['doctor_name'],
                    'description': s['description']
                }
            )
            services_map[s['id']] = obj
            if created:
                self.stdout.write(f"Created Service ID: {obj.pk}")

        # 3. Create Time Slots
        time_slots_data = [
            '08:00 - 09:00',
            '09:00 - 10:00',
            '10:00 - 11:00',
            '11:00 - 12:00',
            '13:00 - 14:00',
            '14:00 - 15:00',
            '15:00 - 16:00',
            '16:00 - 17:00'
        ]

        for t in time_slots_data:
            obj, created = TimeSlot.objects.get_or_create(
                time=t,
                defaults={'is_available': True}
            )
            if created:
                self.stdout.write(f"Created TimeSlot: {obj.pk}")

        # 4. Create Appointments
        appointments_data = [
            {
                'patient': patient_user,
                'patient_name': 'Nguyễn Văn A',
                'patient_phone': '+84 912 345 678',
                'service': services_map['srv-1'],
                'date': datetime.date(2026, 6, 25),
                'time_slot': '09:00 - 10:00',
                'symptoms': 'Khám sức khỏe định kỳ và kiểm tra tổng quát theo yêu cầu của cơ quan.',
                'status': 'confirmed',
            },
            {
                'patient': patient_user,
                'patient_name': 'Nguyễn Văn A',
                'patient_phone': '+84 912 345 678',
                'service': services_map['srv-2'],
                'date': datetime.date(2026, 6, 26),
                'time_slot': '14:00 - 15:00',
                'symptoms': 'Cảm thấy khó thở nhẹ khi đi bộ tập thể dục buổi sáng và thỉnh thoảng tức ngực nhẹ.',
                'status': 'pending',
            },
            {
                'patient': None,
                'patient_name': 'Trần Thị B',
                'patient_phone': '+84 905 123 456',
                'service': services_map['srv-3'],
                'date': datetime.date(2026, 6, 25),
                'time_slot': '10:00 - 11:00',
                'symptoms': 'Khám sức khỏe định kỳ cho bé và tư vấn dinh dưỡng, mốc phát triển thể chất.',
                'status': 'confirmed',
            },
            {
                'patient': None,
                'patient_name': 'Lê Văn C',
                'patient_phone': '+84 988 777 666',
                'service': services_map['srv-4'],
                'date': datetime.date(2026, 6, 27),
                'time_slot': '11:00 - 12:00',
                'symptoms': 'Cổ chân trái sưng đau đột ngột sau khi chơi bóng đá chiều hôm qua.',
                'status': 'pending',
            },
            {
                'patient': None,
                'patient_name': 'Phạm Minh D',
                'patient_phone': '+84 977 111 222',
                'service': services_map['srv-5'],
                'date': datetime.date(2026, 6, 24),
                'time_slot': '16:00 - 17:00',
                'symptoms': 'Bệnh chàm khô mãn tính tái phát ở cẳng tay gây ngứa ngáy và bong tróc da.',
                'status': 'cancelled',
            }
        ]

        for apt in appointments_data:
            obj, created = Appointment.objects.get_or_create(
                patient_name=apt['patient_name'],
                date=apt['date'],
                time_slot=apt['time_slot'],
                defaults={
                    'patient': apt['patient'],
                    'patient_phone': apt['patient_phone'],
                    'service': apt['service'],
                    'symptoms': apt['symptoms'],
                    'status': apt['status']
                }
            )
            if created:
                self.stdout.write(f"Created Appointment ID: {obj.pk}")

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
