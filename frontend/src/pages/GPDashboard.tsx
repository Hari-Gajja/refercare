import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import ReferralCard from '../components/ReferralCard';
import CallPatientButton from '../components/CallPatientButton';
import { useAuth } from '../contexts/AuthContext';
import { useReferrals } from '../contexts/ReferralContext';
import { useToast } from '../contexts/ToastContext';
import { sendOtp, verifyOtp } from '../api/auth';
import { listSpecialists } from '../api/users';
import type { Urgency, UserRef } from '../types';

const urgencyOptions: Urgency[] = ['Low', 'Medium', 'High'];

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

export default function GPDashboard() {
  const { user } = useAuth();
  const { referrals, create } = useReferrals();
  const { showToast } = useToast();
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('Medium');
  const [files, setFiles] = useState<string[]>([]);
  const [specialists, setSpecialists] = useState<UserRef[]>([]);
  const [specialistId, setSpecialistId] = useState('');
  const [specialistsLoading, setSpecialistsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadSpecialists = async () => {
      setSpecialistsLoading(true);
      try {
        const data = await listSpecialists();
        if (isMounted) {
          setSpecialists(data);
        }
      } catch (error) {
        showToast(getErrorMessage(error, 'Failed to load specialists.'), 'error');
      } finally {
        if (isMounted) {
          setSpecialistsLoading(false);
        }
      }
    };
    void loadSpecialists();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      showToast('Add a patient phone number before sending OTP.', 'error');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await sendOtp(phoneNumber);
      setOtpSent(true);
      showToast(response.message ?? 'OTP sent.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to send OTP.'), 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      showToast('Enter the OTP code.', 'error');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await verifyOtp(phoneNumber, otpCode);
      if (response.success) {
        setOtpVerified(true);
        showToast('OTP verified successfully.', 'success');
      } else {
        showToast(response.message ?? 'OTP verification failed.', 'error');
      }
    } catch (error) {
      showToast(getErrorMessage(error, 'OTP verification failed.'), 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const resetForm = () => {
    setPatientName('');
    setAge('');
    setPhoneNumber('');
    setIssueDescription('');
    setUrgency('Medium');
    setFiles([]);
    setSpecialistId('');
    setOtpCode('');
    setOtpSent(false);
    setOtpVerified(false);
    localStorage.removeItem('mdrs_otp_token');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!otpVerified) {
      showToast('Verify OTP before submitting.', 'error');
      return;
    }
    if (!user) {
      showToast('Please sign in again.', 'error');
      return;
    }

    try {
      await create({
        patientName,
        age: Number(age),
        phoneNumber,
        issueDescription,
        urgency,
        files,
        assignedTo: specialistId || undefined,
        referredBy: user.id,
      });
      showToast('Referral submitted successfully.', 'success');
      resetForm();
      setShowForm(false);
    } catch (error) {
      showToast(getErrorMessage(error, 'Failed to submit referral.'), 'error');
    }
  };

  return (
    <Layout title="Referrals" subtitle="Create new referrals and track current cases.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          {!showForm ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <p className="text-sm text-slate-500">Create a new referral when you are ready.</p>
              <button
                type="button"
                className="mt-4 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                onClick={() => setShowForm(true)}
              >
                Create New Referral
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-slate-900">Create a Referral</h2>
                <p className="text-sm text-slate-500">Complete the details and verify OTP to proceed.</p>
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
                <label className="text-xs font-semibold text-slate-600">Age</label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Phone</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  value={phoneNumber}
                  onChange={(event) => {
                    setPhoneNumber(event.target.value);
                    setOtpSent(false);
                    setOtpVerified(false);
                    localStorage.removeItem('mdrs_otp_token');
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Urgency</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  value={urgency}
                  onChange={(event) => setUrgency(event.target.value as Urgency)}
                >
                  {urgencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Assign Specialist</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  value={specialistId}
                  onChange={(event) => setSpecialistId(event.target.value)}
                  disabled={specialistsLoading}
                >
                  <option value="">Unassigned</option>
                  {specialists.map((specialist) => (
                    <option key={specialist._id} value={specialist._id}>
                      {specialist.name}
                      {specialist.specialization ? ` · ${specialist.specialization}` : ''} ({specialist.email})
                    </option>
                  ))}
                </select>
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
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">OTP Verification</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Enter OTP"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                >
                  {otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
                <button
                  type="button"
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                >
                  {otpVerified ? 'Verified' : 'Verify'}
                </button>
              </div>
            </div>

            <FileUpload files={files} onFilesChange={setFiles} />

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
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">My Referrals</h2>
              <p className="text-sm text-slate-500">Track progress and recent updates.</p>
            </div>
            {referrals.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No referrals yet. Submit a new referral to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <ReferralCard
                    key={referral.id}
                    referral={referral}
                    compact
                    actions={
                      referral.status === 'Accepted' ? (
                        <CallPatientButton phone={referral.phoneNumber} />
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
