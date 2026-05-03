// Format date from ISO to "30 Jul 2025"
export function fmtDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

// CGPA grade badge
export function getGrade(cgpa) {
  const c = parseFloat(cgpa) || 0;
  if (c >= 9) return { grade: 'O', color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/30' };
  if (c >= 8) return { grade: 'A+', color: 'text-primary', bg: 'bg-primary/10 border-primary/30' };
  if (c >= 7) return { grade: 'A', color: 'text-tertiary', bg: 'bg-tertiary/10 border-tertiary/30' };
  if (c >= 6) return { grade: 'B+', color: 'text-on-surface-variant', bg: 'bg-surface-variant border-outline-variant/30' };
  return { grade: 'B', color: 'text-outline', bg: 'bg-surface-container border-outline-variant/30' };
}
