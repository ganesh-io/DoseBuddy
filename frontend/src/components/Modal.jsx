import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`relative ${sizeMap[size]} w-full bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-2xl overflow-hidden z-10`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
                <h3 className="font-display font-semibold text-lg text-on-surface">{title}</h3>
                <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            )}
            <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
