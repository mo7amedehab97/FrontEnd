import React, { useMemo } from 'react';
import { formatSubcategoryName } from '../../utils/helperFunctions';
import { getIntelligenceColorOptions } from '../../utils/layerUtils';

interface IntelligenceLayerSettingsProps {
  selectedProperty: string;
  selectedColor: string;
  availableProperties: string[];
  isUpdating?: boolean;
  onPropertyChange: (property: string) => void;
  onColorChange: (color: string) => void;
}

export const IntelligenceLayerSettings: React.FC<IntelligenceLayerSettingsProps> = ({
  selectedProperty,
  selectedColor,
  availableProperties,
  isUpdating = false,
  onPropertyChange,
  onColorChange,
}) => {
  const propertyOptions =
    availableProperties.length > 0
      ? availableProperties
      : selectedProperty
        ? [selectedProperty]
        : [];

  const colorOptions = useMemo(
    () => getIntelligenceColorOptions(selectedColor),
    [selectedColor]
  );

  return (
    <div
      className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2"
      onClick={e => e.stopPropagation()}
    >
      <div>
        <select
          value={selectedProperty}
          onChange={e => onPropertyChange(e.target.value)}
          disabled={isUpdating || propertyOptions.length === 0}
          className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs sm:text-sm text-gem focus:outline-none focus:ring-2 focus:ring-gem-green/20 disabled:opacity-60"
        >
          {propertyOptions.map(property => (
            <option key={property} value={property}>
              {formatSubcategoryName(property)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: selectedColor }}
          />
          <select
            value={selectedColor}
            onChange={e => onColorChange(e.target.value)}
            disabled={isUpdating}
            className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs sm:text-sm text-gem focus:outline-none focus:ring-2 focus:ring-gem-green/20 disabled:opacity-60"
          >
            {colorOptions.map(({ name, hex }) => (
              <option key={hex} value={hex}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isUpdating && (
        <p className="text-[10px] text-gray-500 sm:col-span-2">Updating map colors...</p>
      )}
    </div>
  );
};
