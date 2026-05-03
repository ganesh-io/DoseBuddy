import { motion } from 'framer-motion';

const profColors = {
  High: 'bg-secondary/10 border-secondary/30 text-secondary',
  Medium: 'bg-primary/10 border-primary/30 text-primary',
  Low: 'bg-surface-container border-outline-variant/50 text-on-surface-variant',
};

export default function SkillChip({ name, proficiency = 'Medium', onDelete, delay = 0 }) {
  const cls = profColors[proficiency] || profColors.Medium;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
      className={`${cls} px-3 py-1.5 rounded-full text-[12px] font-semibold tracking-wide flex items-center gap-2 border cursor-default hover:opacity-90 transition-opacity`}
    >
      {name}
      {proficiency === 'High' && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
      {onDelete && (
        <button onClick={onDelete} className="hover:opacity-70 ml-1">
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      )}
    </motion.div>
  );
}
