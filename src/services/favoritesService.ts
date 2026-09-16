export interface FavoriteItem {
  id: string;
  type: 'html_page' | 'book' | 'trivia' | 'proverb';
  title: string;
  subtitle?: string;
  category?: string;
  targetId?: string; // bookId, chapter pageNumber, etc.
  bookId?: 'naktham-tee' | 'naktham-tho' | 'naktham-ek' | string;
  pageNumber?: number;
  url?: string;
  addedAt: number;
}

const STORAGE_KEY = 'naktham_user_favorites';

export const getFavorites = (): FavoriteItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load favorites from localStorage', e);
    return [];
  }
};

export const saveFavorites = (items: FavoriteItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('naktham_favorites_updated', { detail: items }));
  } catch (e) {
    console.warn('Failed to save favorites to localStorage', e);
  }
};

export const addFavorite = (item: Omit<FavoriteItem, 'addedAt'>): boolean => {
  const current = getFavorites();
  if (current.some(f => f.id === item.id)) {
    return false; // already exists
  }
  const updated = [{ ...item, addedAt: Date.now() }, ...current];
  saveFavorites(updated);
  return true;
};

export const removeFavorite = (id: string): boolean => {
  const current = getFavorites();
  const filtered = current.filter(f => f.id !== id);
  if (filtered.length !== current.length) {
    saveFavorites(filtered);
    return true;
  }
  return false;
};

export const isFavorite = (id: string): boolean => {
  const current = getFavorites();
  return current.some(f => f.id === id);
};

export const toggleFavorite = (item: Omit<FavoriteItem, 'addedAt'>): boolean => {
  if (isFavorite(item.id)) {
    removeFavorite(item.id);
    return false; // now un-favorited
  } else {
    addFavorite(item);
    return true; // now favorited
  }
};
