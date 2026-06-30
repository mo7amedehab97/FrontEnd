import intelligenceCategories from '../intelligenceCategories.json';
import defaultMapConfig from '../mapConfig.json';
import { Feature, MapFeatures } from '../types/allTypesAndInterfaces';

export interface IntelligenceColorOption {
  name: string;
  hex: string;
}

export const INTELLIGENCE_COLOR_OPTIONS: IntelligenceColorOption[] = [
  { name: 'Red', hex: '#E53935' },
  { name: 'Blue', hex: '#1E88E5' },
  { name: 'Green', hex: '#43A047' },
  { name: 'Yellow', hex: '#FDD835' },
  { name: 'Orange', hex: '#FB8C00' },
  { name: 'Purple', hex: '#8E24AA' },
  { name: 'Cyan', hex: '#00ACC1' },
  { name: 'Pink', hex: '#D81B60' },
  { name: 'Brown', hex: '#6D4C41' },
  { name: 'Teal', hex: '#00897B' },
  { name: 'Deep Purple', hex: '#5E35B1' },
  { name: 'Lime', hex: '#C0CA33' },
  { name: 'Deep Orange', hex: '#F4511E' },
  { name: 'Indigo', hex: '#3949AB' },
  { name: 'Gray', hex: '#757575' },
  { name: 'Coral', hex: '#e74c3c' },
  { name: 'Gold', hex: '#fac83a' },
  { name: 'Sky Blue', hex: '#3498db' },
];

export const INTELLIGENCE_COLOR_PALETTE = INTELLIGENCE_COLOR_OPTIONS.map(option => option.hex);

const INTELLIGENCE_COLOR_NAME_BY_HEX = Object.fromEntries(
  INTELLIGENCE_COLOR_OPTIONS.map(option => [option.hex.toLowerCase(), option.name])
);

export function getIntelligenceColorName(hex: string): string {
  return INTELLIGENCE_COLOR_NAME_BY_HEX[hex.toLowerCase()] ?? 'Custom';
}

export function getIntelligenceColorOptions(selectedHex?: string): IntelligenceColorOption[] {
  if (!selectedHex) {
    return INTELLIGENCE_COLOR_OPTIONS;
  }

  const normalized = selectedHex.toLowerCase();
  const isKnown = INTELLIGENCE_COLOR_OPTIONS.some(option => option.hex.toLowerCase() === normalized);
  if (isKnown) {
    return INTELLIGENCE_COLOR_OPTIONS;
  }

  return [...INTELLIGENCE_COLOR_OPTIONS, { name: 'Custom', hex: selectedHex }];
}

export const DEFAULT_INTELLIGENCE_FIELDS = {
  population: 'Population_Count',
  income: 'income',
  real_estate: 'shop_avg_rent_price_per_m2',
} as const;

export const DEFAULT_INTELLIGENCE_COLORS = {
  population: '#e74c3c',
  income: '#fac83a',
  real_estate: '#3498db',
} as const;

export type IntelligenceLayerKey = keyof typeof DEFAULT_INTELLIGENCE_FIELDS;

export interface PropertyColorOption {
  property: string;
  color: string;
}

export interface IntelligenceLayerMetadata {
  color?: string;
  layer_color?: string;
  name?: string;
  layer_type?: string;
  opacity_field?: string;
  property_colors?: Record<string, string>;
  property_color_options?: PropertyColorOption[];
  available_properties?: string[];
  zoom_level?: number;
  [key: string]: unknown;
}

export interface ParsedIntelligenceResponse {
  features: Feature[];
  metadata: IntelligenceLayerMetadata;
  available_properties: string[];
}

export function propertyColorOptionsToMap(options: PropertyColorOption[]): Record<string, string> {
  return Object.fromEntries(options.map(option => [option.property, option.color]));
}

export function normalizePropertyColorOptions(value: unknown): PropertyColorOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      const property =
        [record.property, record.field, record.value, record.name].find(
          (candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0
        ) ?? null;
      const color = typeof record.color === 'string' ? record.color : null;

      if (!property || !color) {
        return null;
      }

      return { property, color };
    })
    .filter((item): item is PropertyColorOption => item !== null);
}

/**
 * Normalizes intelligence viewport API responses across possible payload shapes.
 */
export function normalizePropertyColors(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
    )
  );
}

export function resolvePropertyColors(
  contextColors: Record<string, string> | undefined,
  layerMetadata?: IntelligenceLayerMetadata
): Record<string, string> {
  const fromContext = normalizePropertyColors(contextColors);
  if (Object.keys(fromContext).length > 0) {
    return fromContext;
  }

  const fromOptions = propertyColorOptionsToMap(
    normalizePropertyColorOptions(layerMetadata?.property_color_options)
  );
  if (Object.keys(fromOptions).length > 0) {
    return fromOptions;
  }

  return normalizePropertyColors(layerMetadata?.property_colors);
}

