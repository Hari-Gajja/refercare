import { ReferralStatus, referralStatusOrder } from '../../types';

type ProgressBarProps = {
  status: ReferralStatus;
};

const labelMap: Record<ReferralStatus, string> = {
  Referred: 'Referred',
  'In Progress': 'In Progress',
  Completed: 'Completed',
};

export default function ProgressBar({ status }: ProgressBarProps) {
  const currentIndex = Math.max(0, referralStatusOrder.indexOf(status));
  const progress = (currentIndex / (referralStatusOrder.length - 1)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        {referralStatusOrder.map((step, index) => (
          <span key={step} className={index <= currentIndex ? 'text-slate-900' : ''}>
            {labelMap[step]}
          </span>
        ))}
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
