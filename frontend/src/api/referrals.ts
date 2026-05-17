import api from './axiosInstance';
import { getMockDelay, useMockApi, wait } from './helpers';
import type { Referral, ReferralStatus, User } from '../types';

const STORAGE_KEY = 'mdrs_referrals';

export type CreateReferralPayload = Omit<Referral, 'id' | 'status' | 'createdAt' | 'feedback'>;

const normalizeReferral = (referral: Referral & { _id?: string } & { phone?: string }): Referral => ({
  ...referral,
  id: referral.id ?? referral._id ?? crypto.randomUUID(),
  phoneNumber: referral.phoneNumber ?? referral.phone ?? '',
  createdAt: referral.createdAt ?? new Date().toISOString(),
});

const readReferrals = (): Referral[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Referral[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeReferrals = (items: Referral[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const listReferrals = async (user: User): Promise<Referral[]> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    const data = readReferrals();
    return data;
  }

  const endpoint = '/referral/specialist';
  const { data } = await api.get<Referral[]>(endpoint);
  return Array.isArray(data) ? data.map(normalizeReferral) : [];
};

export const createReferral = async (payload: CreateReferralPayload): Promise<Referral> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    const current = readReferrals();
    const referral: Referral = {
      ...payload,
      id: crypto.randomUUID(),
      status: 'Referred',
      createdAt: new Date().toISOString(),
    };
    const updated = [referral, ...current];
    writeReferrals(updated);
    return referral;
  }

  const otpToken = localStorage.getItem('mdrs_otp_token');
  const { data } = await api.post<{ referral: Referral }>(
    '/referral/create',
    payload,
    otpToken ? { headers: { 'otp-token': otpToken } } : undefined
  );
  return normalizeReferral(data.referral);
};

export const updateReferralStatus = async (
  id: string,
  status: ReferralStatus,
  specialist?: User
): Promise<Referral> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    const current = readReferrals();
    const index = current.findIndex((ref) => ref.id === id);
    if (index === -1) {
      throw new Error('Referral not found');
    }
    const updatedReferral: Referral = {
      ...current[index],
      status,
      assignedTo: specialist?.id ?? current[index].assignedTo,
    };
    const updated = [...current];
    updated[index] = updatedReferral;
    writeReferrals(updated);
    return updatedReferral;
  }

  const { data } = await api.put<{ referral: Referral }>(`/referral/status/${id}`, {
    status,
  });
  return normalizeReferral(data.referral);
};

export const addFeedback = async (id: string, feedbackText: string): Promise<void> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    const current = readReferrals();
    const index = current.findIndex((ref) => ref.id === id);
    if (index === -1) {
      throw new Error('Referral not found');
    }
    const updatedReferral: Referral = {
      ...current[index],
      feedback: feedbackText,
      status: 'Completed',
    };
    const updated = [...current];
    updated[index] = updatedReferral;
    writeReferrals(updated);
    return;
  }

  await api.post(`/referral/feedback/${id}`, {
    feedbackText,
  });
};

export const uploadReferralFiles = async (files: File[]): Promise<string[]> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    return files.map((file) => `mock://${file.name}`);
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const { data } = await api.post<{ fileUrls: string[] }>('/referral/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return Array.isArray(data?.fileUrls) ? data.fileUrls : [];
};

export const getReferralDetail = async (id: string): Promise<Referral> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    const data = readReferrals();
    const item = data.find((r) => r.id === id);
    if (!item) {
      throw new Error('Referral not found');
    }
    return normalizeReferral(item);
  }
  const { data } = await api.get<Referral>(`/referral/detail/${id}`);
  return normalizeReferral(data);
};

export const addFollowUp = async (
  id: string,
  payload: { note: string; type?: string; status?: string; files?: string[] }
): Promise<Referral> => {
  if (useMockApi()) {
    await wait(getMockDelay());
    const data = readReferrals();
    const idx = data.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error('Referral not found');
    }
    const referral = data[idx];
    referral.followUps = referral.followUps || [];
    referral.followUps.push({
      date: new Date().toISOString(),
      note: payload.note,
      type: (payload.type as any) || 'Checkup',
      status: payload.status || referral.status,
      files: payload.files || [],
    });
    if (payload.status) {
      referral.status = payload.status as any;
    }
    writeReferrals(data);
    return normalizeReferral(referral);
  }
  const { data } = await api.post<{ referral: Referral }>(`/referral/followup/${id}`, payload);
  return normalizeReferral(data.referral);
};
