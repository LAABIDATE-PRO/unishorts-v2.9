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
import { Link, useNavigate } from 'react-router-dom';
import { Textarea } from './ui/textarea';
import { Check, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PhoneNumberInput from './PhoneNumberInput';
import { Value } from 'react-phone-number-input';

const signUpSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required.' }),
  last_name: z.string().min(1, { message: 'Last name is required.' }),
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .regex(/^[a-zA-Z0-9_.]+$/, { message: "Username can only contain letters, numbers, periods, and underscores." })
    .refine(s => !s.includes('@'), { message: "Username cannot be an email address." }),
  university_email: z.string().email({ message: 'Please enter a valid university email.' }),
  institution_name: z.string().min(1, { message: 'Institution name is required.' }),
  phone_number: z.string().min(1, { message: 'Phone number is required.' }),
  short_bio: z.string().min(10, { message: 'Please provide a brief reason for joining (at least 10 characters).' }).max(500, "Reason must not exceed 500 characters."),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  terms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions.' }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [showContactSupportDialog, setShowContactSupportDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      university_email: '',
      institution_name: '',
      phone_number: '',
      short_bio: '',
      password: '',
      terms: false,
    },
  });

  const usernameValue = form.watch('username');

  const checkUsernameAvailability = async () => {
    const username = form.getValues('username');
    const usernameValidation = signUpSchema.shape.username.safeParse(username);
    if (!usernameValidation.success) {
      form.setError('username', { type: 'manual', message: usernameValidation.error.errors[0].message });
      return;
    }

    setUsernameStatus('checking');
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      showError('Error checking username availability.');
      setUsernameStatus('idle');
    } else if (data) {
      setUsernameStatus('taken');
      form.setError('username', { type: 'manual', message: 'This username is already taken.' });
    } else {
      setUsernameStatus('available');
      form.clearErrors('username');
    }
  };

  const onSubmit = async (values: SignUpFormValues) => {
    if (usernameStatus !== 'available') {
      showError('Please check username availability first.');
      return;
    }
    setIsLoading(true);
    const { password, terms, ...profileData } = values;

    const { error: functionError } = await supabase.functions.invoke('custom-signup', {
      body: {
        email: profileData.university_email,
        password,
        data: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          username: profileData.username,
          university_email: profileData.university_email,
          institution_name: profileData.institution_name,
          phone_number: profileData.phone_number,
          short_bio: profileData.short_bio,
        },
      },
    });

    if (functionError) {
      let errorMessage = functionError.message;
      if (functionError.context && typeof functionError.context.json === 'function') {
        try {
          const errorBody = await functionError.context.json();
          if (errorBody && errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch (parseError) {
          // Ignore if parsing fails, use the outer error.
        }
      }

      if (errorMessage.includes('does not belong to an approved university')) {
        form.setError('university_email', { type: 'manual', message: "This email domain is not from an approved university." });
        setShowContactSupportDialog(true);
      } else if (functionError.context?.status === 409 || errorMessage.includes('username is already taken')) {
        form.setError('username', { type: 'manual', message: 'This username is already taken. Please choose another one.' });
      } else {
        showError(`Sign up failed: ${errorMessage}`);
      }
      setIsLoading(false);
      return;
    }

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: values.university_email,
    });

    if (resendError) {
      showError(`Account created, but we failed to send a verification email. Please try logging in and resending it. Error: ${resendError.message}`);
    } else {
      setRegisteredEmail(values.university_email);
      setShowSuccessDialog(true);
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="first_name" render={({ field }) => (
              <FormItem><FormControl><Input placeholder="First Name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="last_name" render={({ field }) => (
              <FormItem><FormControl><Input placeholder="Last Name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input 
                      placeholder="Username (for your profile page)" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        setUsernameStatus('idle');
                      }}
                    />
                  </FormControl>
                  <Button type="button" onClick={checkUsernameAvailability} disabled={usernameStatus === 'checking' || !usernameValue || usernameValue.length < 3}>
                    {usernameStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
                  </Button>
                </div>
                <FormMessage />
                {usernameStatus === 'available' && (
                  <p className="text-sm font-medium text-green-500 flex items-center">
                    <Check className="h-4 w-4 mr-1" /> Username is available!
                  </p>
                )}
              </FormItem>
            )}
          />
          <FormField control={form.control} name="university_email" render={({ field }) => (
            <FormItem><FormControl><Input type="email" placeholder="University Email (for login)" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="institution_name" render={({ field }) => (
            <FormItem><FormControl><Input placeholder="Institution / University Name" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PhoneNumberInput
                    placeholder="Phone Number"
                    value={field.value as Value | undefined}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="short_bio" render={({ field }) => (
            <FormItem><FormControl><Textarea placeholder="Why do you want to join our platform?" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormControl><Input type="password" placeholder="Password" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="terms" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm text-muted-foreground">
                  I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" className="underline text-foreground">Terms and Conditions</Link>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )} />
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
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registration Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              We have sent a verification link to <strong>{registeredEmail}</strong>. Please check your inbox and click the link to activate your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate('/login')}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showContactSupportDialog} onOpenChange={setShowContactSupportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Is your university not listed?</AlertDialogTitle>
            <AlertDialogDescription>
              If your university is not on our approved list, please contact our support team. We can help you register manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowContactSupportDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SignUpForm;