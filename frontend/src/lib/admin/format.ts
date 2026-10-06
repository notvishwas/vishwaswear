const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** Admin timestamps are shown in Indian Standard Time, matching the dashboard's day and month boundaries. */
export function formatDateTime(value: string | null): string {
  return value ? dateTimeFormat.format(new Date(value)) : "";
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}
