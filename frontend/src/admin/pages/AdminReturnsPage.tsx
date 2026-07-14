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

interface CardRow {
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
}

interface ProcessRow {
  step_code: string;
  title: string;
  description: string;
  is_active: boolean;
}

interface NoteRow {
  note_text: string;
  is_active: boolean;
}

function emptyCard(): CardRow {
  return { title: '', description: '', icon: 'check', is_active: true };
}

function emptyProcess(): ProcessRow {
  return { step_code: '', title: '', description: '', is_active: true };
}

function emptyNote(): NoteRow {
  return { note_text: '', is_active: true };
}

export default function AdminReturnsPage() {
  const queryClient = useQueryClient();
  const [meta, setMeta] = useState({
    title: '',
    subtitle: '',
    alert_text: '',
    contact_email: '',
  });
  const [cards, setCards] = useState<CardRow[]>([emptyCard()]);
  const [processSteps, setProcessSteps] = useState<ProcessRow[]>([emptyProcess()]);
  const [notes, setNotes] = useState<NoteRow[]>([emptyNote()]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'support', 'returns'],
    queryFn: async () => {
      const res = await adminApi.support.returnsGet();
      return res.data?.data as {
        meta: typeof meta;
        policy_cards: Array<{
          title?: string;
          description?: string;
          icon?: string;
          is_active?: number | boolean;
        }>;
        process_steps: Array<{
          step_code?: string;
          title?: string;
          description?: string;
          is_active?: number | boolean;
        }>;
        refund_notes: Array<{ note_text?: string; is_active?: number | boolean } | string>;
      };
    },
  });

  useEffect(() => {
    if (!data) return;
    setMeta({
      title: data.meta?.title || '',
      subtitle: data.meta?.subtitle || '',
      alert_text: data.meta?.alert_text || '',
      contact_email: data.meta?.contact_email || '',
    });
    setCards(
      (data.policy_cards?.length ? data.policy_cards : [{}]).map((card) => ({
        title: card.title || '',
        description: card.description || '',
        icon: card.icon || 'check',
        is_active: card.is_active !== 0 && card.is_active !== false,
      })),
    );
    setProcessSteps(
      (data.process_steps?.length ? data.process_steps : [{}]).map((step, i) => ({
        step_code: step.step_code || String(i + 1).padStart(2, '0'),
        title: step.title || '',
        description: step.description || '',
        is_active: step.is_active !== 0 && step.is_active !== false,
      })),
    );
    setNotes(
      (data.refund_notes?.length ? data.refund_notes : ['']).map((note) => {
        if (typeof note === 'string') return { note_text: note, is_active: true };
        return {
          note_text: note.note_text || '',
          is_active: note.is_active !== 0 && note.is_active !== false,
        };
      }),
    );
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminApi.support.returnsSave({
        meta,
        policy_cards: cards.map((card, i) => ({ ...card, sort_order: i })),
        process_steps: processSteps.map((step, i) => ({
          ...step,
          step_code: step.step_code || String(i + 1).padStart(2, '0'),
          sort_order: i,
        })),
        refund_notes: notes.map((note, i) => ({
          note_text: note.note_text,
          is_active: note.is_active,
          sort_order: i,
        })),
      }),
    onSuccess: () => {
      toast.success('Returns content saved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'support', 'returns'] });
    },
    onError: () => toast.error('Could not save returns content'),
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
        <h1 className="text-2xl sm:text-3xl font-medium">Returns</h1>
        <p className="text-sm text-[#9c8b7a] mt-1">Policy cards, return process, and refund notes</p>
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
          <AdminField label="Alert text">
            <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={meta.alert_text} onChange={(e) => setMeta({ ...meta, alert_text: e.target.value })} />
          </AdminField>
          <AdminField label="Contact email">
            <input className={ADMIN_INPUT} type="email" value={meta.contact_email} onChange={(e) => setMeta({ ...meta, contact_email: e.target.value })} />
          </AdminField>
        </section>

        <AdminRepeatableSection title="Policy cards" description="Return policy highlights" addLabel="Add card" onAdd={() => setCards((p) => [...p, emptyCard()])}>
          {cards.map((card, index) => (
            <AdminCard key={index} index={index} title={card.title || `Card ${index + 1}`} onRemove={() => setCards((p) => p.filter((_, i) => i !== index))}>
              <div className="grid sm:grid-cols-2 gap-3">
                <AdminField label="Title">
                  <input className={ADMIN_INPUT} value={card.title} onChange={(e) => setCards((p) => p.map((c, i) => (i === index ? { ...c, title: e.target.value } : c)))} />
                </AdminField>
                <AdminField label="Icon">
                  <select className={ADMIN_INPUT} value={card.icon} onChange={(e) => setCards((p) => p.map((c, i) => (i === index ? { ...c, icon: e.target.value } : c)))}>
                    {SUPPORT_ICON_OPTIONS.map((icon) => (
                      <option key={icon.value} value={icon.value}>{icon.label}</option>
                    ))}
                  </select>
                </AdminField>
              </div>
              <AdminField label="Description">
                <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={card.description} onChange={(e) => setCards((p) => p.map((c, i) => (i === index ? { ...c, description: e.target.value } : c)))} />
              </AdminField>
              <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                <input type="checkbox" checked={card.is_active} onChange={(e) => setCards((p) => p.map((c, i) => (i === index ? { ...c, is_active: e.target.checked } : c)))} />
                Active
              </label>
            </AdminCard>
          ))}
        </AdminRepeatableSection>

        <AdminRepeatableSection title="Return process" description="Steps a customer follows to return an item" addLabel="Add step" onAdd={() => setProcessSteps((p) => [...p, emptyProcess()])}>
          {processSteps.map((step, index) => (
            <AdminCard key={index} index={index} title={step.title || `Step ${index + 1}`} onRemove={() => setProcessSteps((p) => p.filter((_, i) => i !== index))}>
              <div className="grid sm:grid-cols-2 gap-3">
                <AdminField label="Step code">
                  <input className={ADMIN_INPUT} placeholder="01" value={step.step_code} onChange={(e) => setProcessSteps((p) => p.map((s, i) => (i === index ? { ...s, step_code: e.target.value } : s)))} />
                </AdminField>
                <AdminField label="Title">
                  <input className={ADMIN_INPUT} value={step.title} onChange={(e) => setProcessSteps((p) => p.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)))} />
                </AdminField>
              </div>
              <AdminField label="Description">
                <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={step.description} onChange={(e) => setProcessSteps((p) => p.map((s, i) => (i === index ? { ...s, description: e.target.value } : s)))} />
              </AdminField>
              <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                <input type="checkbox" checked={step.is_active} onChange={(e) => setProcessSteps((p) => p.map((s, i) => (i === index ? { ...s, is_active: e.target.checked } : s)))} />
                Active
              </label>
            </AdminCard>
          ))}
        </AdminRepeatableSection>

        <AdminRepeatableSection title="Refund notes" description="Extra refund policy notes" addLabel="Add note" onAdd={() => setNotes((p) => [...p, emptyNote()])}>
          {notes.map((note, index) => (
            <AdminCard key={index} index={index} title={`Note ${index + 1}`} onRemove={() => setNotes((p) => p.filter((_, i) => i !== index))}>
              <AdminField label="Note text">
                <textarea className={`${ADMIN_INPUT} resize-none`} rows={2} value={note.note_text} onChange={(e) => setNotes((p) => p.map((n, i) => (i === index ? { ...n, note_text: e.target.value } : n)))} />
              </AdminField>
              <label className="inline-flex items-center gap-2 text-sm text-[#5c5248]">
                <input type="checkbox" checked={note.is_active} onChange={(e) => setNotes((p) => p.map((n, i) => (i === index ? { ...n, is_active: e.target.checked } : n)))} />
                Active
              </label>
            </AdminCard>
          ))}
        </AdminRepeatableSection>

        <button type="submit" disabled={saveMutation.isPending} className="w-full sm:w-auto px-6 py-3 bg-[#1a1714] text-white text-sm uppercase tracking-wider disabled:opacity-60">
          {saveMutation.isPending ? 'Saving…' : 'Save Returns'}
        </button>
      </form>
    </div>
  );
}
