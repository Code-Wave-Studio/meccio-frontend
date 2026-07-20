import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] bg-cream flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.img
          src="/logo.png"
          alt="MECCIO RUGS"
          width={128}
          height={128}
          className="h-28 w-28 md:h-32 md:w-32 mx-auto mb-8 rounded-full object-cover shadow-[0_12px_40px_rgba(44,40,37,0.18)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <div className="w-40 h-px bg-sand mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-gold"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
