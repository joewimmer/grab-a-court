import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY } from '../theme/theme';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    document.documentElement.setAttribute('data-bs-theme', 'light');
  });

  it('switches theme on click and persists preference', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: 'Switch to dark mode' });
    fireEvent.click(button);

    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeInTheDocument();
  });
});
