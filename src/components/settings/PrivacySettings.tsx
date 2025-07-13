import React, { useState, useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import CookieSettingsManager from '@/components/CookieSettingsManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CookiePreferences } from '@/components/CookieConsentProvider';
import { showSuccess } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PrivacySettings = () => {
  const { preferences: initialPreferences, savePreferences, resetPreferences: resetContextPreferences } = useCookieConsent();
  const [preferences, setPreferences] = useState<CookiePreferences>(initialPreferences);

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const handleSave = () => {
    savePreferences(preferences);
    showSuccess('Your cookie preferences have been saved.');
  };

  const handleReset = () => {
    resetContextPreferences();
    showSuccess('Cookie preferences have been reset.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cookie Preferences</CardTitle>
        <CardDescription>
          Manage how we use cookies to improve your experience. Your choices are saved and can be updated here at any time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CookieSettingsManager
          preferences={preferences}
          onPreferencesChange={setPreferences}
        />
        <div className="flex justify-between items-center pt-6 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reset All Preferences</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all your cookie preferences and you will be asked for consent again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Confirm Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;