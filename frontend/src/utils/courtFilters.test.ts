import { describe, expect, it } from 'vitest';
import {
  EMPTY_COURT_FILTERS,
  filterCourts,
  getSurfaceTypes,
} from './courtFilters';
import type { CourtStatusView } from '../types';

function court(
  id: number,
  surface_type: string,
  has_lighting: boolean,
): CourtStatusView {
  return {
    id,
    name: `Court ${id}`,
    surface_type,
    has_lighting,
    status: 'available',
    current_reservation: null,
    upcoming_reservations: [],
  };
}

const courts: CourtStatusView[] = [
  court(1, 'Hard', true),
  court(2, 'Clay', true),
  court(3, 'Hard', false),
  court(4, 'Grass', false),
];

describe('getSurfaceTypes', () => {
  it('returns distinct surfaces sorted alphabetically', () => {
    expect(getSurfaceTypes(courts)).toEqual(['Clay', 'Grass', 'Hard']);
  });

  it('returns an empty array for no courts', () => {
    expect(getSurfaceTypes([])).toEqual([]);
  });
});

describe('filterCourts', () => {
  it('returns all courts when no filters are selected', () => {
    expect(filterCourts(courts, EMPTY_COURT_FILTERS)).toHaveLength(4);
  });

  it('filters by a single surface type', () => {
    const result = filterCourts(courts, { surfaces: ['Hard'], lighting: [] });
    expect(result.map((c) => c.id)).toEqual([1, 3]);
  });

  it('filters by multiple surface types', () => {
    const result = filterCourts(courts, {
      surfaces: ['Clay', 'Grass'],
      lighting: [],
    });
    expect(result.map((c) => c.id)).toEqual([2, 4]);
  });

  it('filters by lit courts', () => {
    const result = filterCourts(courts, { surfaces: [], lighting: ['lit'] });
    expect(result.map((c) => c.id)).toEqual([1, 2]);
  });

  it('filters by unlit courts', () => {
    const result = filterCourts(courts, { surfaces: [], lighting: ['unlit'] });
    expect(result.map((c) => c.id)).toEqual([3, 4]);
  });

  it('ignores lighting when both lit and unlit are selected', () => {
    const result = filterCourts(courts, {
      surfaces: [],
      lighting: ['lit', 'unlit'],
    });
    expect(result).toHaveLength(4);
  });

  it('combines surface and lighting filters', () => {
    const result = filterCourts(courts, {
      surfaces: ['Hard'],
      lighting: ['lit'],
    });
    expect(result.map((c) => c.id)).toEqual([1]);
  });
});
