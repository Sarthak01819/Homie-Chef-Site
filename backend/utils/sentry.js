import * as Sentry from "@sentry/node";

export const initSentry = () => {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.APP_MODE || "development",
        tracesSampleRate: 0.3,
    });
};

export { Sentry };
