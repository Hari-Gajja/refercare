import type { ReferralStatus } from '../types';

const statusStyles: Record<ReferralStatus, string> = {
  Referred: 'bg-blue-50 text-blue-600 border-blue-200',
  'In Progress': 'bg-purple-50 text-purple-600 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export default function StatusBadge({ status }: { status: ReferralStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
