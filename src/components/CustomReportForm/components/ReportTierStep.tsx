import { useMemo, useEffect } from 'react';
import { CustomReportData } from '../../../types/allTypesAndInterfaces';
import {
  useTierPricing,
  useLocationPricing,
  formatPrice as formatPriceHelper,
} from '../hooks/useReportPricing';

interface ReportTierStepProps {
  formData: CustomReportData;
  onInputChange: (field: string, value: any) => void;
  disabled?: boolean;
  reportType?: 'full' | 'location';
  hasUsedFreeLocationReport?: boolean;
  isAdvancedMode?: boolean;
  onPriceLoadingChange?: (isLoading: boolean, priceAvailable: boolean) => void;
}

const ReportTierStep = ({
  formData,
  onInputChange,
  disabled = false,
  reportType,
  hasUsedFreeLocationReport = false,
  isAdvancedMode = false,
  onPriceLoadingChange,
}: ReportTierStepProps) => {
  // Collect all selected datasets from categories (memoized to prevent infinite loops)
  const allDatasets = useMemo(() => {
    const datasets: string[] = [];
    if (formData.complementary_categories) {
      datasets.push(...formData.complementary_categories);
    }
    if (formData.competition_categories) {
      datasets.push(...formData.competition_categories);
    }
    if (formData.cross_shopping_categories) {
      datasets.push(...formData.cross_shopping_categories);
    }
    return datasets;
  }, [
    formData.complementary_categories,
    formData.competition_categories,
    formData.cross_shopping_categories,
  ]);

  // Memoize datasets for location pricing to prevent creating new array references
  const locationDatasets = useMemo(() => {
    return isAdvancedMode ? allDatasets : [];
  }, [isAdvancedMode, allDatasets]);

  // For full reports, fetch all tier pricing
  const {
    basicPrice,
    standardPrice,
    premiumPrice,
    tierAvailability,
    isLoading: isLoadingPrices,
    refetch: refetchTierPrices,
  } = useTierPricing({
    country: formData.country_name,
    city: formData.city_name,
    datasets: allDatasets,
    report_potential_business_type: formData.Type,
    enabled: reportType !== 'location',
  });

  // For location reports, fetch location pricing
  const {
    price: locationReportPrice,
    comingSoon: locationComingSoon,
    isLoading: isLoadingLocationPrice,
    refetch: refetchLocationPrice,
  } = useLocationPricing({
    country: formData.country_name,
    city: formData.city_name,
    datasets: locationDatasets,
    reportType: 'single_location_premium',
    report_potential_business_type: formData.Type,
    enabled: reportType === 'location',
    onLoadingChange: onPriceLoadingChange,
  });

  // Refetch prices whenever the step is rendered or when datasets change
  // This ensures cost is recalculated every time user navigates to step 8
  useEffect(() => {
    // Only refetch if we have the required data (country and city)
    if (formData.country_name && formData.city_name) {
      if (reportType === 'location') {
        refetchLocationPrice();
      } else {
        refetchTierPrices();
      }
    }
  }, [
    formData.country_name,
    formData.city_name,
    reportType,
    // Include datasets to refetch when categories change
    // Using join to create a stable string representation for comparison
    allDatasets.join(','),
    locationDatasets.join(','),
    refetchLocationPrice,
    refetchTierPrices,
  ]);

  // Create tierPrices object for backwards compatibility with existing JSX
  const tierPrices = {
    basic: basicPrice,
    standard: standardPrice,
    premium: premiumPrice,
  };

  // Default to premium if not set
  const currentTier = formData.report_tier || 'premium';

  // Helper function to format price (uses formatPrice from hooks)
  const formatPriceValue = (price: number | null): string => {
    return formatPriceHelper(price, isLoadingPrices);
  };

  // For location reports, show dynamic pricing from API
  if (reportType === 'location') {
    // Determine price display
    const getPriceDisplay = (): string => {
      if (isLoadingLocationPrice) {
        return '...';
      }
      if (locationReportPrice === null) {
        return 'Price unavailable';
      }
      if (locationReportPrice === 0) {
        return 'FREE';
      }
      return `$${locationReportPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    };

    const priceDisplay = getPriceDisplay();
    const isFree = locationReportPrice === 0;
    const isNotFree = locationReportPrice !== null && locationReportPrice > 0;

    // If user has already used their free report OR if price is not free, show two cards
    if (hasUsedFreeLocationReport || isNotFree) {
      return (
        <div className="space-y-4 animate-fade-in-up">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Location Analysis Report</h3>
            <p className="text-sm text-gray-600">
              Choose your report option
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Report Card - Already Used (Grayed Out) */}
            <div className="relative border-2 border-gray-300 bg-gray-100/60 rounded-xl p-6 opacity-75">
              <div className="absolute top-3 right-3">
                <span className="text-xs bg-gray-400 text-white px-3 py-1 rounded-full font-semibold">
                  Already Claimed
                </span>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-500 mb-2">
                  FREE
                </div>
                <div className="text-sm text-gray-600 mb-3 font-medium">First Report</div>
                <p className="text-sm text-gray-600 mb-4">
                  You've already used your free location report
                </p>

                <ul className="text-left text-sm text-gray-600 space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">✓</span>
                    <span>Location database comparison</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">✓</span>
                    <span>Demographic analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">✓</span>
                    <span>Instant insights</span>
                  </li>
                </ul>

                <a
                  href="/profile"
                  target='_blank'
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View My Reports
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Paid Report Card - Active */}
            <div className="relative border-2 border-primary bg-gradient-to-br from-primary/5 to-green-50 rounded-xl p-6 shadow-lg">
              <div className="absolute top-3 right-3">
                <span className="text-xs bg-primary text-white px-3 py-1 rounded-full font-semibold">
                  Available Now
                </span>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {priceDisplay}
                </div>
                <div className="text-sm text-gray-700 mb-3 font-medium">Additional Report</div>
                <p className="text-sm text-gray-700 mb-4">
                  {isLoadingLocationPrice
                    ? 'Calculating price...'
                    : locationReportPrice === null
                    ? 'Unable to calculate price at this time.'
                    : `Get detailed analysis of your specific location`}
                </p>

                {locationReportPrice === null && !isLoadingLocationPrice && (
                  <button
                    onClick={refetchLocationPrice}
                    className="mb-4 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Retry Price Calculation
                  </button>
                )}

                <ul className="text-left text-sm text-gray-700 space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Compare location to database</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Detailed demographic analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Competitive insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Instant recommendations</span>
                  </li>
                </ul>

                <div className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary bg-white border-2 border-primary rounded-lg">
                  <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Selected
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Proceed to checkout to purchase your additional location analysis
            </p>
          </div>
        </div>
      );
    }

    // First time users - show single free card
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Location Analysis Report</h3>
          <p className="text-sm text-gray-600">
            Instant analysis comparing your location to our database
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {priceDisplay}
            </div>
            <div className="text-sm text-gray-600 mb-3">First Report</div>
            <p className="text-sm text-gray-700 mb-4">
              {isLoadingLocationPrice
                ? 'Calculating price...'
                : locationReportPrice === null
                ? 'Unable to calculate price at this time. Please retry to continue.'
                : isFree
                ? 'Get your first location analysis absolutely free!'
                : `Get detailed analysis of your specific location for ${priceDisplay}`}
            </p>

            {locationReportPrice === null && !isLoadingLocationPrice && (
              <button
                onClick={refetchLocationPrice}
                className="mb-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Retry Price Calculation
              </button>
            )}

            <ul className="text-left text-sm text-gray-700 space-y-2 max-w-md mx-auto">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Compare your location to existing database</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Detailed demographic and competitive analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Instant insights and recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // For full reports, use card-based pricing design matching the image
  return (
    <div className="h-full flex flex-col animate-fade-in-up overflow-hidden">
      <div className="text-center mb-4 flex-shrink-0">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Report Tier</h3>
        {isLoadingPrices && (
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Calculating prices...
          </p>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex items-center justify-center py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto w-full h-full max-h-full">
          {/* Basic Report Card */}
          <label
            className={`relative flex flex-col border-2 rounded-xl p-4 md:p-6 cursor-pointer transition-all duration-200 h-full ${
              currentTier === 'basic'
                ? 'border-primary bg-white shadow-lg'
                : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
            } ${disabled || !tierAvailability.basic ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              type="radio"
              name="report_tier"
              value="basic"
              checked={currentTier === 'basic'}
              onChange={e => onInputChange('report_tier', e.target.value)}
              disabled={disabled || !tierAvailability.basic}
              className="sr-only"
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Basic</h4>
              <p className="text-sm text-gray-600 mb-3">Perfect for individual location research</p>
              
              <div className="mb-3">
                <div className={`text-3xl md:text-4xl font-bold mb-1 ${currentTier === 'basic' ? 'text-primary' : 'text-gray-900'}`}>
                  {formatPriceValue(tierPrices.basic)}
                </div>
                <div className="text-xs text-gray-500">per report</div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-3 mb-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="text-xs font-semibold text-green-800">AREA INTELLIGENCE</div>
                    <div className="text-xs text-green-700">Population Smart population data.</div>
                  </div>
                </div>
              </div>

              <ul className="space-y-1.5 mb-4 flex-1 overflow-y-auto">
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Top 10 Locations Ranked</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Preset Scoring Model</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Up to 5 POI Datasets</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Full Data Access</span>
                </li>
              </ul>

              <button
                type="button"
                className={`w-full py-2 md:py-3 px-4 rounded-lg font-semibold text-sm transition-all flex-shrink-0 ${
                  currentTier === 'basic'
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onInputChange('report_tier', 'basic');
                }}
              >
                GET BASIC REPORT
              </button>
            </div>
          </label>

          {/* Standard Report Card - MOST POPULAR */}
          <label
            className={`relative flex flex-col border-2 rounded-xl p-4 md:p-6 cursor-pointer transition-all duration-200 h-full ${
              currentTier === 'standard'
                ? 'border-purple-500 bg-white shadow-lg'
                : 'border-gray-200 hover:border-purple-500/50 hover:shadow-md'
            } ${disabled || !tierAvailability.standard ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              type="radio"
              name="report_tier"
              value="standard"
              checked={currentTier === 'standard'}
              onChange={e => onInputChange('report_tier', e.target.value)}
              disabled={disabled || !tierAvailability.standard}
              className="sr-only"
            />
            
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                MOST POPULAR
              </span>
            </div>
            
            <div className="flex-1 flex flex-col">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Standard</h4>
              <p className="text-sm text-gray-600 mb-4">For growing teams and enterprises</p>
              
              <div className="mb-3">
                <div className={`text-3xl md:text-4xl font-bold mb-1 ${currentTier === 'standard' ? 'text-purple-600' : 'text-gray-900'}`}>
                  {formatPriceValue(tierPrices.standard)}
                </div>
                <div className="text-xs text-gray-500">per report</div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 md:p-3 mb-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="text-xs font-semibold text-purple-800">AREA INTELLIGENCE</div>
                    <div className="text-xs text-purple-700">Population Smart population data.</div>
                  </div>
                </div>
              </div>

              <ul className="space-y-1.5 mb-4 flex-1 overflow-y-auto">
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Top 10 Locations Ranked</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Custom Scoring Model</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Up to 10 POI Datasets</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Full Data Access</span>
                </li>
              </ul>

              <button
                type="button"
                className={`w-full py-2 md:py-3 px-4 rounded-lg font-semibold text-sm transition-all flex-shrink-0 ${
                  currentTier === 'standard'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onInputChange('report_tier', 'standard');
                }}
              >
                GET STANDARD REPORT
              </button>
            </div>
          </label>

          {/* Premium Report Card - Highest ROI */}
          <label
            className={`relative flex flex-col border-2 rounded-xl p-4 md:p-6 cursor-pointer transition-all duration-200 h-full ${
              currentTier === 'premium'
                ? 'border-purple-500 bg-white shadow-lg'
                : 'border-gray-200 hover:border-purple-500/50 hover:shadow-md'
            } ${disabled || !tierAvailability.premium ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              type="radio"
              name="report_tier"
              value="premium"
              checked={currentTier === 'premium'}
              onChange={e => onInputChange('report_tier', e.target.value)}
              disabled={disabled || !tierAvailability.premium}
              className="sr-only"
            />
            
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Highest ROI
              </span>
            </div>
            
            <div className="flex-1 flex flex-col">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Premium</h4>
              <p className="text-sm text-gray-600 mb-4">Enterprise-grade intelligence suite</p>
              
              <div className="mb-3">
                <div className={`text-3xl md:text-4xl font-bold mb-1 ${currentTier === 'premium' ? 'text-purple-600' : 'text-gray-900'}`}>
                  {formatPriceValue(tierPrices.premium)}
                </div>
                <div className="text-xs text-gray-500">per report</div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 md:p-3 mb-3">
                <div className="text-xs font-semibold text-purple-800 mb-2">AREA INTELLIGENCE PACK</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="text-xs text-purple-700">Population</div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-purple-700">Income</div>
                  </div>
                </div>
                <div className="text-xs text-purple-700 mt-1">Smart population & income data.</div>
              </div>

              <ul className="space-y-1.5 mb-3 flex-1 overflow-y-auto">
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Top 10 Locations Ranked</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Custom Scoring Model</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Up to 15 POI Datasets</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Full Data Access</span>
                </li>
              </ul>

              <div className="mb-3 flex-shrink-0">
                <div className="text-xs font-semibold text-purple-800 mb-1.5">Premium Support</div>
                <ul className="space-y-1">
                  <li className="flex items-start text-xs text-gray-700">
                    <svg className="w-3 h-3 text-purple-600 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Concierge Service</span>
                  </li>
                  <li className="flex items-start text-xs text-gray-700">
                    <svg className="w-3 h-3 text-purple-600 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Personal Business Consultant</span>
                  </li>
                  <li className="flex items-start text-xs text-gray-700">
                    <svg className="w-3 h-3 text-purple-600 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Priority Support</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className={`w-full py-2 md:py-3 px-4 rounded-lg font-semibold text-sm transition-all flex-shrink-0 ${
                  currentTier === 'premium'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onInputChange('report_tier', 'premium');
                }}
              >
                GET PREMIUM REPORT
              </button>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ReportTierStep;