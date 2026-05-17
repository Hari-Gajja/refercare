import type { FormEvent } from 'react';
import { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import { createReferral } from '../api/referrals';
import { listDoctorsPublic } from '../api/doctors';
import { useToast } from '../contexts/ToastContext';

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

type DoctorOption = {
  _id: string;
  name: string;
  phone: string;
};

export default function HomePage() {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredDoctors = doctors.filter((doc) =>
    (doc.name + ' ' + doc.phone).toLowerCase().includes(dropdownSearch.toLowerCase())
  );
  const selectedDoctor = doctors.find((doc) => doc._id === doctorId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadDoctors = async () => {
      try {
        const data = await listDoctorsPublic();
        if (isMounted) {
          setDoctors(data);
          const queryId = new URLSearchParams(window.location.search).get('doctorId');
          if (queryId && data.some(doc => doc._id === queryId)) {
            setDoctorId(queryId);
          }
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

  const resetForm = () => {
    setDoctorId('');
    setPatientName('');
    setPatientPhone('');
    setIssueDescription('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!doctorId) {
      showToast('Select a referring doctor.', 'error');
      return;
    }

    try {
      await createReferral({
        patientName,
        phoneNumber: patientPhone,
        issueDescription,
        files: [],
        referredByDoctorId: doctorId,
      });
      showToast('Referral submitted successfully.', 'success');
      resetForm();
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to submit referral.'), 'error');
    }
  };

  return (
    <Layout title="Refer a Patient" subtitle="Submit a referral to the specialist.">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2" ref={dropdownRef}>
            <label className="text-xs font-semibold text-slate-600">Referring Doctor</label>
            <div className="relative">
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm hover:bg-slate-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className={selectedDoctor ? 'text-slate-900' : 'text-slate-400'}>
                  {selectedDoctor ? `${selectedDoctor.name} (${selectedDoctor.phone})` : 'Search & select doctor...'}
                </span>
                <svg className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {dropdownOpen && (
                <div className="absolute z-10 mt-1 flex max-h-60 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 p-2">
                    <input
                      type="text"
                      className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      placeholder="Type name or phone to search..."
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto p-2">
                    {filteredDoctors.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-500">No doctors found.</div>
                    ) : (
                      filteredDoctors.map((doc) => (
                        <div
                          key={doc._id}
                          className={`cursor-pointer rounded-xl px-3 py-2 text-sm ${
                            doctorId === doc._id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                          onClick={() => {
                            setDoctorId(doc._id);
                            setDropdownOpen(false);
                            setDropdownSearch('');
                          }}
                        >
                          {doc.name} <span className="text-xs opacity-70">({doc.phone})</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Patient Name</label>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Patient Phone</label>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={patientPhone}
                onChange={(event) => setPatientPhone(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Issue Description</label>
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              value={issueDescription}
              onChange={(event) => setIssueDescription(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Submit Referral
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={resetForm}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
