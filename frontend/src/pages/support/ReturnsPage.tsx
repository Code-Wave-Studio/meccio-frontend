import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupportLayout from '@/components/SupportLayout';
import { contentApi } from '@/lib/api';
import { getSupportIcon } from '@/lib/supportIcons';

const FALLBACK_CARDS = [
  { title: '30-Day Returns', description: 'Unused rugs in original packaging may be returned within 30 days of delivery for a full refund of the product price.', icon: 'check' },
  { title: 'Final Sale Items', description: 'Custom, bespoke, and made-to-order rugs are crafted specifically for you and cannot be returned unless defective.', icon: 'package-x' },
];

const FALLBACK_STEPS = [
  { step_code: '01', title: 'Contact Support', description: 'Email care@meccio.com with your order number within 30 days of delivery.' },
  { step_code: '02', title: 'Receive Authorization', description: 'Our team will provide return instructions and a return authorization if eligible.' },
  { step_code: '03', title: 'Ship Your Rug', description: 'Pack the rug securely in its original packaging to prevent damage in transit.' },
  { step_code: '04', title: 'Inspection & Refund', description: 'Once received and inspected, refunds are processed within 5–10 business days.' },
];

const FALLBACK_NOTES = [
  'Refunds are issued to the original payment method.',
  'Complimentary worldwide shipping is included on all orders.',
  "Return shipping costs are the customer's responsibility unless otherwise stated.",
  'Rugs showing signs of use, damage, or pet hair may not qualify for a full refund.',
];

export default function ReturnsPage() {
  const { data } = useQuery({
    queryKey: ['support', 'returns'],
    queryFn: () => contentApi.returnsInfo().then((r) => r.data.data),
  });

  const meta = data?.meta ?? {};
  const cards = data?.policy_cards?.length ? data.policy_cards : FALLBACK_CARDS;
  const steps = data?.process_steps?.length ? data.process_steps : FALLBACK_STEPS;
  const notes = data?.refund_notes?.length ? data.refund_notes : FALLBACK_NOTES;
  const contactEmail = meta.contact_email ?? 'care@meccio.com';

  return (
    <SupportLayout
      active="returns"
      title={meta.title ?? 'Returns & Refunds'}
      subtitle={meta.subtitle ?? "We want you to love your rug. Here's how returns and refunds work at MECCIO."}
      seoTitle="Returns & Refunds"
      seoDescription="MECCIO return policy, refund process, and eligibility for luxury rug orders."
    >
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {cards.map((card: { title: string; description: string; icon: string }) => {
            const Icon = getSupportIcon(card.icon);
            return (
              <div key={card.title} className="p-4 sm:p-6 bg-white border border-sand/40">
                <Icon size={20} className={`mb-3 ${card.icon === 'package-x' ? 'text-stone' : 'text-gold-dark'}`} />
                <h3 className="font-display text-base sm:text-lg mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-stone leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="font-display text-xl sm:text-2xl text-charcoal mb-4 sm:mb-6">Return Process</h2>
          <div className="space-y-3 sm:space-y-4">
            {steps.map((step: { step_code: string; title: string; description: string }) => (
              <div key={step.step_code} className="flex gap-3 sm:gap-5 p-4 sm:p-5 md:p-6 bg-white border border-sand/40">
                <span className="shrink-0 font-display text-lg sm:text-xl text-gold">{step.step_code}</span>
                <div>
                  <h3 className="font-medium text-charcoal text-sm sm:text-base mb-1">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-stone leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 border border-sand/40 bg-ivory">
          <h2 className="font-display text-lg sm:text-xl text-charcoal mb-3 sm:mb-4">Refund Policy</h2>
          <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-stone leading-relaxed">
            {notes.map((note: string) => (
              <li key={note} className="flex gap-3">
                <span className="text-gold">•</span> {note}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 border border-amber-200/60 bg-amber-50/50">
          <AlertCircle size={18} className="shrink-0 text-amber-700 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
            {meta.alert_text ?? "Received a damaged item? Contact us within 48 hours of delivery with photos — we'll resolve it promptly."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-charcoal text-cream">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-display text-base sm:text-lg">Start a return</p>
              <p className="text-xs sm:text-sm text-cream/70 break-all">{contactEmail}</p>
            </div>
          </div>
          <Link to="/contact" className="btn-gold shrink-0 text-center w-full sm:w-auto">Contact Support</Link>
        </div>
      </div>
    </SupportLayout>
  );
}
