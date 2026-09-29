import "server-only";

/** Email settings from the environment. Missing values are handled by the caller, never thrown. */
export function getEmailEnv() {
  return {
    apiKey: process.env.RESEND_API_KEY || undefined,
    from: process.env.EMAIL_FROM || undefined,
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || undefined,
  };
}
