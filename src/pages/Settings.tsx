import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import ImageUpload from '@/components/ImageUpload';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required.'),
  last_name: z.string().min(1, 'Last name is required.'),
  university_email: z.string().email('Invalid university email.').optional().or(z.literal('')),
  institution_name: z.string().optional(),
  phone_number: z.string().optional(),
  short_bio: z.string().max(300, 'Bio cannot exceed 300 characters.').optional(),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const Settings = () => {
  const { session, profile, isLoading } = useSession();
  const navigate = useNavigate();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/login');
    }
  }, [session, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        university_email: profile.university_email || '',
        institution_name: profile.institution_name || '',
        phone_number: profile.phone_number || '',
        short_bio: profile.short_bio || '',
      });
    }
  }, [profile, profileForm]);

  const handleProfileUpdate = async (values: z.infer<typeof profileSchema>) => {
    if (!session?.user) return;
    const { error } = await supabase
      .from('profiles')
      .update(values)
      .eq('id', session.user.id);

    if (error) {
      showError('Failed to update profile.');
    } else {
      showSuccess('Profile updated successfully.');
    }
  };

  const handlePasswordUpdate = async (values: z.infer<typeof passwordSchema>) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      showError('Failed to update password.');
    } else {
      showSuccess('Password updated successfully.');
      passwordForm.reset();
    }
  };
  
  const handleImageSelectAndUpload = async (file: File | null) => {
    if (!file || !session?.user) return;

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

  const handleSignOutAll = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      showError('Failed to sign out from all devices.');
    } else {
      showSuccess('Successfully signed out from all devices.');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-6"><Skeleton className="h-10 w-1/3" /></h1>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-10 w-24" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </>
    );
  }

  if (!session || !profile) {
     return (
      <div className="bg-background min-h-screen">
        <Header />
        <main className="container mx-auto p-4 md:p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive">Could not load profile</h1>
          <p className="text-muted-foreground mt-2">Please try logging in again.</p>
          <Button onClick={() => navigate('/login')} className="mt-4">Login</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your account information here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={profileForm.control} name="first_name" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={profileForm.control} name="last_name" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl><Input value={profile.username} disabled /></FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input value={session.user.email} disabled /></FormControl>
                    </FormItem>
                    <FormField control={profileForm.control} name="university_email" render={({ field }) => (
                      <FormItem><FormLabel>University Email</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={profileForm.control} name="institution_name" render={({ field }) => (
                      <FormItem><FormLabel>Institution Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={profileForm.control} name="phone_number" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={profileForm.control} name="short_bio" render={({ field }) => (
                      <FormItem><FormLabel>Short Bio</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                      {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look of your profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-2">Profile Picture</h3>
                  <ImageUpload
                    onImageSelect={handleImageSelectAndUpload}
                    initialImageUrl={profile.avatar_url}
                    isAvatar
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security & Login</CardTitle>
                <CardDescription>Manage your password and security options.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Change Password</h3>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="flex items-end gap-2">
                      <FormField control={passwordForm.control} name="password" render={({ field }) => (
                        <FormItem className="flex-grow"><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Update</Button>
                    </form>
                  </Form>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Login Sessions</h3>
                  <Button variant="destructive" onClick={handleSignOutAll}>Sign out from all devices</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;