import { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Layout from '../components/Layout';
import { useToast } from '../contexts/ToastContext';
import { createDoctor, listDoctors } from '../api/doctors';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export default function DoctorDirectory() {
  const { showToast } = useToast();
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorSaving, setDoctorSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [doctors, setDoctors] = useState<{ _id: string; name: string; phone: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDoctors = async () => {
      try {
        const data = await listDoctors();
        if (isMounted) {
          setDoctors(data);
        }
      } catch (error) {
        showToast(getErrorMessage(error, 'Failed to load doctors.'), 'error');
      }
    };
    void loadDoctors();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleAddDoctor = async () => {
    if (!doctorName.trim() || !doctorPhone.trim()) {
      showToast('Doctor name and phone are required.', 'error');
      return;
    }
    setDoctorSaving(true);
    try {
      const created = await createDoctor(doctorName.trim(), doctorPhone.trim());
      setDoctors((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setDoctorName('');
      setDoctorPhone('');
      showToast('Doctor added.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to add doctor.'), 'error');
    } finally {
      setDoctorSaving(false);
    }
  };

  const copyReferralLink = (doctorId: string) => {
    const url = `${window.location.origin}/?doctorId=${doctorId}`;
    void navigator.clipboard.writeText(url);
    showToast('Referral link copied to clipboard!', 'success');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(firstSheet, { header: 1 });
      
      let added = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const name = row[0];
        const phone = row[1];
        if (name && phone) {
           await createDoctor(String(name).trim(), String(phone).trim());
           added++;
        }
      }
      showToast(`Successfully imported ${added} doctors.`, 'success');
      const updated = await listDoctors();
      setDoctors(updated);
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to import Excel.'), 'error');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Layout title="Doctor Directory" subtitle="Manage referring doctors and import directory.">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Quick Add</p>
              <p className="text-sm text-slate-500">Manually add a single doctor.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                className="w-48 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Doctor name"
                value={doctorName}
                onChange={(event) => setDoctorName(event.target.value)}
              />
              <input
                className="w-48 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Phone number"
                value={doctorPhone}
                onChange={(event) => setDoctorPhone(event.target.value)}
              />
              <button
                type="button"
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                onClick={handleAddDoctor}
                disabled={doctorSaving || importing}
              >
                {doctorSaving ? 'Saving...' : 'Add Doctor'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Bulk Import</p>
          <p className="mt-2 text-sm text-slate-500">Upload an Excel/CSV file with Name (A) and Phone (B) columns.</p>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            className="mt-4 rounded-2xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={() => fileInputRef.current?.click()}
            disabled={doctorSaving || importing}
          >
            {importing ? 'Importing...' : 'Select Excel File'}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Registered Doctors</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {doctors.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No doctors registered in your system yet.
              </div>
            ) : (
              doctors.map((doctor) => (
                <div key={doctor._id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{doctor.name}</p>
                      <p className="text-xs text-slate-500">{doctor.phone}</p>
                    </div>
                    <button
                      onClick={() => copyReferralLink(doctor._id)}
                      className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="Copy Unique Referral Link"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
