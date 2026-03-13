import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { Monitor, Moon, Sun } from 'lucide-react';

const cycle = ['system', 'light', 'dark'] as const;
const icons = { system: Monitor, light: Sun, dark: Moon } as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme];

  const next = () => {
    const idx = cycle.indexOf(theme);
    setTheme(cycle[(idx + 1) % cycle.length]);
  };

  return (
    <Button variant="ghost" size="icon" onClick={next} aria-label="Changer le thème">
      <Icon className="h-5 w-5" />
    </Button>
  );
}
