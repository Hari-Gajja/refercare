import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Layout from '../components/Layout';
import { useReferrals } from '../contexts/ReferralContext';
import type { Referral } from '../types';

export default function SpecialistLogbook() {
  const { referrals } = useReferrals();
  const [expandedLogs, setExpandedLogs] = useState<string[]>([]);
  
  const toggleLog = (key: string) => {
    setExpandedLogs((current) => 
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    );
  };

  const handleDownload = () => {
    const data = referrals.map((ref, index) => ({
      'S.No': index + 1,
      'Referring Doctor': ref.referredByDoctorName || 'N/A',
      'Doctor Phone': ref.referredByDoctorPhone || 'N/A',
      'Patient Name': ref.patientName,
      'Patient Phone': ref.phoneNumber,
      'Status': ref.status,
      'Created At': new Date(ref.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logbook');
    XLSX.writeFile(workbook, `Dental_Logbook_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const logBook = useMemo(() => {
    const grouped = new Map<string, { key: string; name: string; phone: string; items: Referral[] }>();
    referrals.forEach((ref) => {
      const name = ref.referredByDoctorName || 'Unknown doctor';
      const phone = ref.referredByDoctorPhone || 'N/A';
      const key = `${name}-${phone}`;
      if (!grouped.has(key)) {
        grouped.set(key, { key, name, phone, items: [] });
      }
      grouped.get(key)?.items.push(ref);
    });
    return Array.from(grouped.values());
  }, [referrals]);

  return (
    <Layout title="Doctor Logbook" subtitle="View referral ledgers grouped by referring doctor.">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Referral Ledger</p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Logbook (.xlsx)
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {logBook.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No referrals logged yet.
              </div>
            ) : (
              logBook.map((entry) => {
                const isExpanded = expandedLogs.includes(entry.key);
                return (
                  <div key={entry.key} className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                    <div 
                      className="flex cursor-pointer items-center justify-between gap-4 p-4 hover:bg-slate-100 transition-colors"
                      onClick={() => toggleLog(entry.key)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
                        <p className="text-xs text-slate-500">{entry.phone}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {entry.items.length} referrals
                        </span>
                        <svg className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-white p-4 space-y-2">
                        {entry.items.map((ref, index) => (
                          <div key={ref.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-slate-900 mr-2">{index + 1}.</span>
                              <Link
                                to={`/specialist/referral/${ref.id}/followups`}
                                className="font-medium text-slate-800 hover:text-emerald-600 transition-colors"
                              >
                                {ref.patientName}
                              </Link>
                              <span className="mx-2 text-slate-400">·</span>
                              <span className="text-slate-500">{ref.phoneNumber}</span>
                            </div>
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                              {ref.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
