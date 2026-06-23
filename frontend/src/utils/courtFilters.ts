import type { CourtStatusView } from '../types';

export type LightingFilter = 'lit' | 'unlit';

export interface CourtFilterState {
  surfaces: string[];
  lighting: LightingFilter[];
}

export const EMPTY_COURT_FILTERS: CourtFilterState = {
  surfaces: [],
  lighting: [],
};

export function getSurfaceTypes(courts: CourtStatusView[]): string[] {
  const seen = new Set<string>();
  for (const court of courts) {
    if (court.surface_type) {
      seen.add(court.surface_type);
    }
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

export function filterCourts(
  courts: CourtStatusView[],
  filters: CourtFilterState,
): CourtStatusView[] {
  return courts.filter((court) => {
    const surfaceMatches =
      filters.surfaces.length === 0 || filters.surfaces.includes(court.surface_type);

    const lightingMatches =
      filters.lighting.length === 0 ||
      filters.lighting.includes(court.has_lighting ? 'lit' : 'unlit');

    return surfaceMatches && lightingMatches;
  });
}
