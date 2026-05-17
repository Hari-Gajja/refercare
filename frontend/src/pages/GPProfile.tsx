import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useReferrals } from '../contexts/ReferralContext';

export default function GPProfile() {
  const { user } = useAuth();
  const { referrals } = useReferrals();

  const stats = {
    total: referrals.length,
    referred: referrals.filter((ref) => ref.status === 'Referred').length,
    accepted: referrals.filter((ref) => ref.status === 'Accepted').length,
    inProgress: referrals.filter((ref) => ref.status === 'In Progress').length,
    completed: referrals.filter((ref) => ref.status === 'Completed').length,
  };

  return (
    <Layout title="Profile" subtitle="Manage your details and referral analytics.">
      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Profile</p>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">Name</p>
                <p className="text-sm font-semibold text-slate-900">{user?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Email</p>
                <p className="text-sm text-slate-700">{user?.email || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Referral Analytics</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Total</p>
              <p className="text-lg font-semibold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Referred</p>
              <p className="text-lg font-semibold text-slate-900">{stats.referred}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Accepted</p>
              <p className="text-lg font-semibold text-slate-900">{stats.accepted}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">In Progress</p>
              <p className="text-lg font-semibold text-slate-900">{stats.inProgress}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Completed</p>
              <p className="text-lg font-semibold text-slate-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
