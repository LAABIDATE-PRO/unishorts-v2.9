import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import CookieSettingsManager from './CookieSettingsManager';
import { CookiePreferences } from './CookieConsentProvider';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ isOpen, onClose }) => {
  const { preferences: initialPreferences, savePreferences } = useCookieConsent();
  const [currentPreferences, setCurrentPreferences] = useState<CookiePreferences>(initialPreferences);

  const handleSave = () => {
    savePreferences(currentPreferences);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Customize Cookie Settings</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can change these settings at any time. For more information, please see our <Link to="/privacy" className="underline text-primary">Privacy Policy</Link>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <CookieSettingsManager
            preferences={currentPreferences}
            onPreferencesChange={setCurrentPreferences}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CookieSettingsModal;