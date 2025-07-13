import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link } from 'react-router-dom';

const signUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid university email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  first_name: z.string().min(1, { message: 'First name is required.' }),
  last_name: z.string().min(1, { message: 'Last name is required.' }),
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long.' })
    .refine(s => !s.includes('@'), { message: "Username cannot be an email address." }),
  terms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions.' }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      username: '',
      terms: false,
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    const { password, terms, ...profileData } = values;

    const { error } = await supabase.functions.invoke('custom-signup', {
      body: {
        email: profileData.email,
        password,
        data: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          username: profileData.username,
          university_email: profileData.email,
          institution_name: 'Not Provided',
          field_of_study: 'Not Provided',
          short_bio: 'No bio yet.',
          phone_number: 'Not Provided',
        },
      },
    });

    if (error) {
      showError(`Sign up failed: ${error.message}`);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      });

      if (signInError) {
        showError(`Sign up was successful, but login failed: ${signInError.message}`);
      }
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm text-muted-foreground">
                  I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" className="underline text-foreground">Terms and Conditions</Link>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Button variant="link" asChild className="p-0 h-auto font-semibold">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;