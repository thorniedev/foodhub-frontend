type ApiErrorObject = {
  status?: number | string;
  originalStatus?: number;
  error?: string;
  message?: string;
  data?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readMessageFromRecord(record: Record<string, unknown>): string | null {
  for (const key of ["message", "error", "detail", "errorCode"]) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const errors = record.errors;
  if (Array.isArray(errors)) {
    const messages = errors
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }

        if (isRecord(item)) {
          return readMessageFromRecord(item);
        }

        return null;
      })
      .filter((item): item is string => Boolean(item));

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  return null;
}

function readMessageFromData(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (!isRecord(data)) {
    return null;
  }

  return readMessageFromRecord(data);
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error)) {
    return fallback;
  }

  const apiError = error as ApiErrorObject;
  const status = apiError.status ?? apiError.originalStatus;
  const message =
    readMessageFromData(apiError.data) ||
    (typeof apiError.error === "string" && apiError.error.trim()
      ? apiError.error.trim()
      : null) ||
    (typeof apiError.message === "string" && apiError.message.trim()
      ? apiError.message.trim()
      : null);

  if (!message) {
    return fallback;
  }

  return status ? `${status}: ${message}` : message;
}
