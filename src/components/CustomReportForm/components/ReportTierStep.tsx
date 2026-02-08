import { useMemo, useEffect } from 'react';
import { CustomReportData } from '../../../types/allTypesAndInterfaces';
import {
  useTierPricing,
  useLocationPricing,
  formatPrice as formatPriceHelper,
} from '../hooks/useReportPricing';
import { FaBrain, FaUsers, FaDollarSign, FaStar, FaChartLine } from 'react-icons/fa';
import './ReportTierStep.css';

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

  // Helper to extract price number for display (removes $ and commas)
  const getPriceNumber = (price: number | null): string => {
    if (price === null) return 'N/A';
    if (isLoadingPrices) return '...';
    return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
        <div className="report-tier-container">
          <div className="report-tier-wrapper">
            <div className="section-title">
              <h2>Location Analysis Report</h2>
              <p>Choose your report option</p>
            </div>

            <div className="location-grid">
              {/* Free Report Card - Already Used */}
              <div className="location-card free used">
                <span className="card-pill">First Report</span>
                <div className="location-price free">FREE</div>
                <div className="location-subtitle">Single Location</div>
                <p className="location-description">
                  You've already used your free location report
                </p>
                <ul className="location-features">
                  <li><span className="icon">✓</span>Compare your location to existing database</li>
                  <li><span className="icon">✓</span>Detailed demographic and competitive analysis</li>
                  <li><span className="icon">✓</span>Instant insights and recommendations</li>
                </ul>
                <a
                  href="/profile"
                  target='_blank'
                  className="cta-button secondary"
                >
                  View My Reports
                </a>
              </div>

              {/* Paid Report Card - Active */}
              <div className="location-card paid selected">
                <span className="card-pill neutral">Available Now</span>
                <div className="location-price">{priceDisplay}</div>
                <div className="location-subtitle">Evaluate Your Location</div>
                <p className="location-description">
                  {isLoadingLocationPrice
                    ? 'Calculating price...'
                    : locationReportPrice === null
                    ? 'Unable to calculate price at this time.'
                    : 'Get a fresh deep-dive on another site with competitive insights and instant recommendations.'}
                </p>

                {locationReportPrice === null && !isLoadingLocationPrice && (
                  <button
                    onClick={refetchLocationPrice}
                    className="cta-button primary"
                    style={{ marginBottom: '1rem' }}
                  >
                    Retry Price Calculation
                  </button>
                )}

                <ul className="location-features">
                  <li><span className="icon">✓</span>Compare location to database</li>
                  <li><span className="icon">✓</span>Detailed demographic analysis</li>
                  <li><span className="icon">✓</span>Competitive insights</li>
                  <li><span className="icon">✓</span>Instant recommendations</li>
                </ul>
                <button className="cta-button featured">Purchase Report</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // First time users - show single free card
    return (
      <div className="report-tier-container">
        <div className="report-tier-wrapper">
          <div className="section-title">
            <h2>Location Analysis Report</h2>
            <p>Instant analysis comparing your location to our database</p>
          </div>

          <div className="location-grid">
            <div className="location-card free">
              <span className="card-pill">First Report</span>
              <div className="location-price free">{priceDisplay}</div>
              <div className="location-subtitle">Single Location</div>
              <p className="location-description">
                {isLoadingLocationPrice
                  ? 'Calculating price...'
                  : locationReportPrice === null
                  ? 'Unable to calculate price at this time. Please retry to continue.'
                  : isFree
                  ? 'Instant analysis comparing your location to our database. Perfect for your first report.'
                  : `Get detailed analysis of your specific location for ${priceDisplay}`}
              </p>

              {locationReportPrice === null && !isLoadingLocationPrice && (
                <button
                  onClick={refetchLocationPrice}
                  className="cta-button primary"
                  style={{ marginBottom: '1rem' }}
                >
                  Retry Price Calculation
                </button>
              )}

              <ul className="location-features">
                <li><span className="icon">✓</span>Compare your location to existing database</li>
                <li><span className="icon">✓</span>Detailed demographic and competitive analysis</li>
                <li><span className="icon">✓</span>Instant insights and recommendations</li>
              </ul>
              <button className="cta-button primary">Claim Free Report</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For full reports, use card-based pricing design matching tier_pricing.html
  return (
    <div className="report-tier-container">
      <div className="report-tier-wrapper">
        {isLoadingPrices && (
          <div className="text-center mb-4">
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
          </div>
        )}

        <div className="pricing-grid">
          {/* Basic Tier */}
          <div
            className={`pricing-card basic ${currentTier === 'basic' ? 'selected' : ''} ${disabled || !tierAvailability.basic ? 'disabled' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => !disabled && tierAvailability.basic && onInputChange('report_tier', 'basic')}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled && tierAvailability.basic) {
                e.preventDefault();
                onInputChange('report_tier', 'basic');
              }
            }}
          >
            <div className="card-header">
              <div className="tier-name">Basic</div>
              <div className="tier-description">
                Perfect for individual location research
              </div>
            </div>

            <div className="price-section">
              <div className="price-display">
                <span className="currency">$</span>
                <span className="amount">{getPriceNumber(tierPrices.basic)}</span>
              </div>
              <div className="period">per report</div>
            </div>

            <div className="intelligence-section">
              <div className="intelligence-header">
                <div className="intelligence-kicker">
                  <FaBrain className="intelligence-icon" />
                  Area Intelligence
                </div>
              </div>
              <div className="intelligence-pills">
                <div className="intelligence-item">
                  <FaUsers className="intelligence-pill-icon" />
                  <div>
                    <div className="intelligence-pill-name">Population</div>
                    <span className="intelligence-subtitle">Smart population data</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`cta-button ${currentTier === 'basic' ? 'primary' : 'secondary'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled && tierAvailability.basic) {
                  onInputChange('report_tier', 'basic');
                }
              }}
              disabled={disabled || !tierAvailability.basic}
            >
              Get Basic Report
            </button>

            <div className="features-list">
              <div className="feature-group">
                <div className="feature-group-title">Core Features</div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Top <strong>10</strong> Locations Ranked</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Preset Scoring Model</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Up to <strong>5</strong> <abbr title="Points Of Interest">POI</abbr> Datasets</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Full Data Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Standard Tier */}
          <div
            className={`pricing-card standard popular ${currentTier === 'standard' ? 'selected' : ''} ${disabled || !tierAvailability.standard ? 'disabled' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => !disabled && tierAvailability.standard && onInputChange('report_tier', 'standard')}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled && tierAvailability.standard) {
                e.preventDefault();
                onInputChange('report_tier', 'standard');
              }
            }}
          >
            <div className="popular-badge">
              <FaStar className="badge-icon" />
              MOST POPULAR
            </div>
            <div className="card-header">
              <div className="tier-name">Standard</div>
              <div className="tier-description">
                For growing teams and enterprises
              </div>
            </div>

            <div className="price-section">
              <div className="price-display">
                <span className="currency">$</span>
                <span className="amount">{getPriceNumber(tierPrices.standard)}</span>
              </div>
              <div className="period">per report</div>
            </div>

            <div className="intelligence-section">
              <div className="intelligence-header">
                <div className="intelligence-kicker">
                  <FaBrain className="intelligence-icon" />
                  Area Intelligence
                </div>
              </div>
              <div className="intelligence-pills">
                <div className="intelligence-item">
                  <FaUsers className="intelligence-pill-icon" />
                  <div>
                    <div className="intelligence-pill-name">Population</div>
                    <span className="intelligence-subtitle">Smart population data</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`cta-button ${currentTier === 'standard' ? 'primary' : 'secondary'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled && tierAvailability.standard) {
                  onInputChange('report_tier', 'standard');
                }
              }}
              disabled={disabled || !tierAvailability.standard}
            >
              Get Standard Report
            </button>

            <div className="features-list">
              <div className="feature-group">
                <div className="feature-group-title">Core Features</div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Top <strong>10</strong> Locations Ranked</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Custom Scoring Model</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Up to <strong>10</strong> <abbr title="Points Of Interest">POI</abbr> Datasets</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Full Data Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Tier */}
          <div
            className={`pricing-card featured ${currentTier === 'premium' ? 'selected' : ''} ${disabled || !tierAvailability.premium ? 'disabled' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => !disabled && tierAvailability.premium && onInputChange('report_tier', 'premium')}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled && tierAvailability.premium) {
                e.preventDefault();
                onInputChange('report_tier', 'premium');
              }
            }}
          >
            <div className="roi-badge">
              <FaChartLine className="badge-icon" />
              Highest ROI
            </div>
            <div className="card-header">
              <div className="tier-name">Premium</div>
              <div className="tier-description">
                Enterprise-grade intelligence suite
              </div>
            </div>

            <div className="price-section">
              <div className="price-display">
                <span className="currency">$</span>
                <span className="amount">{getPriceNumber(tierPrices.premium)}</span>
              </div>
              <div className="period">per report</div>
            </div>

            <div className="intelligence-section">
              <div className="intelligence-header">
                <div className="intelligence-kicker">
                  <FaBrain className="intelligence-icon" />
                  Area Intelligence Pack
                </div>
              </div>
              <div className="intelligence-pills">
                <div className="intelligence-item">
                  <FaUsers className="intelligence-pill-icon" />
                  <div>
                    <div className="intelligence-pill-name">Population</div>
                    <span className="intelligence-subtitle">Smart population data</span>
                  </div>
                </div>
                <div className="intelligence-item">
                  <FaDollarSign className="intelligence-pill-icon" />
                  <div>
                    <div className="intelligence-pill-name">Income</div>
                    <span className="intelligence-subtitle">Smart income data</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`cta-button featured`}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled && tierAvailability.premium) {
                  onInputChange('report_tier', 'premium');
                }
              }}
              disabled={disabled || !tierAvailability.premium}
            >
              Get Premium Report
            </button>

            <div className="features-list">
              <div className="feature-group">
                <div className="feature-group-title">Core Features</div>
                <div className="feature-item premium">
                  <div className="feature-icon">✓</div>
                  <span>Top <strong>10</strong> Locations Ranked</span>
                </div>
                <div className="feature-item premium">
                  <div className="feature-icon">✓</div>
                  <span>Custom Scoring Model</span>
                </div>
                <div className="feature-item premium">
                  <div className="feature-icon">✓</div>
                  <span>Up to <strong>15</strong> <abbr title="Points Of Interest">POI</abbr> Datasets</span>
                </div>
                <div className="feature-item premium">
                  <div className="feature-icon">✓</div>
                  <span>Full Data Access</span>
                </div>
              </div>

              <div className="feature-group">
                <div className="feature-group-title">Premium Support</div>
                <div className="feature-item premium">
                  <div className="feature-icon">✓</div>
                  <span>Concierge Service</span>
                </div>
                <div className="feature-item premium">
                  <div className="feature-icon">✓</div>
                  <span>Personal Business Consultant</span>
                </div>
                <div className="feature-item premium">
                  <div className="feature-icon">✓</div>
                  <span>Priority Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTierStep;