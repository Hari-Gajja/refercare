import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import { getReferralDetail, addFollowUp } from '../api/referrals';
import { useToast } from '../contexts/ToastContext';
import type { Referral, FollowUp } from '../types';

export default function PatientFollowups() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [type, setType] = useState<FollowUp['type']>('Checkup');
  const [nextStatus, setNextStatus] = useState<string>('');
  const [followUpFiles, setFollowUpFiles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getReferralDetail(id);
        setReferral(data);
        setNextStatus(data.status);
      } catch (err) {
        showToast('Failed to load patient history.', 'error');
        navigate('/specialist');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, showToast, navigate]);

  const handleAdd = async () => {
    if (!id || !note.trim()) {
      showToast('Please enter a note for the follow-up.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await addFollowUp(id, {
        note: note.trim(),
        type,
        status: nextStatus || undefined,
        files: followUpFiles,
      });
      setReferral(updated);
      setNote('');
      setFollowUpFiles([]);
      showToast('Follow-up successfully recorded.', 'success');
    } catch (err) {
      showToast('Failed to save follow-up.', 'error');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <Layout title="Loading History...">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!referral) {
    return (
      <Layout title="Error">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
          Patient history not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Dental History: ${referral.patientName}`} subtitle={`Clinical tracking for ${referral.patientName}`}>
      <div className="grid gap-6 lg:grid-cols-[1fr,350px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Treatment Timeline</h2>
            <div className="mt-6 space-y-6">
              {!referral.followUps || referral.followUps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No clinical logs recorded yet.
                </div>
              ) : (
                referral.followUps.slice().reverse().map((f, fIdx) => (
                  <div key={fIdx} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:h-full before:w-[2px] before:bg-slate-100 last:before:hidden">
                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500 shadow-sm"></div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                          {f.type}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(f.date).toLocaleDateString()} · {new Date(f.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{f.note}</p>
                      
                      {f.files && f.files.length > 0 && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {f.files.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.startsWith('mock://') ? undefined : file}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-xs text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="truncate">{getFileLabel(file)}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {f.status && f.status !== referral.status && (
                        <div className="mt-3 inline-block rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600">
                          Status at time: {f.status}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Patient Details</h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Current Phase</label>
                  <p className="text-sm font-semibold text-slate-900">{referral.status}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Contact</label>
                  <p className="text-sm font-semibold text-slate-900">{referral.phoneNumber}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Initial Issue</label>
                  {referral.issueDescription}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-600">New Clinical Record</h3>
              <div className="mt-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Type of Log</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="Checkup">General Checkup</option>
                    <option value="Procedure">Dental Procedure</option>
                    <option value="X-Ray">X-Ray / Scan</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Treatment">Treatment Plan</option>
                    <option value="Note">Clinical Note</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Update Status</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                  >
                    <option value="Referred">Referred</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Clinical Observations</label>
                  <textarea
                    className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Findings, treatment details..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Attachments (X-Rays, etc.)</label>
                  <FileUpload files={followUpFiles} onFilesChange={setFollowUpFiles} />
                </div>
                <button
                  className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  onClick={handleAdd}
                  disabled={saving || !note.trim()}
                >
                  {saving ? 'Recording...' : 'Update Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
