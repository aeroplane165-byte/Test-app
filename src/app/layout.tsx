import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import MainAppLayout from './(main)/layout';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Cyberpunk Task App',
  description: 'A dark mode glassmorphism and neon cyberpunk UI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          poppins.variable
        )}
      >
        <FirebaseClientProvider>
          <main className="relative flex flex-col items-center p-4 sm:p-6 md:p-8">
            <MainAppLayout>{children}</MainAppLayout>
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
