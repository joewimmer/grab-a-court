import { Form } from 'react-bootstrap';

export interface LightingSelection {
  lights: boolean;
  noLights: boolean;
}

interface CourtFiltersProps {
  surfaceTypes: string[];
  selectedSurfaces: string[];
  selectedLighting: LightingSelection;
  onToggleSurface: (surface: string) => void;
  onToggleLighting: (key: keyof LightingSelection) => void;
}

export function CourtFilters({
  surfaceTypes,
  selectedSurfaces,
  selectedLighting,
  onToggleSurface,
  onToggleLighting,
}: CourtFiltersProps) {
  return (
    <div className="court-filters d-flex flex-wrap gap-4 mb-3">
      <div>
        <div className="small text-muted text-uppercase fw-semibold mb-1">
          Court type
        </div>
        <div className="d-flex flex-wrap gap-3">
          {surfaceTypes.map((surface) => (
            <Form.Check
              key={surface}
              type="checkbox"
              id={`filter-surface-${surface}`}
              label={surface}
              checked={selectedSurfaces.includes(surface)}
              onChange={() => onToggleSurface(surface)}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="small text-muted text-uppercase fw-semibold mb-1">
          Lighting
        </div>
        <div className="d-flex flex-wrap gap-3">
          <Form.Check
            type="checkbox"
            id="filter-lighting-lights"
            label="Lights"
            checked={selectedLighting.lights}
            onChange={() => onToggleLighting('lights')}
          />
          <Form.Check
            type="checkbox"
            id="filter-lighting-no-lights"
            label="No lights"
            checked={selectedLighting.noLights}
            onChange={() => onToggleLighting('noLights')}
          />
        </div>
      </div>
    </div>
  );
}
