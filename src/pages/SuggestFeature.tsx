import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import LoginPrompt from '@/components/LoginPrompt';

const suggestionSchema = z.object({
  suggestion: z.string().min(10, 'Please provide a more detailed suggestion.').max(2000, 'Suggestion cannot exceed 2000 characters.'),
});

const SuggestFeature = () => {
  const { session } = useSession();
  const form = useForm<z.infer<typeof suggestionSchema>>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: { suggestion: '' },
  });

  const onSubmit = async (values: z.infer<typeof suggestionSchema>) => {
    const { error } = await supabase.from('feature_suggestions').insert({
      user_id: session?.user.id,
      suggestion: values.suggestion,
    });

    if (error) {
      showError('Failed to submit suggestion. Please try again.');
    } else {
      showSuccess('Thank you! Your suggestion has been submitted.');
      form.reset();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <BackButton />
        <div className="max-w-2xl mx-auto">
          {session ? (
            <Card>
              <CardHeader>
                <CardTitle>Suggest a Feature</CardTitle>
                <CardDescription>Have an idea to improve the platform? We'd love to hear it!</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="suggestion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Idea</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={8} placeholder="Describe your feature suggestion in detail..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <LoginPrompt message="You must be logged in to suggest a feature." />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuggestFeature;