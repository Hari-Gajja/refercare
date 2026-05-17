import api from './axiosInstance';
import { getMockDelay, useMockApi, wait } from './helpers';

export type Doctor = {
  _id: string;
  name: string;
  phone: string;
};

const MOCK_DOCTORS: Doctor[] = [
  { _id: 'mock-doc-1', name: 'Dr. Taylor Park', phone: '+1 555-0101' },
  { _id: 'mock-doc-2', name: 'Dr. Nova Lee', phone: '+1 555-0120' },
];

export const listDoctorsPublic = async (): Promise<Doctor[]> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    return MOCK_DOCTORS;
  }

  const { data } = await api.get<{ doctors: Doctor[] }>('/doctors/public');
  return Array.isArray(data?.doctors) ? data.doctors : [];
};

export const listDoctors = async (): Promise<Doctor[]> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    return MOCK_DOCTORS;
  }

  const { data } = await api.get<{ doctors: Doctor[] }>('/doctors');
  return Array.isArray(data?.doctors) ? data.doctors : [];
};

export const createDoctor = async (name: string, phone: string): Promise<Doctor> => {
  const { data } = await api.post<{ doctor: Doctor }>('/doctors', { name, phone });
  return data.doctor;
};
