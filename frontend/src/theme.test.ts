import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  storeTheme,
} from './theme';

function mockMatchMedia(prefersDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe('theme preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-bs-theme');
  });

  it('uses a saved choice instead of the OS preference', () => {
    mockMatchMedia(true);
    storeTheme('light');
    expect(resolveTheme()).toBe('light');

    storeTheme('dark');
    mockMatchMedia(false);
    expect(resolveTheme()).toBe('dark');
  });

  it('follows the OS preference when nothing is saved', () => {
    mockMatchMedia(true);
    expect(getStoredTheme()).toBeNull();
    expect(resolveTheme()).toBe('dark');

    mockMatchMedia(false);
    expect(getSystemTheme()).toBe('light');
    expect(resolveTheme()).toBe('light');
  });

  it('ignores stored values that are not light or dark', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    mockMatchMedia(true);
    expect(getStoredTheme()).toBeNull();
    expect(resolveTheme()).toBe('dark');
  });

  it('falls back to light when storage and matchMedia are unavailable', () => {
    const getItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = () => {
      throw new Error('storage blocked');
    };
    vi.stubGlobal('matchMedia', undefined);

    expect(getStoredTheme()).toBeNull();
    expect(getSystemTheme()).toBe('light');
    expect(resolveTheme()).toBe('light');

    localStorage.getItem = getItem;
  });

  it('applies the theme on the document element', () => {
    applyTheme('dark');
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark');
  });

  it('still applies a theme when persisting the choice fails', () => {
    const setItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error('storage blocked');
    };

    expect(() => storeTheme('dark')).not.toThrow();
    applyTheme('dark');
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark');

    localStorage.setItem = setItem;
  });
});
