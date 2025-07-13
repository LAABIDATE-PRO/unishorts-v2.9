import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface CookiePreferences {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  preferences: CookiePreferences;
  hasConsent: boolean;
  isBannerVisible: boolean;
  acceptAll: () => void;
  savePreferences: (newPreferences: CookiePreferences) => void;
  resetPreferences: () => void;
  hideBanner: () => void;
}

const COOKIE_CONSENT_KEY = 'cookie_consent';

const defaultPreferences: CookiePreferences = {
  analytics: false,
  functional: false,
  marketing: false,
};

export const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsent, setHasConsent] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (savedConsent) {
        const parsedData = JSON.parse(savedConsent);
        if (parsedData && typeof parsedData.preferences === 'object' && parsedData.preferences !== null) {
          const finalPreferences = { ...defaultPreferences, ...parsedData.preferences };
          setPreferences(finalPreferences);
          setHasConsent(true);
          setIsBannerVisible(false);
        } else {
          setIsBannerVisible(true);
        }
      } else {
        setIsBannerVisible(true);
      }
    } catch (error) {
      console.error("Could not parse cookie consent from localStorage", error);
      setIsBannerVisible(true);
    }
  }, []);

  const saveToLocalStorage = (prefs: CookiePreferences) => {
    const consentData = {
      consentGiven: true,
      consentDate: new Date().toISOString(),
      preferences: prefs,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
  };

  const acceptAll = useCallback(() => {
    const allEnabled: CookiePreferences = {
      analytics: true,
      functional: true,
      marketing: true,
    };
    setPreferences(allEnabled);
    setHasConsent(true);
    setIsBannerVisible(false);
    saveToLocalStorage(allEnabled);
  }, []);

  const savePreferences = useCallback((newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    setHasConsent(true);
    setIsBannerVisible(false);
    saveToLocalStorage(newPreferences);
  }, []);
  
  const hideBanner = useCallback(() => {
    setIsBannerVisible(false);
  }, []);

  const resetPreferences = useCallback(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setPreferences(defaultPreferences);
    setHasConsent(false);
    setIsBannerVisible(true);
  }, []);

  const value = {
    preferences,
    hasConsent,
    isBannerVisible,
    acceptAll,
    savePreferences,
    resetPreferences,
    hideBanner,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};