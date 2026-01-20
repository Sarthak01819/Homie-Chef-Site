import * as Sentry from "@sentry/node";

export const reportSecurityEvent = (event, data = {}) => {
    Sentry.captureMessage(event, {
        level: "warning",
        extra: data,
    });
};
