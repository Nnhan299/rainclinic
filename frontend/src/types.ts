/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'patient' | 'admin' | 'doctor';
}

export interface MedicalService {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  price: number;
  description: string;
  doctorName: string;
}

export interface TimeSlot {
  id: string;
  time: string; // e.g. "08:00 - 09:00"
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  serviceId: string;
  serviceName: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  symptoms: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
