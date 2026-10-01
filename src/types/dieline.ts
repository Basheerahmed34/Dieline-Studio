export type Unit = 'mm' | 'cm' | 'in';

export type PackagingCategory =
  | 'folding-cartons'
  | 'mailer-shipping'
  | 'food-packaging'
  | 'pouches'
  | 'bags'
  | 'labels'
  | 'specialty';

export type DifficultyLevel = 'Basic' | 'Intermediate' | 'Advanced';

export interface DimensionParam {
  key: string;
  label: string;
  unit?: string;
  defaultVal: number; // in mm
  minVal: number;
  maxVal: number;
  step?: number;
  description?: string;
  required?: boolean;
}

export interface DimensionValues {
  [key: string]: number; // always stored internally in millimeters (mm)
}

export interface TechnicalSettings {
  bleed: number; // in mm, default 3mm
  safeArea: number; // in mm, default 3mm
  caliper: number; // board thickness in mm, default 0.4mm
  glueFlapWidth?: number; // in mm
  tuckFlapLength?: number; // in mm
  showGrainDirection: boolean;
  colorScheme: 'blue-yellow-white' | 'iso-standard' | 'blueprint' | 'monochrome' | 'dark-mode';
}

export interface LayerVisibility {
  cut: boolean;
  crease: boolean;
  bleed: boolean;
  safeArea: boolean;
  glue: boolean;
  dimensions: boolean;
  annotations: boolean;
  rulers: boolean;
  grid: boolean;
}

export interface DimensionCallout {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  valueMm: number;
  orientation: 'horizontal' | 'vertical' | 'aligned';
  offset: number;
}

export interface TextAnnotation {
  x: number;
  y: number;
  text: string;
  subtext?: string;
  role?: 'title' | 'spec' | 'panel-label' | 'grain' | 'fold-instruction';
  fontSize?: number;
}

export interface GeometryBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface DielineGeometry {
  bounds: GeometryBounds;
  cutPath: string; // SVG path data for cut lines (solid outer & through-cuts)
  creasePath: string; // SVG path data for crease / score lines (dashed)
  bleedPath?: string; // Outer bleed boundary
  safeAreaPath?: string; // Inner safe boundary
  glueFlapPaths?: string[]; // Hatch / shaded polygons for glue areas
  perforations?: string; // Dashed tear/perf lines
  dimensions: DimensionCallout[];
  annotations: TextAnnotation[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: PackagingCategory;
  categoryName: string;
  industryCode?: string; // e.g., "ECMA A20.20.01", "FEFCO 0427", "FEFCO 0201"
  description: string;
  recommendedUse: string;
  stockRecommendation: string;
  difficulty: DifficultyLevel;
  dimensions: DimensionParam[];
  defaultSettings?: Partial<TechnicalSettings>;
  generator: (dims: DimensionValues, settings: TechnicalSettings) => DielineGeometry;
}

export interface SavedProject {
  id: string;
  name: string;
  templateId: string;
  dimensions: DimensionValues;
  settings: TechnicalSettings;
  unit: Unit;
  updatedAt: number;
}
