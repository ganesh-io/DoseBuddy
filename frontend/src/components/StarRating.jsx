import { useState } from 'react';

export default function StarRating({ value = 0, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const sizeMap = { sm: 'text-[18px]', md: 'text-[24px]', lg: 'text-[32px]' };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`${sizeMap[size]} transition-all duration-150 ${
            star <= (hover || value) ? 'text-tertiary scale-110' : 'text-outline-variant hover:text-outline'
          }`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: star <= (hover || value) ? "'FILL' 1" : "'FILL' 0" }}>
            star
          </span>
        </button>
      ))}
    </div>
  );
}
