import { useRef, useState } from 'react';
import { GripVertical, Loader2, Star, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, resolveMediaUrl } from '@/lib/api';

export type ProductImageItem = {
  url: string;
  alt_text?: string;
  is_primary?: boolean;
};

const MIN = 1;
const MAX = 15;

interface AdminProductImagesFieldProps {
  value: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
}

export default function AdminProductImagesField({ value, onChange }: AdminProductImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const normalize = (list: ProductImageItem[]) => {
    if (list.length === 0) return list;
    const hasPrimary = list.some((img) => img.is_primary);
    return list.map((img, i) => ({
      ...img,
      is_primary: hasPrimary ? !!img.is_primary : i === 0,
    }));
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArr.length === 0) {
      toast.error('Select image files only');
      return;
    }

    const room = MAX - value.length;
    if (room <= 0) {
      toast.error(`Maximum ${MAX} images allowed`);
      return;
    }

    const toUpload = fileArr.slice(0, room);
    if (fileArr.length > room) {
      toast.error(`Only ${room} more image(s) can be added (max ${MAX})`);
    }

    setUploading(true);
    const uploaded: ProductImageItem[] = [];
    try {
      for (const file of toUpload) {
        const res = await adminApi.media.upload(file);
        const url = res.data?.data?.url as string | undefined;
        if (!url) throw new Error('No URL');
        uploaded.push({ url, alt_text: '', is_primary: false });
      }
      onChange(normalize([...value, ...uploaded]));
      toast.success(uploaded.length === 1 ? 'Image uploaded' : `${uploaded.length} images uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange(normalize(next));
  };

  const setPrimary = (index: number) => {
    onChange(
      value.map((img, i) => ({
        ...img,
        is_primary: i === index,
      })),
    );
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(normalize(next));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#9c8b7a]">Product images *</p>
          <p className="text-[11px] text-[#9c8b7a] mt-0.5">
            Min {MIN} · Max {MAX} · First / starred = primary
          </p>
        </div>
        <span className="text-xs text-[#9c8b7a]">
          {value.length}/{MAX}
        </span>
      </div>

      {value.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((img, index) => (
            <li
              key={`${img.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`relative border bg-[#faf8f5] overflow-hidden ${
                img.is_primary ? 'border-[#c4a962]' : 'border-[#e8e0d5]'
              }`}
            >
              <img
                src={resolveMediaUrl(img.url)}
                alt={img.alt_text || `Product ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-1 p-1.5 bg-gradient-to-b from-black/50 to-transparent">
                <span className="inline-flex items-center gap-0.5 text-[10px] text-white/90">
                  <GripVertical size={12} />
                  {index + 1}
                </span>
                {img.is_primary ? (
                  <span className="text-[9px] uppercase tracking-wider bg-[#c4a962] text-[#1a1714] px-1.5 py-0.5">
                    Primary
                  </span>
                ) : null}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1.5 bg-gradient-to-t from-black/55 to-transparent">
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 text-[10px] uppercase tracking-wider bg-white/95 text-[#1a1714]"
                  title="Set as primary"
                >
                  <Star size={12} className={img.is_primary ? 'fill-[#c4a962] text-[#c4a962]' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="flex-1 inline-flex items-center justify-center py-1.5 text-[10px] uppercase tracking-wider bg-white/95 text-red-600"
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          disabled={uploading || value.length >= MAX}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs uppercase tracking-wider border border-[#e8e0d5] hover:border-[#c4a962] disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading…' : value.length ? 'Add more images' : 'Upload images'}
        </button>
        <p className="text-[11px] text-[#9c8b7a] self-center">
          JPG, PNG, WEBP, GIF · drag to reorder
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) uploadFiles(e.target.files);
        }}
      />
    </div>
  );
}

export { MIN as PRODUCT_IMAGES_MIN, MAX as PRODUCT_IMAGES_MAX };
