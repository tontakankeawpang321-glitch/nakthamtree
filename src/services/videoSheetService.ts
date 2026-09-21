import { VideoItem } from '../types';
import { INITIAL_VIDEOS } from '../data/videoData';

export const VIDEO_STORAGE_KEY = 'naktham_video_sheet_url';
export const VIDEOS_CACHE_KEY = 'naktham_live_videos_cache';

// Default Video Sheet published URL
export const DEFAULT_VIDEO_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSRIbnd8GzfHdFpFC2vUWD_n-IqIjYMbTo65hBhpzVcdPCZ3-qhkBOLOApQ8xfhFWVBltXKiEdbBQOr/pub?output=csv';

export interface VideoFetchResult {
  success: boolean;
  videos: VideoItem[];
  error?: string;
  rowCount: number;
}

// Extract YouTube ID from various YouTube URL formats
export function extractYoutubeId(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Format: youtube.com/watch?v=ID or youtu.be/ID or youtube.com/embed/ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  return '';
}

export function getSavedVideoSheetUrl(): string {
  try {
    const saved = localStorage.getItem(VIDEO_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // Ignore
  }
  return DEFAULT_VIDEO_SHEET_URL;
}

export function saveVideoSheetUrl(url: string): void {
  try {
    localStorage.setItem(VIDEO_STORAGE_KEY, url.trim());
  } catch {
    // Ignore
  }
}

export function getCachedVideos(): VideoItem[] {
  try {
    const cached = localStorage.getItem(VIDEOS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }
  return INITIAL_VIDEOS;
}

export function setCachedVideos(videos: VideoItem[]): void {
  try {
    localStorage.setItem(VIDEOS_CACHE_KEY, JSON.stringify(videos));
    window.dispatchEvent(new CustomEvent('naktham_videos_updated', { detail: { videos } }));
  } catch {
    // Ignore
  }
}

// Parse CSV line handling commas within quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
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

/**
 * Fetch video items directly from Google Sheet CSV endpoint in real-time.
 * If rows are deleted in the Google Sheet, they are deleted in the app.
 * If rows are added in the Google Sheet, they appear in the app.
 */
export async function fetchLiveVideosFromSheet(customUrl?: string): Promise<VideoFetchResult> {
  const targetUrl = customUrl?.trim() || getSavedVideoSheetUrl();
  if (!targetUrl) {
    return {
      success: false,
      videos: [],
      error: 'ยังไม่ได้ระบุลิงก์ Google Sheet วิดีโอ',
      rowCount: 0
    };
  }

  // Build endpoints to try
  const endpoints: string[] = [];

  // If it's a published /pub?output=csv link
  if (targetUrl.includes('/pub') || targetUrl.includes('output=csv')) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    endpoints.push(`${targetUrl}${separator}_t=${Date.now()}`);
  } else {
    // Extract ID if standard URL
    const match = targetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const sheetId = match[1];
      endpoints.push(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&t=${Date.now()}`);
      endpoints.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&t=${Date.now()}`);
    } else {
      endpoints.push(targetUrl);
    }
  }

  let rawCsv = '';
  let fetchError = '';

  for (const url of endpoints) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        rawCsv = await response.text();
        if (rawCsv && rawCsv.trim().length > 0 && !rawCsv.includes('<!DOCTYPE html>')) {
          break;
        }
      } else {
        fetchError = `HTTP ${response.status}: ไม่สามารถเข้าถึงชีตได้`;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      fetchError = `เชื่อมต่อชีตไม่ได้: ${msg}`;
    }
  }

  if (!rawCsv || rawCsv.includes('<!DOCTYPE html>')) {
    // If live fetch fails (e.g. network/offline or unshared sheet), return cached or initial videos
    const cached = getCachedVideos();
    return {
      success: false,
      videos: cached.length > 0 ? cached : INITIAL_VIDEOS,
      error: fetchError || 'ไม่สามารถดึงข้อมูลแบบสดจากชีตได้',
      rowCount: cached.length
    };
  }

  // Parse lines
  const lines = rawCsv
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // If only header row (or empty sheet) -> exactly as user requested: return 0 items
  if (lines.length <= 1) {
    setCachedVideos([]);
    return {
      success: true,
      videos: [],
      rowCount: 0
    };
  }

  // Header row: category, title, description (or url)
  const headerCols = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, '').trim());
  let categoryIdx = headerCols.findIndex(h => h === 'category' || h.includes('หมวด') || h.includes('ประเภท'));
  let titleIdx = headerCols.findIndex(h => h === 'title' || h.includes('ชื่อ') || h.includes('คลิป') || h.includes('วิดีโอ'));
  let descIdx = headerCols.findIndex(h => h === 'description' || h.includes('คำอธิบาย') || h.includes('รายละเอียด') || h.includes('desc') || h.includes('url') || h.includes('link'));

  if (categoryIdx === -1 && titleIdx === -1 && descIdx === -1) {
    categoryIdx = 0;
    titleIdx = 1;
    descIdx = 2;
  } else {
    if (categoryIdx === -1) categoryIdx = 0;
    if (titleIdx === -1) titleIdx = 1;
    if (descIdx === -1) descIdx = 2;
  }

  const videos: VideoItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const rawCategory = (cols[categoryIdx] || '').trim();
    const rawTitle = (cols[titleIdx] || '').trim();
    const rawDescOrUrl = (cols[descIdx] || '').trim();

    if (!rawTitle && !rawDescOrUrl) continue;

    const category = rawCategory || 'นักธรรมตรี';
    const title = rawTitle || `คลิปวิดีโอที่ ${i}`;
    const url = rawDescOrUrl.startsWith('http') ? rawDescOrUrl : `https://${rawDescOrUrl}`;
    const description = rawDescOrUrl;

    const youtubeId = extractYoutubeId(url);
    const thumbnailUrl = youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60';
    const embedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : '';

    videos.push({
      id: `live_vid_${i}_${encodeURIComponent(title).slice(0, 15)}`,
      category,
      title,
      description,
      url,
      youtubeId,
      thumbnailUrl,
      embedUrl
    });
  }

  // Update persistent cache
  setCachedVideos(videos);

  return {
    success: true,
    videos,
    rowCount: videos.length
  };
}
