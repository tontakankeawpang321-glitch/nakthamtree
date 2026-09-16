import { Book } from '../types';

// Real-time connected books cache: Empty by default so it connects directly to the user's live Google Sheet.
// When rows are deleted from the Google Sheet, this list remains empty and deleted books disappear from the app.
export const CONNECTED_SHEET_BOOKS: Book[] = [];
