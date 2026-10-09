import { Button } from 'react-bootstrap';
import { useTheme, type Theme } from '../theme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="btn-group theme-toggle" role="group" aria-label="Color theme">
      <ThemeChoice
        theme="light"
        current={theme}
        icon="bi-sun-fill"
        label="Light"
        onSelect={setTheme}
      />
      <ThemeChoice
        theme="dark"
        current={theme}
        icon="bi-moon-stars-fill"
        label="Dark"
        onSelect={setTheme}
      />
    </div>
  );
}

function ThemeChoice({
  theme,
  current,
  icon,
  label,
  onSelect,
}: {
  theme: Theme;
  current: Theme;
  icon: string;
  label: string;
  onSelect: (theme: Theme) => void;
}) {
  const selected = current === theme;

  return (
    <Button
      type="button"
      size="sm"
      variant={selected ? 'light' : 'outline-light'}
      aria-pressed={selected}
      aria-label={`${label} mode`}
      onClick={() => onSelect(theme)}
    >
      <i className={`bi ${icon}`} aria-hidden="true" />
      <span className="ms-1">{label}</span>
    </Button>
  );
}
