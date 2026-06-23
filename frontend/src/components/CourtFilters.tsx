import { Button, Form } from 'react-bootstrap';
import type {
  CourtFilterState,
  LightingFilter,
} from '../utils/courtFilters';

interface CourtFiltersProps {
  surfaceTypes: string[];
  filters: CourtFilterState;
  onChange: (filters: CourtFilterState) => void;
}

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

const LIGHTING_OPTIONS: Array<{ value: LightingFilter; label: string }> = [
  { value: 'lit', label: 'Lights' },
  { value: 'unlit', label: 'No lights' },
];

export function CourtFilters({
  surfaceTypes,
  filters,
  onChange,
}: CourtFiltersProps) {
  const hasActiveFilters =
    filters.surfaces.length > 0 || filters.lighting.length > 0;

  function handleSurfaceToggle(surface: string) {
    onChange({ ...filters, surfaces: toggle(filters.surfaces, surface) });
  }

  function handleLightingToggle(value: LightingFilter) {
    onChange({ ...filters, lighting: toggle(filters.lighting, value) });
  }

  function handleClear() {
    onChange({ surfaces: [], lighting: [] });
  }

  return (
    <div className="court-filters mb-3">
      <div className="d-flex flex-wrap align-items-center gap-4">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="small text-muted fw-semibold me-1">Court type:</span>
          {surfaceTypes.map((surface) => (
            <Form.Check
              key={surface}
              inline
              type="checkbox"
              id={`filter-surface-${surface}`}
              label={surface}
              checked={filters.surfaces.includes(surface)}
              onChange={() => handleSurfaceToggle(surface)}
            />
          ))}
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="small text-muted fw-semibold me-1">Lighting:</span>
          {LIGHTING_OPTIONS.map((option) => (
            <Form.Check
              key={option.value}
              inline
              type="checkbox"
              id={`filter-lighting-${option.value}`}
              label={option.label}
              checked={filters.lighting.includes(option.value)}
              onChange={() => handleLightingToggle(option.value)}
            />
          ))}
        </div>
        {hasActiveFilters && (
          <Button
            variant="link"
            size="sm"
            className="p-0 text-decoration-none"
            onClick={handleClear}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
