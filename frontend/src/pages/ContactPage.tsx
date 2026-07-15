import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import { contentApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: Record<string, string>) => {
    try {
      await contentApi.contact(data);
      toast.success('Message sent successfully');
      reset();
    } catch {
      toast.error('Failed to send message');
    }
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with MECCIO for luxury rug inquiries, custom orders, and design consultations."
        keywords="contact MECCIO, custom rug inquiry, luxury rug support"
      />
      <div className="container-luxury py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <h1 className="luxury-heading text-3xl sm:text-4xl md:text-5xl mb-6">Get in Touch</h1>
            <p className="text-stone leading-relaxed mb-12">
              Whether you're an interior designer sourcing for a project, a hotel developer,
              or a homeowner seeking the perfect rug — we'd love to hear from you.
            </p>
            <div className="space-y-6">
              {[
                { icon: Mail, label: 'Email', value: 'hello@meccio.com' },
                { icon: Phone, label: 'Phone', value: '+1 (888) 633-2466' },
                { icon: MapPin, label: 'Showrooms', value: 'New York · London · Dubai · Mumbai' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <Icon size={20} className="text-gold mt-1" />
                  <div>
                    <p className="luxury-subheading mb-1">{label}</p>
                    <p className="text-charcoal">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white border border-sand/30 p-8 space-y-4"
          >
            <input {...register('name', { required: true })} placeholder="Full Name *" className="input-luxury" />
            <input {...register('email', { required: true })} type="email" placeholder="Email *" className="input-luxury" />
            <input {...register('phone')} placeholder="Phone" className="input-luxury" />
            <input {...register('subject')} placeholder="Subject" className="input-luxury" />
            <textarea {...register('message', { required: true })} placeholder="Your Message *" rows={5} className="input-luxury resize-none" />
            <button type="submit" className="btn-primary w-full">Send Message</button>
          </motion.form>
        </div>
      </div>
    </>
  );
}
