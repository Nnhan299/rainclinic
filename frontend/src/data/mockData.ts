/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MedicalService, TimeSlot, Appointment, User } from '../types';

export const DEFAULT_SERVICES: MedicalService[] = [
  {
    id: 'srv-1',
    name: 'Khám Sức khỏe Tổng quát',
    category: 'Y học Gia đình',
    durationMin: 30,
    price: 45,
    doctorName: 'BS. Evelyn Reed',
    description: 'Kiểm tra sức khỏe tổng quát toàn diện, khám lâm sàng và quản lý đơn thuốc.',
  },
  {
    id: 'srv-2',
    name: 'Tầm soát Tim mạch',
    category: 'Khoa Tim mạch',
    durationMin: 45,
    price: 120,
    doctorName: 'BS. Marcus Sterling',
    description: 'Đánh giá tim mạch nâng cao, đo điện tâm đồ (ECG) và theo dõi huyết áp.',
  },
  {
    id: 'srv-3',
    name: 'Khám sức khỏe Nhi khoa',
    category: 'Khoa Nhi',
    durationMin: 30,
    price: 50,
    doctorName: 'BS. Sarah Jenkins',
    description: 'Theo dõi sự phát triển thể chất, đánh giá tiêm chủng và tư vấn chăm sóc sức khỏe trẻ em.',
  },
  {
    id: 'srv-4',
    name: 'Khám Cơ Xương Khớp',
    category: 'Chấn thương Chỉnh hình',
    durationMin: 45,
    price: 95,
    doctorName: 'BS. Thomas Vance',
    description: 'Tư vấn các bệnh đau khớp, tư thế cột sống, sức khỏe xương khớp và phục hồi chấn thương.',
  },
  {
    id: 'srv-5',
    name: 'Khám Chuyên khoa Da liễu',
    category: 'Khoa Da liễu',
    durationMin: 30,
    price: 75,
    doctorName: 'BS. Chloe Winters',
    description: 'Khám và tư vấn chuyên sâu về da, mụn trứng cá, tầm soát nốt ruồi và kế hoạch điều trị chàm da.',
  },
];

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: 'ts-1', time: '08:00 - 09:00', isAvailable: true },
  { id: 'ts-2', time: '09:00 - 10:00', isAvailable: true },
  { id: 'ts-3', time: '10:00 - 11:00', isAvailable: false }, // pre-booked in some test cases
  { id: 'ts-4', time: '11:00 - 12:00', isAvailable: true },
  { id: 'ts-5', time: '13:00 - 14:00', isAvailable: true },
  { id: 'ts-6', time: '14:00 - 15:00', isAvailable: false }, // pre-booked in some test cases
  { id: 'ts-7', time: '15:00 - 16:00', isAvailable: true },
  { id: 'ts-8', time: '16:00 - 17:00', isAvailable: true },
];

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'patient',
    email: 'patient@rainclinic.med',
    fullName: 'Jane Doe',
    phone: '+1 (555) 234-5678',
    role: 'patient',
  },
  {
    id: 'usr-2',
    username: 'admin',
    email: 'admin@rainclinic.med',
    fullName: 'Dr. Arthur Rain',
    phone: '+1 (555) 987-6543',
    role: 'admin',
  }
];

export const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'usr-1',
    patientName: 'Nguyễn Văn A',
    patientPhone: '+84 912 345 678',
    serviceId: 'srv-1',
    serviceName: 'Khám Sức khỏe Tổng quát',
    doctorName: 'BS. Evelyn Reed',
    date: '2026-06-25',
    timeSlot: '09:00 - 10:00',
    symptoms: 'Khám sức khỏe định kỳ và kiểm tra tổng quát theo yêu cầu của cơ quan.',
    status: 'confirmed',
    createdAt: '2026-06-21T09:15:00Z',
  },
  {
    id: 'apt-2',
    patientId: 'usr-1',
    patientName: 'Nguyễn Văn A',
    patientPhone: '+84 912 345 678',
    serviceId: 'srv-2',
    serviceName: 'Tầm soát Tim mạch',
    doctorName: 'BS. Marcus Sterling',
    date: '2026-06-26',
    timeSlot: '14:00 - 15:00',
    symptoms: 'Cảm thấy khó thở nhẹ khi đi bộ tập thể dục buổi sáng và thỉnh thoảng tức ngực nhẹ.',
    status: 'pending',
    createdAt: '2026-06-22T14:32:00Z',
  },
  {
    id: 'apt-3',
    patientId: 'usr-3', // Mock external patient
    patientName: 'Trần Thị B',
    patientPhone: '+84 905 123 456',
    serviceId: 'srv-3',
    serviceName: 'Khám sức khỏe Nhi khoa',
    doctorName: 'BS. Sarah Jenkins',
    date: '2026-06-25',
    timeSlot: '10:00 - 11:00',
    symptoms: 'Khám sức khỏe định kỳ cho bé và tư vấn dinh dưỡng, mốc phát triển thể chất.',
    status: 'confirmed',
    createdAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 'apt-4',
    patientId: 'usr-4', // Mock external patient
    patientName: 'Lê Văn C',
    patientPhone: '+84 988 777 666',
    serviceId: 'srv-4',
    serviceName: 'Khám Cơ Xương Khớp',
    doctorName: 'BS. Thomas Vance',
    date: '2026-06-27',
    timeSlot: '11:00 - 12:00',
    symptoms: 'Cổ chân trái sưng đau đột ngột sau khi chơi bóng đá chiều hôm qua.',
    status: 'pending',
    createdAt: '2026-06-22T08:12:00Z',
  },
  {
    id: 'apt-5',
    patientId: 'usr-5', // Mock external patient
    patientName: 'Phạm Minh D',
    patientPhone: '+84 977 111 222',
    serviceId: 'srv-5',
    serviceName: 'Khám Chuyên khoa Da liễu',
    doctorName: 'BS. Chloe Winters',
    date: '2026-06-24',
    timeSlot: '16:00 - 17:00',
    symptoms: 'Bệnh chàm khô mãn tính tái phát ở cẳng tay gây ngứa ngáy và bong tróc da.',
    status: 'cancelled',
    createdAt: '2026-06-19T11:45:00Z',
  }
];
