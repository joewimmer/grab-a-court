import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CourtFilters } from './CourtFilters';
import { EMPTY_COURT_FILTERS } from '../utils/courtFilters';

describe('CourtFilters', () => {
  it('renders a checkbox per surface type and lighting option', () => {
    render(
      <CourtFilters
        surfaceTypes={['Hard', 'Clay']}
        filters={EMPTY_COURT_FILTERS}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Hard')).toBeInTheDocument();
    expect(screen.getByLabelText('Clay')).toBeInTheDocument();
    expect(screen.getByLabelText('Lights')).toBeInTheDocument();
    expect(screen.getByLabelText('No lights')).toBeInTheDocument();
  });

  it('adds a surface when its checkbox is toggled on', () => {
    const onChange = vi.fn();
    render(
      <CourtFilters
        surfaceTypes={['Hard', 'Clay']}
        filters={EMPTY_COURT_FILTERS}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Hard'));
    expect(onChange).toHaveBeenCalledWith({ surfaces: ['Hard'], lighting: [] });
  });

  it('removes a surface when an active checkbox is toggled off', () => {
    const onChange = vi.fn();
    render(
      <CourtFilters
        surfaceTypes={['Hard', 'Clay']}
        filters={{ surfaces: ['Hard'], lighting: [] }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Hard'));
    expect(onChange).toHaveBeenCalledWith({ surfaces: [], lighting: [] });
  });

  it('adds a lighting filter when toggled', () => {
    const onChange = vi.fn();
    render(
      <CourtFilters
        surfaceTypes={['Hard']}
        filters={EMPTY_COURT_FILTERS}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('No lights'));
    expect(onChange).toHaveBeenCalledWith({ surfaces: [], lighting: ['unlit'] });
  });

  it('hides the clear button when no filters are active', () => {
    render(
      <CourtFilters
        surfaceTypes={['Hard']}
        filters={EMPTY_COURT_FILTERS}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /clear filters/i }),
    ).not.toBeInTheDocument();
  });

  it('clears all filters when the clear button is clicked', () => {
    const onChange = vi.fn();
    render(
      <CourtFilters
        surfaceTypes={['Hard']}
        filters={{ surfaces: ['Hard'], lighting: ['lit'] }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(onChange).toHaveBeenCalledWith({ surfaces: [], lighting: [] });
  });
});
