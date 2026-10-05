import type { MediaCard, MyListItem } from '../types/media';

const GUEST_KEY = 'animeazy.mylist.guest';

function keyFor(userId?: string | null) {
  return userId ? `animeazy.mylist.${userId}` : GUEST_KEY;
}

function read(userId?: string | null): MyListItem[] {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    return raw ? (JSON.parse(raw) as MyListItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: MyListItem[], userId?: string | null) {
  localStorage.setItem(keyFor(userId), JSON.stringify(items));
}

export const myListStore = {
  get(userId?: string | null) {
    return read(userId);
  },
  has(id: string, userId?: string | null) {
    return read(userId).some((i) => i.id === id);
  },
  add(item: MediaCard, userId?: string | null) {
    const list = read(userId);
    if (list.some((i) => i.id === item.id)) return list;
    const next: MyListItem[] = [
      {
        id: item.id,
        kind: item.kind,
        title: item.title,
        image: item.image,
        score: item.score,
        addedAt: Date.now(),
        progress: 0,
      },
      ...list,
    ];
    write(next, userId);
    return next;
  },
  remove(id: string, userId?: string | null) {
    const next = read(userId).filter((i) => i.id !== id);
    write(next, userId);
    return next;
  },
  setProgress(id: string, progress: number, userId?: string | null) {
    const next = read(userId).map((i) => (i.id === id ? { ...i, progress } : i));
    write(next, userId);
    return next;
  },
  mergeGuestInto(userId: string) {
    const guest = read(null);
    if (!guest.length) return read(userId);
    const user = read(userId);
    const map = new Map<string, MyListItem>();
    [...guest, ...user].forEach((i) => map.set(i.id, i));
    const merged = [...map.values()].sort((a, b) => b.addedAt - a.addedAt);
    write(merged, userId);
    localStorage.removeItem(GUEST_KEY);
    return merged;
  },
};
