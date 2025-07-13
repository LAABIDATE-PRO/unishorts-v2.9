import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CookiePreferences } from './CookieConsentProvider';

interface CookieSettingsManagerProps {
  preferences: CookiePreferences;
  onPreferencesChange: (newPreferences: CookiePreferences) => void;
}

const CookieSettingsManager = ({ preferences, onPreferencesChange }: CookieSettingsManagerProps) => {
  const handleToggle = (category: keyof CookiePreferences) => {
    onPreferencesChange({
      ...preferences,
      [category]: !preferences[category],
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label htmlFor="essential-cookies" className="font-semibold">Essential Cookies</Label>
          <Switch id="essential-cookies" checked disabled />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          These cookies are necessary for the website to function and cannot be switched off. They are used for things like logging you in, remembering your theme, or language preference.
        </p>
      </div>
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label htmlFor="analytics-cookies" className="font-semibold">Analytics Cookies</Label>
          <Switch
            id="analytics-cookies"
            checked={preferences.analytics}
            onCheckedChange={() => handleToggle('analytics')}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
        </p>
      </div>
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label htmlFor="functional-cookies" className="font-semibold">Functional Cookies</Label>
          <Switch
            id="functional-cookies"
            checked={preferences.functional}
            onCheckedChange={() => handleToggle('functional')}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages. For example, remembering your watch history or favorited films.
        </p>
      </div>
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <Label htmlFor="marketing-cookies" className="font-semibold">Marketing Cookies</Label>
          <Switch
            id="marketing-cookies"
            checked={preferences.marketing}
            onCheckedChange={() => handleToggle('marketing')}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
        </p>
      </div>
    </div>
  );
};

export default CookieSettingsManager;