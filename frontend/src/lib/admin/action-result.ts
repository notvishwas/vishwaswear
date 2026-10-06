/** What every admin server action returns, so the UI can show a toast and highlight fields. */
export type ActionResult<Data extends object = object> =
  | ({ ok: true; message: string } & Data)
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export function success<Data extends object = object>(message: string, data?: Data): ActionResult<Data> {
  return { ok: true, message, ...(data ?? ({} as Data)) };
}

export function failure(message: string, fieldErrors?: Record<string, string>): { ok: false; message: string; fieldErrors?: Record<string, string> } {
  return { ok: false, message, fieldErrors };
}

/** Postgres unique-violation code. */
export const UNIQUE_VIOLATION = "23505";
