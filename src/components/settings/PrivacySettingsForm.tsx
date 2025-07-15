import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from '@/components/SessionContextProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const privacySchema = z.object({
  profile_visibility: z.enum(['public', 'private', 'followers_only']),
});

const PrivacySettingsForm = () => {
  const { session, profile } = useSession();

  const form = useForm<z.infer<typeof privacySchema>>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profile_visibility: 'public',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        profile_visibility: profile.profile_visibility || 'public',
      });
    }
  }, [profile, form]);

  const handlePrivacyUpdate = async (values: z.infer<typeof privacySchema>) => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ profile_visibility: values.profile_visibility })
      .eq('id', session.user.id);

    if (error) {
      showError('Failed to update privacy settings.');
    } else {
      showSuccess('Privacy settings updated.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handlePrivacyUpdate)}>
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Control who can see your profile and interact with you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="profile_visibility"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Profile Visibility</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="public" /></FormControl>
                        <FormLabel className="font-normal">Public (Everyone can view)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="private" /></FormControl>
                        <FormLabel className="font-normal">Private (Only you can view)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="followers_only" disabled /></FormControl>
                        <FormLabel className="font-normal text-muted-foreground">Followers Only (Coming soon)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default PrivacySettingsForm;