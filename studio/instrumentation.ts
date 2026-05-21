import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production') {
  (async () => {
    try {
      const { resourceFromAttributes } = await import('@opentelemetry/resources');
      const { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } = await import('@opentelemetry/semantic-conventions');
      const { BasicTracerProvider, BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
      const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');

      const provider = new BasicTracerProvider({
        resource: resourceFromAttributes({
          [SEMRESATTRS_SERVICE_NAME]: 'radbit-sme-hub',
          [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
        }),
      });

      // @ts-expect-error — OTEL v2 API; types resolved to v1 via Sentry
      provider.addSpanProcessor(new BatchSpanProcessor(new OTLPTraceExporter()));
      // @ts-expect-error — OTEL v2 API; types resolved to v1 via Sentry
      provider.register();
    } catch {
      // OTEL setup is non-critical — app runs without tracing
    }
  })();
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      enabled: process.env.NODE_ENV === "production",
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      enabled: process.env.NODE_ENV === "production",
    });
  }
}