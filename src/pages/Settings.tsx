import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';
import Header from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/BackButton';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import AccountSettingsForm from '@/components/settings/AccountSettingsForm';
import PrivacySettingsForm from '@/components/settings/PrivacySettingsForm';
import DangerZone from '@/components/settings/DangerZone';

const Settings = () => {
  const { session, profile, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/login');
    }
  }, [session, isLoading, navigate]);

  const handleImageSelectAndUpload = async (file: File | null) => {
    if (!file || !session || !session.user) return;

    const toastId = showLoading('Uploading image...');
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrl) throw new Error('Could not get public URL.');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;
      
      dismissToast(String(toastId));
      showSuccess('Image updated successfully.');
    } catch (error: any) {
      dismissToast(String(toastId));
      showError(`Image upload failed: ${error.message}`);
    }
  };

  if (isLoading || !profile) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 md:p-8">
          <Skeleton className="h-8 w-1/4 mb-6" />
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="space-y-8 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ImageUpload
                onImageSelect={handleImageSelectAndUpload}
                initialImageUrl={profile.avatar_url}
                isAvatar
              />
            </CardContent>
          </Card>

          <AccountSettingsForm />
          <PrivacySettingsForm />
          <DangerZone />
        </div>
      </main>
    </div>
  );
};

export default Settings;