import { createContext, useContext, useState, ReactNode } from 'react';
import { IntelligenceViewport } from '../types/allTypesAndInterfaces';
import {
  DEFAULT_INTELLIGENCE_COLORS,
  DEFAULT_INTELLIGENCE_FIELDS,
  IntelligenceLayerKey,
} from '../utils/layerUtils';

interface IntelligenceViewportContextType {
  viewport: IntelligenceViewport | null;
  setViewport: React.Dispatch<React.SetStateAction<IntelligenceViewport | null>>;
  pendingActivation: boolean;
  setPendingActivation: (v: boolean) => void;
  populationSample: boolean;
  setPopulationSample: (v: boolean) => void;
  incomeSample: boolean;
  setIncomeSample: (v: boolean) => void;
  realEstateSample: boolean;
  setRealEstateSample: (v: boolean) => void;
  populationField: string;
  setPopulationField: (field: string) => void;
  incomeField: string;
  setIncomeField: (field: string) => void;
  realEstateField: string;
  setRealEstateField: (field: string) => void;
  populationColor: string;
  setPopulationColor: (color: string) => void;
  incomeColor: string;
  setIncomeColor: (color: string) => void;
  realEstateColor: string;
  setRealEstateColor: (color: string) => void;
  populationAvailableProperties: string[];
  setPopulationAvailableProperties: (properties: string[]) => void;
  incomeAvailableProperties: string[];
  setIncomeAvailableProperties: (properties: string[]) => void;
  realEstateAvailableProperties: string[];
  setRealEstateAvailableProperties: (properties: string[]) => void;
  getLayerField: (layer: IntelligenceLayerKey) => string;
  getLayerColor: (layer: IntelligenceLayerKey) => string;
  getLayerAvailableProperties: (layer: IntelligenceLayerKey) => string[];
  setLayerAvailableProperties: (layer: IntelligenceLayerKey, properties: string[]) => void;
}

const IntelligenceViewportContext = createContext<IntelligenceViewportContextType | undefined>(
  undefined
);

export const IntelligenceViewportProvider = ({ children }: { children: ReactNode }) => {
  const [viewport, setViewport] = useState<IntelligenceViewport | null>(null);
  const [pendingActivation, setPendingActivation] = useState(false);
  const [populationSample, setPopulationSample] = useState(false);
  const [incomeSample, setIncomeSample] = useState(false);
  const [realEstateSample, setRealEstateSample] = useState(false);
  const [populationField, setPopulationField] = useState(DEFAULT_INTELLIGENCE_FIELDS.population);
  const [incomeField, setIncomeField] = useState(DEFAULT_INTELLIGENCE_FIELDS.income);
  const [realEstateField, setRealEstateField] = useState(DEFAULT_INTELLIGENCE_FIELDS.real_estate);
  const [populationColor, setPopulationColor] = useState(DEFAULT_INTELLIGENCE_COLORS.population);
  const [incomeColor, setIncomeColor] = useState(DEFAULT_INTELLIGENCE_COLORS.income);
  const [realEstateColor, setRealEstateColor] = useState(DEFAULT_INTELLIGENCE_COLORS.real_estate);
  const [populationAvailableProperties, setPopulationAvailableProperties] = useState<string[]>([]);
  const [incomeAvailableProperties, setIncomeAvailableProperties] = useState<string[]>([]);
  const [realEstateAvailableProperties, setRealEstateAvailableProperties] = useState<string[]>([]);

  const getLayerField = (layer: IntelligenceLayerKey) => {
    if (layer === 'population') return populationField;
    if (layer === 'income') return incomeField;
    return realEstateField;
  };

  const getLayerColor = (layer: IntelligenceLayerKey) => {
    if (layer === 'population') return populationColor;
    if (layer === 'income') return incomeColor;
    return realEstateColor;
  };

  const getLayerAvailableProperties = (layer: IntelligenceLayerKey) => {
    if (layer === 'population') return populationAvailableProperties;
    if (layer === 'income') return incomeAvailableProperties;
    return realEstateAvailableProperties;
  };

  const setLayerAvailableProperties = (layer: IntelligenceLayerKey, properties: string[]) => {
    if (layer === 'population') {
      setPopulationAvailableProperties(properties);
      return;
    }
    if (layer === 'income') {
      setIncomeAvailableProperties(properties);
      return;
    }
    setRealEstateAvailableProperties(properties);
  };

  return (
    <IntelligenceViewportContext.Provider
      value={{
        viewport,
        setViewport,
        pendingActivation,
        setPendingActivation,
        populationSample,
        setPopulationSample,
        incomeSample,
        setIncomeSample,
        realEstateSample,
        setRealEstateSample,
        populationField,
        setPopulationField,
        incomeField,
        setIncomeField,
        realEstateField,
        setRealEstateField,
        populationColor,
        setPopulationColor,
        incomeColor,
        setIncomeColor,
        realEstateColor,
        setRealEstateColor,
        populationAvailableProperties,
        setPopulationAvailableProperties,
        incomeAvailableProperties,
        setIncomeAvailableProperties,
        realEstateAvailableProperties,
        setRealEstateAvailableProperties,
        getLayerField,
        getLayerColor,
        getLayerAvailableProperties,
        setLayerAvailableProperties,
      }}
    >
      {children}
    </IntelligenceViewportContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useIntelligenceViewport = () => {
  const context = useContext(IntelligenceViewportContext);
  if (!context) {
    throw new Error('useIntelligenceViewport must be used within IntelligenceViewportProvider');
  }
  return context;
};
