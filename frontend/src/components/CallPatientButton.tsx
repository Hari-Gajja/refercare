import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function CallPatientButton({ phone }: { phone: string }) {
  const { showToast } = useToast();
  const [calling, setCalling] = useState(false);

  const handleCall = () => {
    if (calling) {
      return;
    }
    setCalling(true);
    showToast(`Calling patient at ${phone}...`, 'info');
    window.location.href = `tel:${phone}`;
    window.setTimeout(() => setCalling(false), 1800);
  };

  return (
    <button
      onClick={handleCall}
      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={calling}
    >
      {calling ? 'Calling...' : 'Call Patient'}
    </button>
  );
}
