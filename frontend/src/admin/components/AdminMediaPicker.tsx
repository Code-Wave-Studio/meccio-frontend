import { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';

interface AdminMediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function AdminMediaPicker({ value, onChange, label }: AdminMediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.media.upload(file);
      const url = res.data?.data?.url as string | undefined;
      if (!url) throw new Error('No URL');
      onChange(url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs uppercase tracking-wider text-[#9c8b7a]">{label}</label>}
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-24 w-24 object-cover border border-[#e8e0d5] bg-[#faf8f5]" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 p-1 bg-white border border-[#e8e0d5] text-[#9c8b7a] hover:text-red-600"
            aria-label="Clear image"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="h-24 w-24 border border-dashed border-[#e8e0d5] bg-[#faf8f5] flex items-center justify-center text-[10px] text-[#9c8b7a] uppercase tracking-wider">
          No image
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider border border-[#e8e0d5] hover:border-[#c4a962] disabled:opacity-60"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          className="flex-1 min-w-[140px] border border-[#e8e0d5] px-3 py-2 text-sm"
          placeholder="Or paste image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
