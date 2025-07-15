import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import AuthLayout from '@/components/AuthLayout';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/SessionContextProvider';

const updatePasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const UpdatePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useSession();

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '' },
  });

  useEffect(() => {
    // If the user is already logged in and lands here, redirect them.
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const onSubmit = async (values: z.infer<typeof updatePasswordSchema>) => {
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Password updated successfully! You can now log in.');
      navigate('/login');
    }
    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold">Set New Password</h1>
      <p className="text-balance text-muted-foreground">
        Enter your new password below.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default UpdatePassword;