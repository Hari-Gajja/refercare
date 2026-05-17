import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ReferralCard from '../components/ReferralCard';
import CallPatientButton from '../components/CallPatientButton';
import { useAuth } from '../contexts/AuthContext';
import { useReferrals } from '../contexts/ReferralContext';
import { useToast } from '../contexts/ToastContext';
import type { Referral } from '../types';

export default function SpecialistDashboard() {
  const { user } = useAuth();
  const { referrals, updateStatus, addFeedback } = useReferrals();
  const { showToast } = useToast();
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  const handleInProgress = async (referral: Referral) => {
    if (!user) {
      return;
    }
    await updateStatus(referral.id, 'In Progress', user);
    showToast('Referral marked in progress.', 'success');
  };

  const handleComplete = async (referral: Referral) => {
    if (!user) {
      return;
    }
    const feedback = feedbackDrafts[referral.id] ?? '';
    await updateStatus(referral.id, 'Completed', user);
    await addFeedback(referral.id, feedback);
    showToast('Referral completed.', 'success');
  };

  const updateDraft = (id: string, value: string) => {
    setFeedbackDrafts((current) => ({ ...current, [id]: value }));
  };

  return (
    <Layout title="Referrals" subtitle="Review referrals and update treatment status.">
      {referrals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No referrals assigned yet.
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map((referral) => {
            const showFeedbackInput = referral.status === 'In Progress';
            const actions = (
              <>
                <Link
                  to={`/specialist/referral/${referral.id}/followups`}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View History
                </Link>
                {(referral.status === 'Referred' || referral.status === 'Accepted' || referral.status === 'In Progress') && (
                  <CallPatientButton phone={referral.phoneNumber} />
                )}
                {(referral.status === 'Referred' || referral.status === 'Accepted') && (
                  <button
                    className="rounded-xl border border-slate-200 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    onClick={() => handleInProgress(referral)}
                  >
                    Mark In Progress
                  </button>
                )}
                {referral.status === 'In Progress' && (
                  <button
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    onClick={() => handleComplete(referral)}
                  >
                    Mark Completed
                  </button>
                )}
              </>
            );

            return (
              <div key={referral.id} className="space-y-3">
                <ReferralCard referral={referral} actions={actions} />
                {showFeedbackInput && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <label className="text-xs font-semibold text-slate-600">Specialist Feedback</label>
                    <textarea
                      className="mt-2 min-h-[100px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Add discharge notes or follow-up advice."
                      value={feedbackDrafts[referral.id] ?? ''}
                      onChange={(event) => updateDraft(referral.id, event.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

