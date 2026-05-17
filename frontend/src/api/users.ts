import api from './axiosInstance';
import { getMockDelay, useMockApi, wait } from './helpers';
import type { User, UserRef } from '../types';

const MOCK_SPECIALISTS: UserRef[] = [
  {
    _id: 'mock-specialist-1',
    name: 'Dr. Avery Shaw',
    email: 'avery.shaw@clinic.com',
    specialization: 'Orthodontics',
  },
  {
    _id: 'mock-specialist-2',
    name: 'Dr. Nia Kapoor',
    email: 'nia.kapoor@clinic.com',
    specialization: 'Pediatric Dentistry',
  },
];

export const listSpecialists = async (): Promise<UserRef[]> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    return MOCK_SPECIALISTS;
  }

  const { data } = await api.get<{ specialists: UserRef[] }>('/referral/specialists');
  return Array.isArray(data?.specialists) ? data.specialists : [];
};

export const getProfile = async (): Promise<User | null> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    return null;
  }

  const { data } = await api.get<{ user: User }>('/auth/profile');
  return data?.user ?? null;
};

export const updateProfile = async (payload: Partial<Pick<User, 'name' | 'phone' | 'specialization'>>): Promise<User> => {
  const { data } = await api.put<{ user: User }>('/auth/profile', payload);
  return data.user;
};
