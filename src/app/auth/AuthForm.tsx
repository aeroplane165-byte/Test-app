
'use client';

import { useForm } from 'react-hook-form';
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
  initiateEmailSignUp,
  initiateEmailSignIn,
  initiateGoogleSignIn,
} from '@/firebase/non-blocking-login';
import * as React from 'react';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GoogleIcon } from '@/components/ui/icons';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export default function AuthForm({ mode }: AuthFormProps) {
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    initiateGoogleSignIn(auth);
    // The redirect is now handled by the MainAppLayout
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await initiateEmailSignUp(auth, values.email, values.password);
        toast({
          title: 'Account Created!',
          description: "We're setting up your profile. Redirecting...",
        });

      } else {
        await initiateEmailSignIn(auth, values.email, values.password);
        toast({
          title: 'Logging In...',
          description: 'Authenticating your credentials.',
        });
      }
    // We don't need to setIsLoading(false) here because the auth state listener will handle the redirect
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unknown error occurred.',
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    {...field}
                    className="glass-card"
                    disabled={isLoading}
                  />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    className="glass-card"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-12 text-lg font-bold cyan-glow-button" disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-5 w-5 animate-spin" />}
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
        </form>
      </Form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/60 px-2 text-gray-500 backdrop-blur-sm">Or continue with</span>
        </div>
      </div>
      <Button variant="outline" className="w-full h-12 text-md glass-card border-gray-300 hover:bg-gray-100 hover:text-foreground transition-all transform hover:scale-105" onClick={handleGoogleSignIn} disabled={isLoading}>
          {isLoading ? <Loader className="mr-3 h-5 w-5 animate-spin" /> : <GoogleIcon className="mr-3 h-5 w-5" />}
          Continue with Google
      </Button>
    </div>
  );
}
