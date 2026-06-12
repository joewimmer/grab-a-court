import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  THEME_STORAGE_KEY,
} from './theme';

describe('theme', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('data-bs-theme');
  });

  describe('getStoredTheme', () => {
    it('returns the stored theme when set to light', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      expect(getStoredTheme()).toBe('light');
    });

    it('returns the stored theme when set to dark', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      expect(getStoredTheme()).toBe('dark');
    });

    it('falls back to dark when no preference is stored and OS prefers dark', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true,
      } as MediaQueryList);
      expect(getStoredTheme()).toBe('dark');
    });

    it('falls back to light when no preference is stored and OS prefers light', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: false,
      } as MediaQueryList);
      expect(getStoredTheme()).toBe('light');
    });

    it('ignores invalid stored values', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'rainbow');
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: false,
      } as MediaQueryList);
      expect(getStoredTheme()).toBe('light');
    });
  });

  it('persists the theme via setStoredTheme', () => {
    setStoredTheme('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('applies the theme to the document element', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });
});
