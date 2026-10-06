import type { Instrumentation } from "next";

/**
 * Logs every unhandled server error (pages, server actions, route handlers) as one JSON line, so it
 * is easy to search in the hosting provider's logs. Add an error tracker here if you use one.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const err = error as Error & { digest?: string };
  console.error(
    JSON.stringify({
      level: "error",
      message: err.message,
      digest: err.digest,
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
    }),
  );
};
