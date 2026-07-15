import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupportLayout from '@/components/SupportLayout';
import { FaqSchema } from '@/components/SEO';
import { contentApi } from '@/lib/api';
import type { FAQ } from '@/types';

function FaqItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-sand/40 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 text-left hover:bg-ivory/50 transition-colors"
      >
        <span className="font-medium text-charcoal text-sm sm:text-base pr-2 sm:pr-4">{faq.question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 text-stone text-sm leading-relaxed border-t border-sand/30 pt-4">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [openId, setOpenId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => contentApi.faqs().then((r) => r.data.data),
  });

  const faqs = data?.faqs ?? (Array.isArray(data) ? data : []);
  const pageMeta = data?.meta ?? {};

  const categories = useMemo(() => {
    const cats = [...new Set(faqs.map((f: FAQ) => f.category).filter(Boolean))] as string[];
    return ['All', ...cats];
  }, [faqs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((faq: FAQ) => {
      const matchCat = category === 'All' || faq.category === category;
      const matchQ = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [faqs, query, category]);

  const grouped = useMemo(() => {
    if (category !== 'All') return { [category]: filtered };
    return filtered.reduce((acc: Record<string, FAQ[]>, faq: FAQ) => {
      const cat = faq.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(faq);
      return acc;
    }, {});
  }, [filtered, category]);

  return (
    <SupportLayout
      active="faq"
      title={pageMeta.title ?? 'Frequently Asked Questions'}
      subtitle={pageMeta.subtitle ?? 'Answers about orders, materials, care, shipping, and our bespoke rug services.'}
      seoDescription="Frequently asked questions about MECCIO luxury rugs, shipping, returns, and care."
    >
      <FaqSchema faqs={filtered.map((f) => ({ question: f.question, answer: f.answer }))} />
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions..."
              className="input-luxury pl-11"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3.5 sm:px-4 py-2 text-[10px] sm:text-xs uppercase tracking-[0.1em] border transition-all ${
                category === cat
                  ? 'bg-charcoal text-cream border-charcoal'
                  : 'bg-white text-stone border-sand/40 hover:border-gold/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center bg-ivory border border-sand/40">
            <p className="text-stone mb-4">No questions match your search.</p>
            <Link to="/contact" className="btn-outline text-xs">Ask Our Team</Link>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              {category === 'All' && (
                <h2 className="font-display text-lg sm:text-xl text-charcoal mb-3 sm:mb-4">{cat}</h2>
              )}
              <div className="space-y-3">
                {(items as FAQ[]).map((faq) => (
                  <FaqItem
                    key={faq.id}
                    faq={faq}
                    isOpen={openId === faq.id}
                    onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
          <Link to="/size-guide" className="group p-4 sm:p-6 bg-white border border-sand/40 hover:border-gold/40 transition-colors">
            <p className="luxury-subheading mb-2">Sizing</p>
            <p className="font-display text-base sm:text-lg mb-2 group-hover:text-gold-dark transition-colors">Size Guide</p>
            <p className="text-xs sm:text-sm text-stone">Find the perfect rug dimensions for every room.</p>
          </Link>
          <Link to="/contact" className="group p-4 sm:p-6 bg-white border border-sand/40 hover:border-gold/40 transition-colors">
            <p className="luxury-subheading mb-2">Support</p>
            <p className="font-display text-base sm:text-lg mb-2 group-hover:text-gold-dark transition-colors">Contact Us</p>
            <p className="text-xs sm:text-sm text-stone">Speak with our team for personalized assistance.</p>
          </Link>
        </div>
      </div>
    </SupportLayout>
  );
}
