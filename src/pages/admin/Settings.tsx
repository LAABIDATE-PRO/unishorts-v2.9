import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { PlatformSettings } from "@/types";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import GeneralSettingsForm from "@/components/admin/settings/GeneralSettingsForm";
import BrandingSettingsForm from "@/components/admin/settings/BrandingSettingsForm";
import SecuritySettingsForm from "@/components/admin/settings/SecuritySettingsForm";
import ContentSettingsForm from "@/components/admin/settings/ContentSettingsForm";
import AdminRoles from "@/pages/admin/Roles";
import AdminEmails from "@/pages/admin/Emails";

const AdminSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      showError("Failed to load platform settings.");
      console.error(error);
    } else {
      setSettings(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (updatedSettings: Partial<PlatformSettings>) => {
    const { error } = await supabase
      .from('platform_settings')
      .update(updatedSettings)
      .eq('id', 1);

    if (error) {
      showError("Failed to save settings.");
      console.error(error);
    } else {
      showSuccess("Settings saved successfully.");
      fetchSettings(); // Refresh data
    }
  };

  if (isLoading || !settings) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure all platform-wide settings and rules.</p>
        <div className="mt-6">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure all platform-wide settings and rules. Click save on each card to apply changes.</p>
      </div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
          <GeneralSettingsForm settings={settings} onUpdate={handleUpdate} />
        </TabsContent>
        <TabsContent value="branding" className="mt-6">
          <BrandingSettingsForm settings={settings} onUpdate={handleUpdate} />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <SecuritySettingsForm settings={settings} onUpdate={handleUpdate} />
        </TabsContent>
        <TabsContent value="content" className="mt-6">
          <ContentSettingsForm settings={settings} onUpdate={handleUpdate} />
        </TabsContent>
        <TabsContent value="roles" className="mt-6">
          <AdminRoles />
        </TabsContent>
        <TabsContent value="emails" className="mt-6">
          <AdminEmails />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;