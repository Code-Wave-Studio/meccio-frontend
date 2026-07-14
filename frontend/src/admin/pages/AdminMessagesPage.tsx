import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

type ContactMessage = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  is_read?: number;
  created_at: string;
};

type Inquiry = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  room_type?: string;
  dimensions?: string;
  material?: string;
  budget_range?: string;
  color_preferences?: string;
  notes?: string;
  extra_data?: string;
  created_at: string;
};

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: async () => {
      const res = await adminApi.messages.list();
      return res.data?.data as { messages: ContactMessage[]; inquiries: Inquiry[] };
    },
  });

  const messages = Array.isArray(data?.messages) ? data.messages : [];
  const inquiries = Array.isArray(data?.inquiries) ? data.inquiries : [];

  const markReadMutation = useMutation({
    mutationFn: (id: number) => adminApi.messages.markRead(id),
    onSuccess: () => {
      toast.success('Marked as read');
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
    },
    onError: () => toast.error('Could not update message'),
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium">Messages</h1>
        <p className="text-sm text-[#9c8b7a] mt-1">Contact form and custom rug inquiries</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Contact messages</h2>
        <div className="bg-white border border-[#e8e0d5]">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#c4a962]" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                    <th className="text-left px-4 py-3 font-medium">From</th>
                    <th className="text-left px-4 py-3 font-medium">Subject</th>
                    <th className="text-left px-4 py-3 font-medium">Message</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-right px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-[#9c8b7a]">No messages</td></tr>
                  ) : (
                    messages.map((m) => (
                      <tr key={m.id} className={`border-t border-[#efe7dc] ${m.is_read ? '' : 'bg-[#faf8f5]'}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{m.name}</p>
                          <p className="text-[11px] text-[#9c8b7a]">{m.email}</p>
                          {m.phone && <p className="text-[11px] text-[#9c8b7a]">{m.phone}</p>}
                        </td>
                        <td className="px-4 py-3">{m.subject || '—'}</td>
                        <td className="px-4 py-3 max-w-xs"><p className="line-clamp-2 text-[#6f655c]">{m.message}</p></td>
                        <td className="px-4 py-3 text-xs text-[#9c8b7a] whitespace-nowrap">{formatDate(m.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          {m.is_read ? (
                            <span className="text-[10px] uppercase tracking-wider text-[#9c8b7a]">Read</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markReadMutation.mutate(m.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider border border-[#e8e0d5] hover:border-[#c4a962]"
                            >
                              <Check size={12} /> Mark read
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Custom rug inquiries</h2>
        <div className="bg-white border border-[#e8e0d5]">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#c4a962]" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-[#9c8b7a]">
                    <th className="text-left px-4 py-3 font-medium">Contact</th>
                    <th className="text-left px-4 py-3 font-medium">Details</th>
                    <th className="text-left px-4 py-3 font-medium">Message</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-[#9c8b7a]">No inquiries</td></tr>
                  ) : (
                    inquiries.map((inq) => {
                      let extras = '';
                      try {
                        if (inq.extra_data) {
                          const parsed = JSON.parse(inq.extra_data) as Record<string, string>;
                          extras = Object.entries(parsed)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' · ');
                        }
                      } catch {
                        extras = '';
                      }
                      return (
                      <tr key={inq.id} className="border-t border-[#efe7dc]">
                        <td className="px-4 py-3">
                          <p className="font-medium">{inq.name}</p>
                          <p className="text-[11px] text-[#9c8b7a]">{inq.email}</p>
                          {inq.phone && <p className="text-[11px] text-[#9c8b7a]">{inq.phone}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#6f655c]">
                          {[inq.room_type, inq.dimensions, inq.material, inq.budget_range, extras]
                            .filter(Boolean)
                            .join(' · ') || '—'}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="line-clamp-2 text-[#6f655c]">{inq.notes || inq.color_preferences || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#9c8b7a] whitespace-nowrap">{formatDate(inq.created_at)}</td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
