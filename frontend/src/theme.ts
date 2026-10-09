import { useCallback, useLayoutEffect, useState } from 'react';

/** Must match the key in the blocking script in `frontend/index.html`. */
export const THEME_STORAGE_KEY = 'grab-a-court-theme';

export type Theme = 'light' | 'dark';

export function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function getSystemTheme(): Theme {
  try {
    if (typeof window.matchMedia !== 'function') {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** Saved choice wins. Otherwise follow the operating system. */
export function resolveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-bs-theme', theme);
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Keep the in-memory choice if storage is unavailable.
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(resolveTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useLayoutEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    if (typeof media.addEventListener !== 'function') {
      return;
    }

    const onChange = () => {
      if (!getStoredTheme()) {
        setThemeState(getSystemTheme());
      }
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    storeTheme(next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
