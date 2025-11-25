
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import {
  initiatePhoneNumberSignIn,
  confirmOtpCode,
} from '@/firebase/non-blocking-login';
import * as React from 'react';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { RecaptchaVerifier as FirebaseRecaptchaVerifier } from 'firebase/auth';

const phoneSchema = z.object({
  countryCode: z.string().startsWith('+', "Country code must start with '+'").min(2),
  phone: z.string().length(10, 'Please enter a valid 10-digit phone number.'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits.'),
});

export default function MobileAuthForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);
  const [fullPhoneNumber, setFullPhoneNumber] = React.useState('');
  
  const recaptchaVerifierRef = React.useRef<RecaptchaVerifier | null>(null);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: '+91',
      phone: '',
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  React.useEffect(() => {
    if (auth && !recaptchaVerifierRef.current && step === 'phone') {
        recaptchaVerifierRef.current = new FirebaseRecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'compact',
            'callback': (response: any) => {
                // reCAPTCHA solved, allow user to submit form
            },
            'expired-callback': () => {
                // Response expired. Ask user to solve reCAPTCHA again.
            }
        });
        recaptchaVerifierRef.current.render();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, step]);


  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    if (!recaptchaVerifierRef.current) {
        toast({ variant: 'destructive', title: 'reCAPTCHA not initialized.' });
        setIsLoading(false);
        return;
    }

    const phoneNumber = `${values.countryCode}${values.phone}`;
    setFullPhoneNumber(phoneNumber);

    try {
        const confirmation = await initiatePhoneNumberSignIn(
            auth,
            phoneNumber,
            recaptchaVerifierRef.current
        );
        setConfirmationResult(confirmation);
        setStep('otp');
        toast({ title: 'OTP Sent!', description: `An OTP has been sent to ${phoneNumber}.` });
    } catch (error: any) {
        console.error("OTP Send Error:", error);
        let description = error.message || 'An unknown error occurred. Please ensure your domain is authorized in Firebase console.';
        if (error.code === 'auth/billing-not-enabled') {
            description = 'The free quota for this project has been exceeded. Please enable billing in your Firebase project to continue.';
        }
        toast({
            variant: 'destructive',
            title: 'Failed to Send OTP',
            description: description,
        });
        // In case of error, you might need to reset reCAPTCHA
        recaptchaVerifierRef.current.render().then((widgetId) => {
            // using window.grecaptcha
            if (window.grecaptcha) {
                window.grecaptcha.reset(widgetId);
            }
        });
    } finally {
        setIsLoading(false);
    }
  };


  const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    if (!confirmationResult) {
      toast({ variant: 'destructive', title: 'Verification session expired. Please try again.' });
      setIsLoading(false);
      setStep('phone');
      return;
    }
    try {
      await confirmOtpCode(confirmationResult, values.otp);
      toast({ title: 'Success!', description: 'You are now logged in.' });
      // The onAuthStateChanged listener will handle the redirect.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: error.message || 'The OTP you entered is incorrect.',
      });
      setIsLoading(false);
    }
  };

  if (isUserLoading || user) {
    return (
       <div className="w-full h-screen flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-main-accent" />
        <p className="mt-4 text-lg text-gray-600">Checking credentials...</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-8">
      {step === 'phone' ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
             <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <div className="flex items-center gap-2">
                    <FormField
                        control={phoneForm.control}
                        name="countryCode"
                        render={({ field }) => (
                            <FormControl>
                                <Input {...field} className="glass-card w-20" />
                            </FormControl>
                        )}
                    />
                    <FormField
                        control={phoneForm.control}
                        name="phone"
                        render={({ field }) => (
                            <FormControl>
                                <Input
                                    placeholder="98765 43210"
                                    {...field}
                                    className="glass-card flex-1"
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                />
                            </FormControl>
                        )}
                    />
                </div>
                <FormMessage>{phoneForm.formState.errors.phone?.message || phoneForm.formState.errors.countryCode?.message}</FormMessage>
             </FormItem>
            
            <div id="recaptcha-container" className="flex justify-center my-4"></div>

            <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold cyan-glow-button" 
                disabled={isLoading}
            >
              {isLoading && <Loader className="mr-2 h-5 w-5 animate-spin" />}
              Send OTP
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
             <p className="text-center text-sm text-gray-500">
                Enter the OTP sent to {fullPhoneNumber}
             </p>
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123456" 
                      {...field} 
                      className="glass-card text-center tracking-[1rem]" 
                      maxLength={6} 
                      type="tel"
                      inputMode="numeric"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 text-lg font-bold cyan-glow-button" disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-5 w-5 animate-spin" />}
              Verify OTP
            </Button>
             <Button variant="link" size="sm" onClick={() => setStep('phone')} className="w-full">
                Change Number
             </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
