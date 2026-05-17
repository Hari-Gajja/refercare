import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { uploadReferralFiles } from '../api/referrals';

type FileUploadProps = {
  files: string[];
  onFilesChange: (files: string[]) => void;
};

export default function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadReferralFiles(selectedFiles);
      const merged = [...files, ...uploaded];
      onFilesChange(merged);
      showToast('Documents uploaded.', 'success');
    } catch (error) {
      showToast('Failed to upload documents.', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
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

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
        <input className="hidden" type="file" multiple onChange={handleChange} />
        <span>{uploading ? 'Uploading...' : 'Upload reports, X-rays, or notes'}</span>
      </label>
      {files.length > 0 && (
        <div className="space-y-1 text-xs text-slate-500">
          {files.map((file) => (
            <a
              key={file}
              className="block rounded-lg bg-slate-50 px-3 py-2 text-emerald-700 hover:underline"
              href={file.startsWith('mock://') ? undefined : file}
              target={file.startsWith('mock://') ? undefined : '_blank'}
              rel={file.startsWith('mock://') ? undefined : 'noreferrer'}
            >
              {getFileLabel(file)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
