const KEY = "farmora.recentlyViewed";
const MAX = 12;

export interface RecentItem {
  type: "listing" | "request";
  id: string;
  viewedAt: number;
}

export function getRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function pushRecent(type: "listing" | "request", id: string) {
  if (typeof window === "undefined") return;
  const list = getRecent().filter((r) => !(r.id === id && r.type === type));
  list.unshift({ type, id, viewedAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}