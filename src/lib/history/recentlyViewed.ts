export type HistoryItem = {
  uuid: string;
  name: string;
  localName?: string | null;
  thumbnail?: string | null;
  price?: number | null;
  currencyCode?: string | null;
  viewedAt: string;
};

const HISTORY_KEY = "foodhub-recently-viewed";
const MAX_HISTORY = 30;
export const HISTORY_UPDATED_EVENT = "foodhub-history-updated";

function notifyHistoryUpdated() {
  window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));
}

export function addToHistory(item: Omit<HistoryItem, "viewedAt">) {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(HISTORY_KEY);

    const history: HistoryItem[] = stored ? JSON.parse(stored) : [];

    // Remove old occurrence so we don't create duplicates
    const withoutCurrent = history.filter(
      (historyItem) => historyItem.uuid !== item.uuid,
    );

    const updatedHistory: HistoryItem[] = [
      {
        ...item,
        viewedAt: new Date().toISOString(),
      },
      ...withoutCurrent,
    ].slice(0, MAX_HISTORY);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    notifyHistoryUpdated();
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);

    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearHistory() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(HISTORY_KEY);
  notifyHistoryUpdated();
}
