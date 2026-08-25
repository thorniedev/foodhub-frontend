export interface ParsedFriendQrInput {
  value: string;
  isQrToken: boolean;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readTokenFromUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const token = url.searchParams.get("token");

    if (token?.trim()) {
      return token.trim();
    }
  } catch {
    // Continue with regex parsing for app links or pasted partial URLs.
  }

  const tokenMatch = value.match(/[?&]token=([^&#\s]+)/i);
  return tokenMatch?.[1] ? decodeURIComponent(tokenMatch[1]) : null;
}

function readUsernameFromUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const add = url.searchParams.get("add") || url.searchParams.get("username");

    if (add?.trim()) {
      return add.trim();
    }
  } catch {
    // Continue with regex parsing for pasted partial URLs.
  }

  const match = value.match(/(?:\/friends\?add=|\/u\/)([a-zA-Z0-9_.-]+)/);
  return match?.[1] ?? null;
}

export function parseFriendQrInput(
  rawInput: string,
  options?: { preferQrToken?: boolean },
): ParsedFriendQrInput | null {
  let value = rawInput.trim();

  if (!value) {
    return null;
  }

  if (value.startsWith("{") && value.endsWith("}")) {
    try {
      const parsed = asRecord(JSON.parse(value));

      if (parsed) {
        const qrContent = readString(parsed, ["qrContent", "content"]);
        const qrToken = readString(parsed, ["qrCodeToken", "token"]);
        const userReference = readString(parsed, ["username", "userUuid"]);

        if (qrToken) {
          return { value: qrToken, isQrToken: true };
        }

        if (qrContent) {
          return parseFriendQrInput(qrContent, {
            preferQrToken: true,
          });
        }

        if (userReference) {
          return { value: userReference, isQrToken: false };
        }
      }
    } catch {
      // Treat malformed JSON as normal user input.
    }
  }

  const qrTokenFromUrl = readTokenFromUrl(value);
  if (qrTokenFromUrl) {
    return { value: qrTokenFromUrl, isQrToken: true };
  }

  const usernameFromUrl = readUsernameFromUrl(value);
  if (usernameFromUrl) {
    return { value: usernameFromUrl, isQrToken: false };
  }

  if (value.startsWith("@")) {
    value = value.slice(1);
  }

  const looksLikeQrToken = value.startsWith("fh_qr_") || value.includes("qr_");

  return {
    value,
    isQrToken: options?.preferQrToken === true || looksLikeQrToken,
  };
}
