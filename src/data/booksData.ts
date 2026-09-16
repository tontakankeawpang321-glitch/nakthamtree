import { Book } from '../types';
import { CONNECTED_SHEET_BOOKS } from './connectedSheetBooks';
import {
  getCachedBooks,
  fetchLiveBooksFromSheet,
  extractSheetId,
  saveSheetUrl,
  getSavedSheetUrl
} from '../services/googleSheetService';

export {
  CONNECTED_SHEET_BOOKS,
  getCachedBooks,
  fetchLiveBooksFromSheet,
  extractSheetId,
  saveSheetUrl,
  getSavedSheetUrl
};

// DEFAULT_BOOKS reads from live cache, empty by default if sheet is empty or deleted
export const DEFAULT_BOOKS: Book[] = getCachedBooks().length > 0 ? getCachedBooks() : CONNECTED_SHEET_BOOKS;

// Helper to fetch books directly from sheet
export async function fetchBooksFromSheet(sheetUrlOrId: string): Promise<Book[]> {
  const res = await fetchLiveBooksFromSheet(sheetUrlOrId);
  return res.books;
}
