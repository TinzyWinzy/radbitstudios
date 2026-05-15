import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async (params) => {
  const locale = params.locale ?? 'en';
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Africa/Harare',
    now: new Date(),
    formats: {
      number: {
        usd: { style: 'currency', currency: 'USD' },
        zig: { style: 'currency', currency: 'ZIG' },
        zar: { style: 'currency', currency: 'ZAR' },
      },
      dateTime: {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
        long: { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' },
      },
    },
  };
});
