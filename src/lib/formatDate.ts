export type AppDateLocale = "en-KH" | "km-KH";

const FALLBACK_TIME_ZONE = "Asia/Phnom_Penh";
const CONFIGURED_APP_TIME_ZONE =
  process.env.NEXT_PUBLIC_APP_TIME_ZONE || FALLBACK_TIME_ZONE;

function resolveAppTimeZone(timeZone: string): string {
  try {
    new Intl.DateTimeFormat("en-KH", { timeZone }).format(new Date(0));
    return timeZone;
  } catch {
    return FALLBACK_TIME_ZONE;
  }
}

export const APP_TIME_ZONE = resolveAppTimeZone(CONFIGURED_APP_TIME_ZONE);

function toValidDate(value?: string | Date | null): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatPhnomPenhDateTime(
  value?: string | Date | null,
  locale: AppDateLocale = "km-KH",
): string {
  const date = toValidDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatPhnomPenhDate(
  value?: string | Date | null,
  locale: AppDateLocale = "km-KH",
): string {
  const date = toValidDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    dateStyle: "medium",
  }).format(date);
}

export function formatNotificationTime(
  value?: string | Date | null,
  locale: AppDateLocale = "km-KH",
): string {
  return formatPhnomPenhDateTime(value, locale);
}

export function getPhnomPenhDateKey(value?: string | Date | null): string {
  const date = toValidDate(value);

  if (!date) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-KH", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : "";
}
