import { Button } from 'react-bootstrap';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline-light"
      size="sm"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}`} />
    </Button>
  );
}
