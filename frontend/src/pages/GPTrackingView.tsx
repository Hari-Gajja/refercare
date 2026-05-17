import Layout from '../components/Layout';
import ReferralCard from '../components/ReferralCard';
import { useReferrals } from '../contexts/ReferralContext';

export default function GPTrackingView() {
  const { referrals } = useReferrals();

  return (
    <Layout title="Tracking" subtitle="Follow specialist updates and feedback.">
      {referrals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No referrals to track yet.
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map((referral) => (
            <ReferralCard key={referral.id} referral={referral} />
          ))}
        </div>
      )}
    </Layout>
  );
}