export function resolvePropertyColorOptions(
  contextOptions: PropertyColorOption[] | undefined,
  layerMetadata?: IntelligenceLayerMetadata,
  availableProperties?: string[]
): PropertyColorOption[] {
  const normalizedContext = normalizePropertyColorOptions(contextOptions);
  if (normalizedContext.length > 0) {
    return normalizedContext;
  }

  const fromMetadata = normalizePropertyColorOptions(layerMetadata?.property_color_options);
  if (fromMetadata.length > 0) {
    return fromMetadata;
  }

  const colorMap = resolvePropertyColors(undefined, layerMetadata);
  const metadataAvailable = Array.isArray(layerMetadata?.available_properties)
    ? (layerMetadata.available_properties as string[])
    : [];
  const properties =
    availableProperties && availableProperties.length > 0
      ? availableProperties
      : metadataAvailable.length > 0
        ? metadataAvailable
        : Object.keys(colorMap);

  if (properties.length > 0) {
    return properties.map(property => ({
      property,
      color: colorMap[property] ?? '#9CA3AF',
    }));
  }

  return Object.entries(colorMap).map(([property, color]) => ({ property, color }));
}

export function parseIntelligenceApiResponse(res: unknown): ParsedIntelligenceResponse {
  const axiosData = (res as { data?: Record<string, unknown> })?.data;
  const payload = (axiosData?.data ?? axiosData) as Record<string, unknown> | undefined;

  if (!payload || !Array.isArray(payload.features)) {
    throw new Error('No data returned for current viewport');
  }

  const rawMetadata = (payload.metadata ?? {}) as Record<string, unknown>;
  const property_color_options = normalizePropertyColorOptions(
    rawMetadata.property_color_options ?? payload.property_color_options
  );
  const available_properties = (payload.available_properties ?? []) as string[];
  const property_colors = {
    ...normalizePropertyColors(rawMetadata.property_colors),
    ...propertyColorOptionsToMap(property_color_options),
  };
  const metadata = {
    ...rawMetadata,
    property_color_options,
    property_colors,
    available_properties,
  } as IntelligenceLayerMetadata;

  return {
    features: payload.features as Feature[],
    metadata,
    available_properties,
  };
}

export function getIntelligenceLayerColor(layer: {
  intelligence_metadata?: IntelligenceLayerMetadata;
  points_color?: string;
}): string {
  return (
    layer.intelligence_metadata?.layer_color ||
    layer.intelligence_metadata?.color ||
    layer.points_color ||
    defaultMapConfig.defaultColor
  );
}

export function getIntelligenceGridPaint(fallbackColor: string) {
  return {
    'fill-color': ['coalesce', ['get', 'layer_color'], fallbackColor],
    'fill-opacity': ['/', ['get', 'backend_opacity'], 100],
    'fill-outline-color': [
      'case',
      ['==', ['get', 'backend_opacity'], 0],
      'rgba(0,0,0,0)',
      'rgba(0,0,0,128)',
    ],
  };
}

export function getPropertyPreviewColor(
  propertyColors: Record<string, string>,
  property: string,
  fallback?: string
): string {
  if (propertyColors[property]) {
    return propertyColors[property];
  }

  const matchedKey = Object.keys(propertyColors).find(
    key => key.toLowerCase() === property.toLowerCase()
  );
  if (matchedKey) {
    return propertyColors[matchedKey];
  }

  return fallback ?? '#9CA3AF';
}

export function buildIntelligenceLayerLegend(
  metadata: IntelligenceLayerMetadata | undefined,
  fallback: string,
  featureCount?: number
): string {
  if (metadata?.name) {
    return featureCount != null ? `${metadata.name} (${featureCount})` : metadata.name;
  }
  return featureCount != null ? `${fallback} (${featureCount})` : fallback;
}

/**
 * Checks if a layer is intelligent based on its properties
 * @param featureCollection - The layer to check
 * @returns True if the layer is intelligent, false otherwise
 */
export function isIntelligentLayer(featureCollection: MapFeatures) {
  // Check explicit is_intelligent flag first
  if (featureCollection.is_intelligent !== undefined) {
    return !!featureCollection.is_intelligent;
  }

  if (featureCollection.bknd_dataset_id) {
    // Split the ID by underscores and check if any part matches intelligence categories
    const parts = featureCollection.bknd_dataset_id.split('_');
    return parts.some((part: string) => intelligenceCategories.includes(part));
  }

  return false;
}
