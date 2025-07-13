import React, { useState } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Button } from '@/components/ui/button';
import CookieSettingsModal from './CookieSettingsModal';

const CookieBanner = () => {
  const { isBannerVisible, acceptAll, hideBanner } = useCookieConsent();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isBannerVisible) {
    return null;
  }
  
  const handleCustomize = () => {
    hideBanner();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-[100] shadow-lg animate-slide-in-up">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-card-foreground">
            We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.
          </p>
          <div className="flex-shrink-0 flex gap-2">
            <Button onClick={acceptAll}>Accept All</Button>
            <Button variant="outline" onClick={handleCustomize}>Customize Settings</Button>
          </div>
        </div>
      </div>
      <CookieSettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default CookieBanner;