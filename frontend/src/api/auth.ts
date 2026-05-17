import api from './axiosInstance';
import { getMockDelay, useMockApi, wait } from './helpers';
import type { OTPResponse, User } from '../types';

const MOCK_OTP_CODE = import.meta.env.VITE_MOCK_OTP_CODE || '1234';

const buildMockUser = (email: string, fullName?: string): User => {
  const derivedName = email.split('@')[0]?.replace('.', ' ') || 'User';
  const nameSource = fullName?.trim() || derivedName;

  return {
    id: crypto.randomUUID(),
    name: nameSource.charAt(0).toUpperCase() + nameSource.slice(1),
    email,
    role: 'Specialist',
    phone: '+1 555-0202',
  };
};

export const login = async (email: string, password: string): Promise<User> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    const user = buildMockUser(email);
    localStorage.setItem('mdrs_token', 'mock_token_' + crypto.randomUUID());
    return user;
  }

  const { data } = await api.post<{ user: User; token: string }>('/auth/login', {
    email,
    password,
  });
  localStorage.setItem('mdrs_token', data.token);
  return data.user;
};

export type SignupResult = {
  user?: User;
  message: string;
};

export const signup = async (
  name: string,
  email: string,
  password: string,
  otpCode: string
): Promise<SignupResult> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    if (otpCode !== MOCK_OTP_CODE) {
      throw new Error('Invalid OTP.');
    }
    const user = buildMockUser(email, name);
    localStorage.setItem('mdrs_token', 'mock_token_' + crypto.randomUUID());
    return { user, message: 'Account created successfully.' };
  }

  const { data } = await api.post<{ message: string }>('/auth/register', {
    name,
    email,
    password,
    role: 'Specialist',
    otpCode,
  });
  return { message: data.message ?? 'Registration submitted. Please verify your email.' };
};

export const requestEmailOtp = async (name: string, email: string): Promise<OTPResponse> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    return { success: true, message: `Mock OTP sent to ${email}. Code: ${MOCK_OTP_CODE}` };
  }

  const { data } = await api.post<{ message: string }>('/auth/request-email-otp', { name, email });
  return { success: true, message: data.message ?? 'OTP sent.' };
};

export const logout = async (): Promise<void> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    localStorage.removeItem('mdrs_token');
    return;
  }

  localStorage.removeItem('mdrs_token');
};
