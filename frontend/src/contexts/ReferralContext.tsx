import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Referral, ReferralStatus, User } from '../types';
import { addFeedback, createReferral, listReferrals, updateReferralStatus } from '../api/referrals';
import { useAuth } from './AuthContext';

type ReferralContextValue = {
  referrals: Referral[];
  loading: boolean;
  refresh: () => Promise<void>;
  create: (payload: Omit<Referral, 'id' | 'status' | 'createdAt' | 'feedback'>) => Promise<Referral>;
  updateStatus: (id: string, status: ReferralStatus, specialist?: User) => Promise<Referral>;
  addFeedback: (id: string, feedback: string) => Promise<void>;
};

const ReferralContext = createContext<ReferralContextValue | undefined>(undefined);

export function ReferralProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setReferrals([]);
      return;
    }
    setLoading(true);
    try {
      const data = await listReferrals(user);
      setReferrals(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: Omit<Referral, 'id' | 'status' | 'createdAt' | 'feedback'>) => {
      setLoading(true);
      try {
        const created = await createReferral(payload);
        setReferrals((current) => [created, ...current]);
        return created;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateStatus = useCallback(
    async (id: string, status: ReferralStatus, specialist?: User) => {
      setLoading(true);
      try {
        const updated = await updateReferralStatus(id, status, specialist);
        setReferrals((current) => current.map((ref) => (ref.id === id ? updated : ref)));
        return updated;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addFeedbackHandler = useCallback(
    async (id: string, feedback: string) => {
      setLoading(true);
      try {
        await addFeedback(id, feedback);
        setReferrals((current) =>
          current.map((ref) => (ref.id === id ? { ...ref, feedback } : ref))
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value = useMemo(
    () => ({ referrals, loading, refresh, create, updateStatus, addFeedback: addFeedbackHandler }),
    [referrals, loading, refresh, create, updateStatus, addFeedbackHandler]
  );

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}

export const useReferrals = () => {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferrals must be used within ReferralProvider');
  }
  return context;
};
