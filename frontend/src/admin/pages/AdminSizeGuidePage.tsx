import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ADMIN_INPUT,
  AdminCard,
  AdminField,
  AdminRepeatableSection,
  SUPPORT_ICON_OPTIONS,
} from '@/admin/components/AdminFormBits';
import { adminApi } from '@/lib/api';

interface RoomRow {
  room_name: string;
  icon: string;
  sizesText: string;
  tip: string;
  is_active: boolean;
}

interface ChartRow {
  size_ft: string;
  size_cm: string;
  best_for: string;
  is_active: boolean;
}

interface StepRow {
  step_text: string;
  is_active: boolean;
}

function emptyRoom(): RoomRow {
  return { room_name: '', icon: 'sofa', sizesText: '', tip: '', is_active: true };
}

function emptyChart(): ChartRow {
  return { size_ft: '', size_cm: '', best_for: '', is_active: true };
}

function emptyStep(): StepRow {
  return { step_text: '', is_active: true };
}

export default function AdminSizeGuidePage() {
  const queryClient = useQueryClient();
  const [meta, setMeta] = useState({
    title: '',
    subtitle: '',
    custom_title: '',
    custom_desc: '',
  });
  const [rooms, setRooms] = useState<RoomRow[]>([emptyRoom()]);
  const [chart, setChart] = useState<ChartRow[]>([emptyChart()]);
  const [steps, setSteps] = useState<StepRow[]>([emptyStep()]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'support', 'size-guide'],
    queryFn: async () => {
      const res = await adminApi.support.sizeGuideGet();
      return res.data?.data as {
        meta: typeof meta;
        rooms: Array<{
          room_name?: string;
          icon?: string;
          sizes?: string[] | string;
          tip?: string;
          is_active?: number | boolean;
        }>;
        chart: Array<{
          size_ft?: string;
          size_cm?: string;
          best_for?: string;
          is_active?: number | boolean;
        }>;
        measure_steps: Array<{ step_text?: string; is_active?: number | boolean } | string>;
      };
    },
  });

  useEffect(() => {
    if (!data) return;
    setMeta({
      title: data.meta?.title || '',
      subtitle: data.meta?.subtitle || '',
      custom_title: data.meta?.custom_title || '',
      custom_desc: data.meta?.custom_desc || '',
    });
    setRooms(
      (data.rooms?.length ? data.rooms : [{}]).map((room) => ({
        room_name: room.room_name || '',
        icon: room.icon || 'sofa',
        sizesText: Array.isArray(room.sizes)
          ? room.sizes.join(', ')
          : typeof room.sizes === 'string'
            ? room.sizes
            : '',
        tip: room.tip || '',
        is_active: room.is_active !== 0 && room.is_active !== false,
      })),
    );
    setChart(
      (data.chart?.length ? data.chart : [{}]).map((row) => ({
        size_ft: row.size_ft || '',
        size_cm: row.size_cm || '',
        best_for: row.best_for || '',
        is_active: row.is_active !== 0 && row.is_active !== false,
      })),
    );
    setSteps(
      (data.measure_steps?.length ? data.measure_steps : ['']).map((step) => {
        if (typeof step === 'string') return { step_text: step, is_active: true };
        return {
          step_text: step.step_text || '',
          is_active: step.is_active !== 0 && step.is_active !== false,
        };
      }),
    );
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminApi.support.sizeGuideSave({
        meta,
        rooms: rooms.map((room, i) => ({
          room_name: room.room_name,
          icon: room.icon,
          tip: room.tip,
          is_active: room.is_active,
          sort_order: i,
          sizes: room.sizesText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        })),
        chart: chart.map((row, i) => ({
          ...row,
          sort_order: i,
        })),
        measure_steps: steps.map((step, i) => ({
          step_text: step.step_text,
          is_active: step.is_active,
          sort_order: i,
        })),
      }),
    onSuccess: () => {
      toast.success('Size guide saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'support', 'size-guide'] });
    },
    onError: () => toast.error('Could not save size guide'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-[#c4a962]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium">Size Guide</h1>
        <p className="text-sm text-[#9c8b7a] mt-1">Page copy, room sizes, chart, and measuring tips</p>
      </div>

      <form
        className="bg-white border border-[#e8e0d5] p-5 sm:p-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Page header</h2>
          <AdminField label="Title">
            <input className={ADMIN_INPUT} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
          </AdminField>
          <AdminField label="Subtitle">
            <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={meta.subtitle} onChange={(e) => setMeta({ ...meta, subtitle: e.target.value })} />
          </AdminField>
          <AdminField label="Custom sizes title">
            <input className={ADMIN_INPUT} value={meta.custom_title} onChange={(e) => setMeta({ ...meta, custom_title: e.target.value })} />
          </AdminField>
          <AdminField label="Custom sizes description">
            <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={meta.custom_desc} onChange={(e) => setMeta({ ...meta, custom_desc: e.target.value })} />
          </AdminField>
        </section>

        <AdminRepeatableSection title="Rooms" description="Recommended sizes by room type" addLabel="Add room" onAdd={() => setRooms((p) => [...p, emptyRoom()])}>
          {rooms.map((room, index) => (
            <AdminCard key={index} index={index} title={room.room_name || `Room ${index + 1}`} onRemove={() => setRooms((p) => p.filter((_, i) => i !== index))}>
              <div className="grid sm:grid-cols-2 gap-3">
                <AdminField label="Room name">
                  <input className={ADMIN_INPUT} value={room.room_name} onChange={(e) => setRooms((p) => p.map((r, i) => (i === index ? { ...r, room_name: e.target.value } : r)))} />
                </AdminField>
                <AdminField label="Icon">
                  <select className={ADMIN_INPUT} value={room.icon} onChange={(e) => setRooms((p) => p.map((r, i) => (i === index ? { ...r, icon: e.target.value } : r)))}>
                    {SUPPORT_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </AdminField>
              </div>
              <AdminField label="Sizes (comma-separated)">
                <input className={ADMIN_INPUT} placeholder="5×8 ft, 8×10 ft, 9×12 ft" value={room.sizesText} onChange={(e) => setRooms((p) => p.map((r, i) => (i === index ? { ...r, sizesText: e.target.value } : r)))} />
              </AdminField>
              <AdminField label="Tip">
                <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={room.tip} onChange={(e) => setRooms((p) => p.map((r, i) => (i === index ? { ...r, tip: e.target.value } : r)))} />
              </AdminField>
              <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                <input type="checkbox" checked={room.is_active} onChange={(e) => setRooms((p) => p.map((r, i) => (i === index ? { ...r, is_active: e.target.checked } : r)))} />
                Active
              </label>
            </AdminCard>
          ))}
        </AdminRepeatableSection>

        <AdminRepeatableSection title="Size chart" description="Feet / cm conversion rows" addLabel="Add row" onAdd={() => setChart((p) => [...p, emptyChart()])}>
          {chart.map((row, index) => (
            <AdminCard key={index} index={index} title={row.size_ft || `Row ${index + 1}`} onRemove={() => setChart((p) => p.filter((_, i) => i !== index))}>
              <div className="grid sm:grid-cols-3 gap-3">
                <AdminField label="Size (ft)">
                  <input className={ADMIN_INPUT} value={row.size_ft} onChange={(e) => setChart((p) => p.map((r, i) => (i === index ? { ...r, size_ft: e.target.value } : r)))} />
                </AdminField>
                <AdminField label="Size (cm)">
                  <input className={ADMIN_INPUT} value={row.size_cm} onChange={(e) => setChart((p) => p.map((r, i) => (i === index ? { ...r, size_cm: e.target.value } : r)))} />
                </AdminField>
                <AdminField label="Best for">
                  <input className={ADMIN_INPUT} value={row.best_for} onChange={(e) => setChart((p) => p.map((r, i) => (i === index ? { ...r, best_for: e.target.value } : r)))} />
                </AdminField>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                <input type="checkbox" checked={row.is_active} onChange={(e) => setChart((p) => p.map((r, i) => (i === index ? { ...r, is_active: e.target.checked } : r)))} />
                Active
              </label>
            </AdminCard>
          ))}
        </AdminRepeatableSection>

        <AdminRepeatableSection title="How to measure" description="Step-by-step tips" addLabel="Add step" onAdd={() => setSteps((p) => [...p, emptyStep()])}>
          {steps.map((step, index) => (
            <AdminCard key={index} index={index} title={`Step ${index + 1}`} onRemove={() => setSteps((p) => p.filter((_, i) => i !== index))}>
              <AdminField label="Step text">
                <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={step.step_text} onChange={(e) => setSteps((p) => p.map((s, i) => (i === index ? { ...s, step_text: e.target.value } : s)))} />
              </AdminField>
              <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                <input type="checkbox" checked={step.is_active} onChange={(e) => setSteps((p) => p.map((s, i) => (i === index ? { ...s, is_active: e.target.checked } : s)))} />
                Active
              </label>
            </AdminCard>
          ))}
        </AdminRepeatableSection>

        <button type="submit" disabled={saveMutation.isPending} className="w-full sm:w-auto px-6 py-3 bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60">
          {saveMutation.isPending ? 'Saving…' : 'Save Size Guide'}
        </button>
      </form>
    </div>
  );
}
