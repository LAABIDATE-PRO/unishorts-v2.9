import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from '@/components/SessionContextProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const accountSchema = z.object({
  first_name: z.string().min(1, 'First name is required.'),
  last_name: z.string().min(1, 'Last name is required.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  short_bio: z.string().max(300, 'Bio cannot exceed 300 characters.').optional(),
});

const AccountSettingsForm = () => {
  const { session, profile } = useSession();

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      short_bio: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        username: profile.username || '',
        short_bio: profile.short_bio || '',
      });
    }
  }, [profile, form]);

  const handleProfileUpdate = async (values: z.infer<typeof accountSchema>) => {
    if (!session?.user || !profile) return;

    // Handle username change separately if it has changed
    if (values.username !== profile.username) {
      const { error: usernameError } = await supabase.functions.invoke('update-username', {
        body: { user_id: session.user.id, new_username: values.username },
      });
      if (usernameError) {
        showError(`Failed to update username: ${usernameError.message}`);
        return;
      }
    }

    // Update other profile info
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        short_bio: values.short_bio,
      })
      .eq('id', session.user.id);

    if (error) {
      showError('Failed to update profile.');
    } else {
      showSuccess('Profile updated successfully.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleProfileUpdate)}>
        <Card>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>This information will be displayed on your public profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="short_bio" render={({ field }) => (
              <FormItem><FormLabel>Public Bio</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default AccountSettingsForm;