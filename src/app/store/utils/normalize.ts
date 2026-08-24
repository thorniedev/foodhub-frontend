/**
 * Central API response normalization helpers for FoodHub frontend.
 *
 * Handles standardized backend envelopes:
 * 1. Single entity: ApiResponse<T> -> { status, message, data: T, timestamp }
 * 2. Paginated list: PageResponse<T> -> { status, message, data: { items: T[], pageNumber, pageSize, totalElements, ... } }
 * 3. Legacy payloads: { payload: ... }, Spring Page { content: [...] }, custom { contents: [...] }
 */

export interface NormalizedPage<T> {
  contents: T[];
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function normalizePayload<T>(response: unknown, fallback: T): T {
  if (response === null || response === undefined) {
    return fallback;
  }
  if (typeof response === "object") {
    const raw = response as Record<string, unknown>;
    // 1. Standard ApiResponse 'data'
    if (raw.data !== undefined && raw.data !== null) {
      return raw.data as T;
    }
    // 2. Backward compatibility for 'payload'
    if (raw.payload !== undefined && raw.payload !== null) {
      return raw.payload as T;
    }
  }
  return response as T;
}

export function normalizeArrayPayload<T>(response: unknown): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response as T[];

  if (typeof response === "object") {
    const raw = response as Record<string, unknown>;

    // Case 1: Standard ApiResponse with PageResponse or Array in .data
    if (raw.data) {
      if (Array.isArray(raw.data)) return raw.data as T[];
      if (typeof raw.data === "object") {
        const dObj = raw.data as Record<string, unknown>;
        if (Array.isArray(dObj.items)) return dObj.items as T[];
        if (Array.isArray(dObj.contents)) return dObj.contents as T[];
        if (Array.isArray(dObj.content)) return dObj.content as T[];
      }
    }

    // Case 2: Legacy .payload
    if (raw.payload) {
      if (Array.isArray(raw.payload)) return raw.payload as T[];
      if (typeof raw.payload === "object") {
        const pObj = raw.payload as Record<string, unknown>;
        if (Array.isArray(pObj.items)) return pObj.items as T[];
        if (Array.isArray(pObj.contents)) return pObj.contents as T[];
        if (Array.isArray(pObj.content)) return pObj.content as T[];
      }
    }

    // Case 3: Direct page format
    if (Array.isArray(raw.items)) return raw.items as T[];
    if (Array.isArray(raw.contents)) return raw.contents as T[];
    if (Array.isArray(raw.content)) return raw.content as T[];
  }

  return [];
}

export function normalizePageResponse<T>(
  response: unknown,
  fallbackPageSize = 20,
): NormalizedPage<T> {
  const items = normalizeArrayPayload<T>(response);

  let pageNumber = 0;
  let pageSize = fallbackPageSize;
  let totalElements = items.length;
  let totalPages = Math.ceil(totalElements / Math.max(1, pageSize)) || 1;
  let isFirst = true;
  let isLast = true;
  let hasNext = false;
  let hasPrevious = false;

  if (response && typeof response === "object") {
    const root = response as Record<string, unknown>;
    const targetObj: Record<string, unknown> =
      root.data && typeof root.data === "object" && !Array.isArray(root.data)
        ? (root.data as Record<string, unknown>)
        : root.payload && typeof root.payload === "object" && !Array.isArray(root.payload)
        ? (root.payload as Record<string, unknown>)
        : root;

    pageNumber = Number(targetObj.pageNumber ?? targetObj.number ?? targetObj.page ?? 0);
    pageSize = Number(targetObj.pageSize ?? targetObj.size ?? fallbackPageSize);
    totalElements = Number(
      targetObj.totalElements ??
        targetObj.total ??
        targetObj.totalCount ??
        items.length,
    );
    totalPages = Number(
      targetObj.totalPages ??
        targetObj.pageCount ??
        (Math.ceil(totalElements / Math.max(1, pageSize)) || 1),
    );
    isFirst = Boolean(
      targetObj.isFirst ?? targetObj.first ?? pageNumber === 0,
    );
    isLast = Boolean(
      targetObj.isLast ??
        targetObj.last ??
        pageNumber >= Math.max(0, totalPages - 1),
    );
    hasNext = Boolean(
      targetObj.hasNext ?? targetObj.has_next ?? pageNumber < totalPages - 1,
    );
    hasPrevious = Boolean(
      targetObj.hasPrevious ?? targetObj.has_previous ?? pageNumber > 0,
    );
  }

  return {
    contents: items,
    items,
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    first: isFirst,
    last: isLast,
    isFirst,
    isLast,
    hasNext,
    hasPrevious,
  };
}
