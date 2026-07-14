import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] bg-cream flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.h1
          className="font-display text-5xl tracking-[0.3em] text-charcoal mb-8"
          initial={{ letterSpacing: '0.5em', opacity: 0 }}
          animate={{ letterSpacing: '0.3em', opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          MECCIO
        </motion.h1>
        <div className="w-48 h-px bg-sand mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-gold"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
