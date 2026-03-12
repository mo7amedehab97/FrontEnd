import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { translations } from './translations';
import LandingNavbar from '../../components/Landing/LandingNavbar';
import LandingHero from '../../components/Landing/LandingHero';
import LandingFeatures from '../../components/Landing/LandingFeatures';
import LandingReportGrid from '../../components/Landing/LandingReportGrid';
import LandingCaseStudy from '../../components/Landing/LandingCaseStudy';
import LandingDataSources from '../../components/Landing/LandingDataSources';
import LandingCTA from '../../components/Landing/LandingCTA';
import LandingFooter from '../../components/Landing/LandingFooter';

const LANG_STORAGE_KEY = 'landing-lang';

function getInitialLang(searchParams: URLSearchParams): 'en' | 'ar' {
  const fromUrl = searchParams.get('lang');
  if (fromUrl === 'ar' || fromUrl === 'en') return fromUrl;

  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'ar') return 'ar';
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
  return 'en';
}

const Landing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [lang, setLangState] = useState<'en' | 'ar'>(() => getInitialLang(searchParams));

  const setLang = useCallback((newLang: 'en' | 'ar') => {
    setLangState(newLang);
    setSearchParams((prev) => {
      prev.set('lang', newLang);
      return prev;
    }, { replace: true });
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {
      // localStorage unavailable
    }
  }, [setSearchParams]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang];

  return (
    <div
      className={`w-full min-h-screen flex flex-col bg-brand-dark text-slate-200 antialiased selection:bg-brand-green selection:text-white overflow-x-hidden scrollbar-landing ${
        lang === 'ar' ? 'font-arabic' : 'font-sans'
      }`}
    >
      <LandingNavbar lang={lang} setLang={setLang} t={t} />
      <main className="flex-grow">
        <LandingHero t={t} />
        <LandingFeatures t={t} />
        <LandingReportGrid t={t} />
        <LandingCaseStudy t={t} />
        <LandingDataSources t={t} />
        <LandingCTA t={t} />
      </main>
      <LandingFooter t={t} />
    </div>
  );
};

export default Landing;
