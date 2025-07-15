import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import FileUpload from '@/components/FileUpload';
import LoginPrompt from '@/components/LoginPrompt';

const supportSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters long.'),
  message: z.string().min(20, 'Message must be at least 20 characters long.'),
  screenshot: z.instanceof(File).optional(),
});

const ContactSupport = () => {
  const { session, profile } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof supportSchema>>({
    resolver: zodResolver(supportSchema),
  });

  const onSubmit = async (values: z.infer<typeof supportSchema>) => {
    if (!session) return;
    setIsSubmitting(true);
    const toastId = showLoading('Submitting your ticket...');

    try {
      let screenshotUrl: string | null = null;
      if (values.screenshot) {
        const file = values.screenshot;
        // Sanitize the filename to remove special characters
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `support-tickets/${session.user.id}/${Date.now()}_${sanitizedFileName}`;
        const { error: uploadError } = await supabase.storage.from('screenshots').upload(filePath, file);
        if (uploadError) throw new Error(`Screenshot upload failed: ${uploadError.message}`);
        const { data } = supabase.storage.from('screenshots').getPublicUrl(filePath);
        screenshotUrl = data.publicUrl;
      }

      const { data: ticketData, error: insertError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: session.user.id,
          subject: values.subject,
          message: values.message,
          screenshot_url: screenshotUrl,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      await supabase.functions.invoke('send-transactional-email', {
        body: {
          template_name: 'Support Ticket Received',
          recipient_email: session.user.email,
          data: {
            user_name: profile?.first_name || 'there',
            ticket_id: ticketData.id.substring(0, 8).toUpperCase(),
            ticket_subject: values.subject,
          },
        },
      });

      dismissToast(String(toastId));
      showSuccess('Support ticket submitted successfully. We will get back to you soon.');
      form.reset();
    } catch (error: any) {
      dismissToast(String(toastId));
      showError(error.message);
    } finally {
      setIsSubmitting(false);
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
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Need help or want to report a bug? Fill out the form below.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g., Video playback issue" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl><Textarea {...field} rows={8} placeholder="Please describe the issue in detail..." /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="screenshot"
                      render={() => (
                        <FormItem>
                          <FormLabel>Screenshot (Optional)</FormLabel>
                          <FormControl>
                            <FileUpload
                              label="Attach a screenshot"
                              description=".png, .jpg up to 5MB"
                              acceptedFileTypes="image/png,image/jpeg"
                              onFileChange={(file) => form.setValue('screenshot', file || undefined)}
                              isUploading={isSubmitting}
                              className="h-48"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <LoginPrompt message="You must be logged in to contact support." />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactSupport;