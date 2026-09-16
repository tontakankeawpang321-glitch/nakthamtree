import { Book } from '../types';

export const SHEET_STORAGE_KEY = 'naktham_google_sheet_url';
export const BOOKS_CACHE_KEY = 'naktham_live_books_cache';

// Helper to extract Google Sheet ID from full URL, sharing link, or raw ID
export function extractSheetId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Case 1: Full URL containing /spreadsheets/d/<ID>/
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Case 2: User gave raw ID directly
  if (!trimmed.includes('/') && trimmed.length >= 15) {
    return trimmed;
  }

  return trimmed;
}

export function getSavedSheetUrl(): string {
  try {
    return localStorage.getItem(SHEET_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveSheetUrl(url: string): void {
  try {
    localStorage.setItem(SHEET_STORAGE_KEY, url.trim());
  } catch {
    // Ignore
  }
}

export function getCachedBooks(): Book[] {
  try {
    const cached = localStorage.getItem(BOOKS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore
  }
  return [];
}

export function setCachedBooks(books: Book[]): void {
  try {
    localStorage.setItem(BOOKS_CACHE_KEY, JSON.stringify(books));
    window.dispatchEvent(new CustomEvent('naktham_books_updated', { detail: { books } }));
  } catch {
    // Ignore
  }
}

// Parse CSV line handling commas within double quotes and escaped quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export interface SheetFetchResult {
  success: boolean;
  books: Book[];
  error?: string;
  rowCount: number;
}

/**
 * Fetch books directly from Google Sheet in real-time.
 * If rows are deleted in Google Sheet, this will return only the remaining rows (or empty []).
 */
export async function fetchLiveBooksFromSheet(sheetUrlOrId?: string): Promise<SheetFetchResult> {
  const target = sheetUrlOrId?.trim() || getSavedSheetUrl();
  if (!target) {
    return {
      success: false,
      books: [],
      error: 'ยังไม่ได้ระบุลิงก์ Google Sheet',
      rowCount: 0
    };
  }

  const sheetId = extractSheetId(target);
  if (!sheetId) {
    return {
      success: false,
      books: [],
      error: 'ลิงก์หรือรหัส Google Sheet ไม่ถูกต้อง',
      rowCount: 0
    };
  }

  // Endpoints to try: gviz/tq?tqx=out:csv (CORS enabled) then /export?format=csv
  const endpoints = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&t=${Date.now()}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&t=${Date.now()}`
  ];

  let rawCsv = '';
  let fetchError = '';

  for (const url of endpoints) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        rawCsv = await response.text();
        if (rawCsv && rawCsv.trim().length > 0) {
          break;
        }
      } else {
        fetchError = `HTTP ${response.status}: โปรดตรวจสอบว่าได้ตั้งค่าชีตเป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู" (Anyone with link can view)`;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      fetchError = `ไม่สามารถเชื่อมต่อชีตได้: ${msg}`;
    }
  }

  if (!rawCsv) {
    return {
      success: false,
      books: [],
      error: fetchError || 'ไม่สามารถดึงข้อมูลจากชีตได้ กรุณาตรวจสอบสิทธิ์การแชร์',
      rowCount: 0
    };
  }

  // Parse lines
  const lines = rawCsv
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // If there are 0 or 1 lines (only header row category, title, description, url),
  // it means THERE ARE NO BOOKS on the sheet!
  if (lines.length <= 1) {
    // Exactly as requested: if deleted or empty on sheet, return empty array!
    setCachedBooks([]);
    return {
      success: true,
      books: [],
      rowCount: 0
    };
  }

  // Read header row
  const headerCols = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, '').trim());

  // Find column positions dynamically based on user's sheet headers:
  // category | title | description | url
  let categoryIdx = headerCols.findIndex(h => h === 'category' || h.includes('หมวด') || h.includes('ประเภท'));
  let titleIdx = headerCols.findIndex(h => h === 'title' || h.includes('ชื่อ') || h.includes('book'));
  let descIdx = headerCols.findIndex(h => h === 'description' || h.includes('คำอธิบาย') || h.includes('รายละเอียด') || h.includes('desc'));
  let urlIdx = headerCols.findIndex(h => h === 'url' || h.includes('link') || h.includes('drive') || h.includes('ลิงก์'));

  // Fallback default index if headers are unnamed
  if (categoryIdx === -1 && titleIdx === -1 && urlIdx === -1) {
    categoryIdx = 0;
    titleIdx = 1;
    descIdx = 2;
    urlIdx = 3;
  } else {
    if (categoryIdx === -1) categoryIdx = 0;
    if (titleIdx === -1) titleIdx = 1;
    if (descIdx === -1) descIdx = 2;
    if (urlIdx === -1) urlIdx = 3;
  }

  const books: Book[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const rawCategory = (cols[categoryIdx] || '').trim();
    const rawTitle = (cols[titleIdx] || '').trim();
    const rawDesc = (cols[descIdx] || '').trim();
    const rawUrl = (cols[urlIdx] || '').trim();

    // Skip empty rows where both title and url are missing
    if (!rawTitle && !rawUrl) continue;

    const title = rawTitle || (rawUrl ? 'เอกสารธรรมศึกษา' : `หนังสือเล่มที่ ${i}`);
    const category = rawCategory || 'คลังหนังสือ';
    const description = rawDesc || `เอกสารประกอบการศึกษา ${title}`;
    const driveUrl = rawUrl;

    // Determine format
    const lowerUrl = driveUrl.toLowerCase();
    const isDocx = lowerUrl.includes('.docx') || lowerUrl.includes('/document/') || rawTitle.toLowerCase().includes('.docx');
    const format: 'docx' | 'pdf' = isDocx ? 'docx' : 'pdf';

    // Parse Doc / File IDs for preview and download
    let viewUrl = driveUrl;
    let downloadUrl = driveUrl;

    if (driveUrl.includes('docs.google.com/document/d/')) {
      const match = driveUrl.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        viewUrl = `https://docs.google.com/document/d/${match[1]}/preview`;
        downloadUrl = `https://docs.google.com/document/d/${match[1]}/export?format=docx`;
      }
    } else if (driveUrl.includes('drive.google.com/file/d/')) {
      const match = driveUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        viewUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
        downloadUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }

    // Determine Level
    let level = 'ทั่วไป';
    const combinedText = `${category} ${title}`;
    if (combinedText.includes('ตรี')) level = 'นักธรรมตรี';
    else if (combinedText.includes('โท')) level = 'นักธรรมโท';
    else if (combinedText.includes('เอก')) level = 'นักธรรมเอก';

    books.push({
      id: `live_sheet_${i}_${Date.now()}_${encodeURIComponent(title).slice(0, 15)}`,
      title,
      category,
      level,
      format,
      driveUrl,
      viewUrl,
      downloadUrl,
      fileSize: format.toUpperCase(),
      description
    });
  }

  // Update cached books
  setCachedBooks(books);

  return {
    success: true,
    books,
    rowCount: books.length
  };
}
