import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CourtFilters } from './CourtFilters';
import type { LightingSelection } from './CourtFilters';

const surfaceTypes = ['Clay', 'Hard'];
const noLighting: LightingSelection = { lights: false, noLights: false };

describe('CourtFilters', () => {
  it('renders a checkbox for each surface type and lighting option', () => {
    render(
      <CourtFilters
        surfaceTypes={surfaceTypes}
        selectedSurfaces={[]}
        selectedLighting={noLighting}
        onToggleSurface={vi.fn()}
        onToggleLighting={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Clay')).toBeInTheDocument();
    expect(screen.getByLabelText('Hard')).toBeInTheDocument();
    expect(screen.getByLabelText('Lights')).toBeInTheDocument();
    expect(screen.getByLabelText('No lights')).toBeInTheDocument();
  });

  it('reflects the selected surfaces and lighting as checked', () => {
    render(
      <CourtFilters
        surfaceTypes={surfaceTypes}
        selectedSurfaces={['Clay']}
        selectedLighting={{ lights: true, noLights: false }}
        onToggleSurface={vi.fn()}
        onToggleLighting={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Clay')).toBeChecked();
    expect(screen.getByLabelText('Hard')).not.toBeChecked();
    expect(screen.getByLabelText('Lights')).toBeChecked();
    expect(screen.getByLabelText('No lights')).not.toBeChecked();
  });

  it('calls onToggleSurface when a surface checkbox is clicked', () => {
    const onToggleSurface = vi.fn();
    render(
      <CourtFilters
        surfaceTypes={surfaceTypes}
        selectedSurfaces={[]}
        selectedLighting={noLighting}
        onToggleSurface={onToggleSurface}
        onToggleLighting={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Hard'));
    expect(onToggleSurface).toHaveBeenCalledWith('Hard');
  });

  it('calls onToggleLighting when a lighting checkbox is clicked', () => {
    const onToggleLighting = vi.fn();
    render(
      <CourtFilters
        surfaceTypes={surfaceTypes}
        selectedSurfaces={[]}
        selectedLighting={noLighting}
        onToggleSurface={vi.fn()}
        onToggleLighting={onToggleLighting}
      />,
    );

    fireEvent.click(screen.getByLabelText('No lights'));
    expect(onToggleLighting).toHaveBeenCalledWith('noLights');
  });
});
