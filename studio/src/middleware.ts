import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'sn', 'nd', 'pt'],
  defaultLocale: 'en',
  localePrefix: 'never',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
