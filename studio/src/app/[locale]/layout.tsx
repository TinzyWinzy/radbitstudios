
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AnalyticsTracker } from '@/components/analytics-tracker';

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <NextIntlClientProvider messages={messages}>
          <AnalyticsTracker>
            {children}
          </AnalyticsTracker>
        </NextIntlClientProvider>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}
