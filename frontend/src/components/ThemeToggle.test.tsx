import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { THEME_STORAGE_KEY } from '../theme';

function installMatchMedia(prefersDark: boolean) {
  let matches = prefersDark;
  const listeners = new Set<(event: { matches: boolean }) => void>();

  const matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return query === '(prefers-color-scheme: dark)' ? matches : false;
    },
    media: query,
    addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
      listeners.delete(listener);
    },
  }));

  vi.stubGlobal('matchMedia', matchMedia);

  return {
    setPrefersDark(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener({ matches: next }));
    },
  };
}

function themeButton(name: 'Light mode' | 'Dark mode') {
  return screen.getByRole('button', { name });
}

describe('ThemeToggle', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-bs-theme');
  });

  it('defaults to the OS preference when no choice is saved', () => {
    installMatchMedia(true);
    render(<ThemeToggle />);

    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark');
    expect(themeButton('Dark mode')).toHaveAttribute('aria-pressed', 'true');
    expect(themeButton('Light mode')).toHaveAttribute('aria-pressed', 'false');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('defaults to light when the OS prefers light', () => {
    installMatchMedia(false);
    render(<ThemeToggle />);

    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'light');
    expect(themeButton('Light mode')).toHaveAttribute('aria-pressed', 'true');
  });

  it('restores the saved theme across reloads', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    installMatchMedia(false);

    const { unmount } = render(<ThemeToggle />);
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark');
    expect(themeButton('Dark mode')).toHaveAttribute('aria-pressed', 'true');
    unmount();

    render(<ThemeToggle />);
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark');
    expect(themeButton('Dark mode')).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches theme and remembers the choice', () => {
    installMatchMedia(false);
    render(<ThemeToggle />);

    fireEvent.click(themeButton('Dark mode'));

    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(themeButton('Dark mode')).toHaveAttribute('aria-pressed', 'true');
    expect(themeButton('Light mode')).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(themeButton('Light mode'));

    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(themeButton('Light mode')).toHaveAttribute('aria-pressed', 'true');
  });

  it('follows OS changes until the user picks a theme', () => {
    const media = installMatchMedia(false);
    render(<ThemeToggle />);
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'light');

    act(() => {
      media.setPrefersDark(true);
    });
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    fireEvent.click(themeButton('Light mode'));
    act(() => {
      media.setPrefersDark(true);
    });

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'light');
  });
});
