import { useToast } from '../../contexts/ToastContext';

const toastStyles: Record<string, string> = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-sky-600',
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex w-[92%] -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:right-6 sm:left-auto sm:w-auto sm:translate-x-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-sm text-white shadow-lg ${toastStyles[toast.type]}`}
        >
          <span>{toast.message}</span>
          <button
            className="rounded-full bg-white/20 px-2 py-1 text-xs"
            onClick={() => dismissToast(toast.id)}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
