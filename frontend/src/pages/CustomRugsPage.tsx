import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Palette,
  Ruler,
  Sparkles,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import { contentApi } from '@/lib/api';
import { usePageImages } from '@/hooks/usePageImages';
import { parseSettingJson, useSiteSettings } from '@/hooks/useSiteSettings';
import {
  DEFAULT_CUSTOM_RUG_FORM_FIELDS,
  normalizeCustomRugFields,
  type CustomRugFormField,
  type CustomRugFieldSection,
} from '@/lib/customRugForm';

const PROCESS_STEPS = [
  { step: '01', title: 'Share Your Vision', desc: 'Tell us about your space, style, and dimensions.' },
  { step: '02', title: 'Design Consultation', desc: 'Our artisans refine materials, colors, and patterns with you.' },
  { step: '03', title: 'Handcrafted Creation', desc: 'Master weavers bring your bespoke rug to life.' },
  { step: '04', title: 'White-Glove Delivery', desc: 'Carefully delivered and placed in your home.' },
];

const SECTION_META: Record<CustomRugFieldSection, { title: string; subtitle: string; icon: typeof User }> = {
  contact: { title: 'Contact Details', subtitle: 'How we can reach you', icon: User },
  project: { title: 'Project Details', subtitle: 'Tell us about your space', icon: Ruler },
  preferences: { title: 'Design Preferences', subtitle: 'Materials, colors & budget', icon: Palette },
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] uppercase tracking-[0.14em] text-stone font-medium mb-2">
      {children}
      {required && <span className="text-gold-dark ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-600">{message}</p>;
}

export default function CustomRugsPage() {
  const { customRugsHeroImage } = usePageImages();
  const { data: settings = {} } = useSiteSettings();
  const [submitting, setSubmitting] = useState(false);

  const fields = normalizeCustomRugFields(
    parseSettingJson(settings.custom_rug_form_fields, DEFAULT_CUSTOM_RUG_FORM_FIELDS),
  ).filter((f) => f.enabled);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Record<string, string>>();

  const onSubmit = async (data: Record<string, string>) => {
    setSubmitting(true);
    try {
      await contentApi.customRug(data);
      toast.success('Inquiry submitted! Our design team will reach out within 24 hours.');
      reset();
    } catch {
      toast.error('Submission failed. Please try again or email hello@meccio.com');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `input-luxury ${hasError ? 'border-red-400 focus:border-red-500' : ''}`;

  const sections = (['contact', 'project', 'preferences'] as CustomRugFieldSection[])
    .map((section) => ({
      section,
      fields: fields.filter((f) => f.section === section),
      ...SECTION_META[section],
    }))
    .filter((s) => s.fields.length > 0);

  const renderField = (field: CustomRugFormField) => {
    const rules: Record<string, unknown> = {};
    if (field.required) {
      rules.required = `${field.label} is required`;
    }
    if (field.type === 'email') {
      rules.pattern = {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Enter a valid email',
      };
    }

    const error = errors[field.key]?.message as string | undefined;
    const widthClass = field.width === 'half' ? '' : 'sm:col-span-2';

    return (
      <div key={field.id} className={widthClass}>
        <FieldLabel required={field.required}>{field.label}</FieldLabel>
        {field.type === 'select' ? (
          <select {...register(field.key, rules)} className={inputClass(!!error)}>
            <option value="">Select {field.label.toLowerCase()}</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            {...register(field.key, rules)}
            rows={4}
            className={`${inputClass(!!error)} resize-none`}
            placeholder={field.placeholder || ''}
          />
        ) : (
          <input
            {...register(field.key, rules)}
            type={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
            autoComplete={field.key === 'name' ? 'name' : field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : undefined}
            className={inputClass(!!error)}
            placeholder={field.placeholder || ''}
          />
        )}
        <FieldError message={error} />
      </div>
    );
  };

  return (
    <>
      <SEO
        title="Custom Rugs"
        description="Commission bespoke luxury rugs tailored to your exact specifications. Custom sizes, colors, and patterns."
      />

      <section className="relative min-h-[50vh] md:min-h-[55vh] flex items-end overflow-hidden">
        <img
          src={customRugsHeroImage}
          alt="Custom luxury rugs"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/40 to-espresso/20" />
        <div className="relative container-luxury pb-12 md:pb-16 pt-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="luxury-subheading text-gold-light mb-4">Bespoke Commission</p>
            <h1 className="font-display text-4xl md:text-6xl text-cream mb-4 max-w-2xl">
              Custom Rugs, Crafted for You
            </h1>
            <p className="text-cream/80 text-lg max-w-xl leading-relaxed">
              From concept to completion — collaborate with our artisans to create a one-of-a-kind
              masterpiece for your space.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-luxury py-10 md:py-14">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16">
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <h2 className="luxury-heading text-3xl md:text-4xl mb-4">Your Vision, Our Craft</h2>
            <p className="text-stone leading-relaxed mb-10">
              Every MECCIO custom rug is hand-knotted by master artisans using premium materials.
              Share your requirements and we&apos;ll guide you through a seamless design journey.
            </p>

            <div className="space-y-6 mb-10">
              {PROCESS_STEPS.map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <span className="shrink-0 w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center text-xs font-medium text-gold-dark">
                    {step}
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-charcoal mb-1">{title}</h3>
                    <p className="text-sm text-stone leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6 space-y-3">
              {[
                'Complimentary design consultation',
                'Material samples on request',
                '8–14 week lead time for custom orders',
                'Worldwide white-glove delivery',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-charcoal">
                  <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="bg-white border border-sand/40 shadow-[0_20px_60px_rgba(44,40,37,0.06)]"
            >
              {sections.map(({ section, fields: sectionFields, title, subtitle, icon: Icon }, sectionIndex) => (
                <div
                  key={section}
                  className={`p-6 md:p-8 ${sectionIndex < sections.length - 1 ? 'border-b border-sand/30' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-full bg-ivory flex items-center justify-center">
                      <Icon size={18} className="text-gold-dark" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-charcoal">{title}</h3>
                      <p className="text-xs text-stone">{subtitle}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {sectionFields.map(renderField)}
                  </div>

                  {sectionIndex === sections.length - 1 && (
                    <>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Submit Custom Inquiry
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs text-stone mt-4">
                        We typically respond within 24 hours on business days.
                      </p>
                    </>
                  )}
                </div>
              ))}
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
