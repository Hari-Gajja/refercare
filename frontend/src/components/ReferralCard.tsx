import type { ReactNode } from 'react';
import type { Referral } from '../types';
import ProgressBar from './ui/ProgressBar';
import StatusBadge from './StatusBadge';

type ReferralCardProps = {
  referral: Referral;
  actions?: ReactNode;
  compact?: boolean;
};

export default function ReferralCard({ referral, actions, compact = false }: ReferralCardProps) {
  const documents = referral.files ?? [];

  const getFileLabel = (value: string) => {
    if (value.startsWith('mock://')) {
      return value.replace('mock://', '');
    }
    try {
      const url = new URL(value);
      const last = url.pathname.split('/').filter(Boolean).pop();
      return last ? decodeURIComponent(last) : value;
    } catch {
      return value;
    }
  };

  const getFileExtension = (value: string) => {
    try {
      const url = new URL(value);
      const last = url.pathname.split('/').filter(Boolean).pop() || '';
      return last.split('.').pop()?.toLowerCase() || '';
    } catch {
      const last = value.split('/').pop() || '';
      return last.split('.').pop()?.toLowerCase() || '';
    }
  };

  const isImageFile = (value: string) => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(getFileExtension(value));

  const isPdfFile = (value: string) => getFileExtension(value) === 'pdf';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{referral.patientName}</h3>
          <p className="text-sm text-slate-500">{referral.phoneNumber}</p>
        </div>
        <StatusBadge status={referral.status} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Issue</p>
          <p className="text-sm text-slate-700">{referral.issueDescription}</p>
        </div>
        {!compact && (
          <>
            {referral.referredByDoctorName && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Referred By</p>
                <p className="text-sm text-slate-700">
                  {referral.referredByDoctorName}
                  {referral.referredByDoctorPhone ? ` · ${referral.referredByDoctorPhone}` : ''}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created</p>
              <p className="text-sm text-slate-700">
                {new Date(referral.createdAt).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4">
        <ProgressBar status={referral.status} />
      </div>

      {referral.feedback && (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span className="font-semibold">Feedback:</span> {referral.feedback}
        </div>
      )}

      {documents.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Documents</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {documents.map((file) => {
              const isMock = file.startsWith('mock://');
              const label = getFileLabel(file);
              const href = isMock ? undefined : file;

              if (isImageFile(file)) {
                return (
                  <a
                    key={file}
                    className="block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    href={href}
                    target={href ? '_blank' : undefined}
                    rel={href ? 'noreferrer' : undefined}
                  >
                    <img
                      src={isMock ? undefined : file}
                      alt={label}
                      className="h-40 w-full object-cover"
                    />
                  </a>
                );
              }

              if (isPdfFile(file)) {
                return (
                  <a
                    key={file}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-emerald-700"
                    href={href}
                    target={href ? '_blank' : undefined}
                    rel={href ? 'noreferrer' : undefined}
                  >
                    <span className="font-semibold">PDF Preview</span>
                    <span className="text-xs text-slate-500">Open</span>
                  </a>
                );
              }

              return (
                <a
                  key={file}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-emerald-700"
                  href={href}
                  target={href ? '_blank' : undefined}
                  rel={href ? 'noreferrer' : undefined}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {actions && <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
