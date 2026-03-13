import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const display = hovered ?? value;

  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          className="p-0.5 transition-colors hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(value === star ? 0 : star)}
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              star <= display
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-muted-foreground/40',
            )}
          />
        </button>
      ))}
    </div>
  );
}
