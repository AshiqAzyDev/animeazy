import { useAuth0 } from '@auth0/auth0-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { hasAuth0Config } from '../auth/AuthProvider';
import { myListStore } from '../storage/myList';
import type { MediaCard, MyListItem } from '../types/media';
import { useToast } from './ToastContext';

type Ctx = {
  items: MyListItem[];
  has: (id: string) => boolean;
  toggle: (item: MediaCard) => void;
  remove: (id: string) => void;
};

const MyListCtx = createContext<Ctx | null>(null);

function useListState(userId: string | null) {
  const { toast } = useToast();
  const [items, setItems] = useState<MyListItem[]>(() => myListStore.get(userId));

  useEffect(() => {
    if (userId) setItems(myListStore.mergeGuestInto(userId));
    else setItems(myListStore.get(null));
  }, [userId]);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback(
    (item: MediaCard) => {
      if (has(item.id)) {
        setItems(myListStore.remove(item.id, userId));
        toast('Removed from My List');
      } else {
        setItems(myListStore.add(item, userId));
        toast('Added to My List ✦');
      }
    },
    [has, toast, userId],
  );

  const remove = useCallback(
    (id: string) => {
      setItems(myListStore.remove(id, userId));
      toast('Removed from My List');
    },
    [toast, userId],
  );

  return useMemo(() => ({ items, has, toggle, remove }), [items, has, toggle, remove]);
}

function AuthMyList({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth0();
  const userId = isAuthenticated ? user?.sub ?? null : null;
  const value = useListState(userId);
  return <MyListCtx.Provider value={value}>{children}</MyListCtx.Provider>;
}

function GuestMyList({ children }: { children: ReactNode }) {
  const value = useListState(null);
  return <MyListCtx.Provider value={value}>{children}</MyListCtx.Provider>;
}

export function MyListProvider({ children }: { children: ReactNode }) {
  if (hasAuth0Config()) return <AuthMyList>{children}</AuthMyList>;
  return <GuestMyList>{children}</GuestMyList>;
}

export function useMyList() {
  const ctx = useContext(MyListCtx);
  if (!ctx) throw new Error('useMyList outside provider');
  return ctx;
}
