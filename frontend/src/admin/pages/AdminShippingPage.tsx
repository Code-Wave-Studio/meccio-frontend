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

interface OptionRow {
  title: string;
  time_label: string;
  description: string;
  icon: string;
  is_active: boolean;
}

interface StepRow {
  step_text: string;
  is_active: boolean;
}

function emptyOption(): OptionRow {
  return { title: '', time_label: '', description: '', icon: 'package', is_active: true };
}

function emptyStep(): StepRow {
  return { step_text: '', is_active: true };
}

export default function AdminShippingPage() {
  const queryClient = useQueryClient();
  const [meta, setMeta] = useState({
    title: '',
    subtitle: '',
    customs_note: '',
  });
  const [options, setOptions] = useState<OptionRow[]>([emptyOption()]);
  const [steps, setSteps] = useState<StepRow[]>([emptyStep()]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'support', 'shipping'],
    queryFn: async () => {
      const res = await adminApi.support.shippingGet();
      return res.data?.data as {
        meta: typeof meta;
        options: Array<{
          title?: string;
          time_label?: string;
          description?: string;
          icon?: string;
          is_active?: number | boolean;
        }>;
        steps: Array<{ step_text?: string; is_active?: number | boolean } | string>;
      };
    },
  });

  useEffect(() => {
    if (!data) return;
    setMeta({
      title: data.meta?.title || '',
      subtitle: data.meta?.subtitle || '',
      customs_note: data.meta?.customs_note || '',
    });
    setOptions(
      (data.options?.length ? data.options : [{}]).map((opt) => ({
        title: opt.title || '',
        time_label: opt.time_label || '',
        description: opt.description || '',
        icon: opt.icon || 'package',
        is_active: opt.is_active !== 0 && opt.is_active !== false,
      })),
    );
    setSteps(
      (data.steps?.length ? data.steps : ['']).map((step) => {
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
      adminApi.support.shippingSave({
        meta,
        options: options.map((opt, i) => ({ ...opt, sort_order: i })),
        steps: steps.map((step, i) => ({
          step_text: step.step_text,
          is_active: step.is_active,
          sort_order: i,
        })),
      }),
    onSuccess: () => {
      toast.success('Shipping content saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'support', 'shipping'] });
    },
    onError: () => toast.error('Could not save shipping content'),
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
        <h1 className="text-2xl sm:text-3xl font-medium">Shipping</h1>
        <p className="text-sm text-[#9c8b7a] mt-1">Delivery options, process steps, and customs note</p>
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
          <AdminField label="Customs note">
            <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={meta.customs_note} onChange={(e) => setMeta({ ...meta, customs_note: e.target.value })} />
          </AdminField>
        </section>

        <AdminRepeatableSection title="Shipping options" description="Delivery methods shown on the shipping page" addLabel="Add option" onAdd={() => setOptions((p) => [...p, emptyOption()])}>
          {options.map((opt, index) => (
            <AdminCard key={index} index={index} title={opt.title || `Option ${index + 1}`} onRemove={() => setOptions((p) => p.filter((_, i) => i !== index))}>
              <div className="grid sm:grid-cols-2 gap-3">
                <AdminField label="Title">
                  <input className={ADMIN_INPUT} value={opt.title} onChange={(e) => setOptions((p) => p.map((o, i) => (i === index ? { ...o, title: e.target.value } : o)))} />
                </AdminField>
                <AdminField label="Time label">
                  <input className={ADMIN_INPUT} placeholder="7–14 business days" value={opt.time_label} onChange={(e) => setOptions((p) => p.map((o, i) => (i === index ? { ...o, time_label: e.target.value } : o)))} />
                </AdminField>
              </div>
              <AdminField label="Icon">
                <select className={ADMIN_INPUT} value={opt.icon} onChange={(e) => setOptions((p) => p.map((o, i) => (i === index ? { ...o, icon: e.target.value } : o)))}>
                  {SUPPORT_ICON_OPTIONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Description">
                <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={opt.description} onChange={(e) => setOptions((p) => p.map((o, i) => (i === index ? { ...o, description: e.target.value } : o)))} />
              </AdminField>
              <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                <input type="checkbox" checked={opt.is_active} onChange={(e) => setOptions((p) => p.map((o, i) => (i === index ? { ...o, is_active: e.target.checked } : o)))} />
                Active
              </label>
            </AdminCard>
          ))}
        </AdminRepeatableSection>

        <AdminRepeatableSection title="Shipping steps" description="How an order moves from warehouse to door" addLabel="Add step" onAdd={() => setSteps((p) => [...p, emptyStep()])}>
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
          {saveMutation.isPending ? 'Saving…' : 'Save Shipping'}
        </button>
      </form>
    </div>
  );
}
