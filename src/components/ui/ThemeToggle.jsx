import { Moon, Sun } from 'lucide-react';
import { IconButton } from './Button';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ size = 44, variant = 'ghost' }) {
  const { isDark, toggle } = useTheme();
  return <IconButton icon={isDark ? Sun : Moon} label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggle} size={size} variant={variant} />;
}
