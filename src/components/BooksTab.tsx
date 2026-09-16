import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Eye,
  Star,
  RefreshCw,
  Settings,
  X,
  Link2,
  Check
} from 'lucide-react';
import { Book } from '../types';
import {
  getCachedBooks,
  fetchLiveBooksFromSheet,
  getSavedSheetUrl,
  saveSheetUrl
} from '../services/googleSheetService';
import { toggleFavorite, isFavorite } from '../services/favoritesService';

interface BooksTabProps {
  onOpenBook: (book: Book) => void;
  onOpenHtmlBook?: (bookId: 'naktham-tee' | 'naktham-tho' | 'naktham-ek') => void;
}

export const BooksTab: React.FC<BooksTabProps> = ({ onOpenBook, onOpenHtmlBook }) => {
  // Books state connected to live sheet / persistent cache
  const [books, setBooks] = useState<Book[]>(() => getCachedBooks());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'docx'>('all');
  const [levelFilter, setLevelFilter] = useState<string>('ทั้งหมด');
  const [, setFavVersion] = useState<number>(0);

  // Discreet settings dialog state (never shown on main page unless explicitly clicked)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [tempSheetUrl, setTempSheetUrl] = useState<string>(() => getSavedSheetUrl());
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  // Background live sync with connected Google Sheet
  const handleSyncSheet = useCallback(async (customUrl?: string) => {
    const targetUrl = customUrl !== undefined ? customUrl : getSavedSheetUrl();
    if (!targetUrl) return;

    setIsLoading(true);
    try {
      const res = await fetchLiveBooksFromSheet(targetUrl);
      if (res.success) {
        setBooks(res.books);
      }
    } catch (err) {
      console.warn('Sheet sync error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync on mount & listen to live cache events
  useEffect(() => {
    const savedUrl = getSavedSheetUrl();
    if (savedUrl) {
      handleSyncSheet(savedUrl);
    }

    const handleFavUpdate = () => setFavVersion(v => v + 1);
    const handleBooksUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ books: Book[] }>;
      if (customEvent.detail?.books) {
        setBooks(customEvent.detail.books);
      }
    };

    window.addEventListener('naktham_favorites_updated', handleFavUpdate);
    window.addEventListener('naktham_books_updated', handleBooksUpdate);
    return () => {
      window.removeEventListener('naktham_favorites_updated', handleFavUpdate);
      window.removeEventListener('naktham_books_updated', handleBooksUpdate);
    };
  }, [handleSyncSheet]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSheetUrl.trim()) return;

    saveSheetUrl(tempSheetUrl.trim());
    setSettingsMessage('บันทึกการเชื่อมต่อเรียบร้อยแล้ว');
    handleSyncSheet(tempSheetUrl.trim());
    setTimeout(() => {
      setSettingsMessage(null);
      setIsSettingsOpen(false);
    }, 800);
  };

  const levels = ['ทั้งหมด', 'นักธรรมตรี', 'นักธรรมโท', 'นักธรรมเอก', 'ทั่วไป'];

  const handleToggleBookFav = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    toggleFavorite({
      id: book.id,
      type: 'book',
      title: book.title,
      subtitle: `${book.level} • ${book.format.toUpperCase()}`,
      category: book.category,
      targetId: book.id
    });
  };

  const filteredBooks = books.filter(b => {
    const matchFormat = formatFilter === 'all' || b.format === formatFilter;
    const matchLevel =
      levelFilter === 'ทั้งหมด' ||
      b.level.includes(levelFilter) ||
      b.category.includes(levelFilter);
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q));

    return matchFormat && matchLevel && matchQuery;
  });

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-8">
      {/* Header: Clean, traditional layout with subtle sync & settings controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-maitree text-amber-950">
            คลังหนังสือธรรมศึกษา
          </h2>
          <p className="text-xs text-amber-800/70">
            หนังสือเรียน เอกสารประกอบ และคู่มือการศึกษา
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleSyncSheet()}
            disabled={isLoading}
            className="p-2 text-amber-800 hover:text-amber-950 hover:bg-amber-100/60 rounded-xl transition-colors active:scale-95"
            title="รีเฟรชข้อมูลล่าสุดจากชีต"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setTempSheetUrl(getSavedSheetUrl());
              setIsSettingsOpen(true);
            }}
            className="p-2 text-amber-800/50 hover:text-amber-950 hover:bg-amber-100/60 rounded-xl transition-colors active:scale-95"
            title="ตั้งค่าการเชื่อมต่อชีต"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 HTML all-in-one Subject Summaries: บทสรุปวิชา นักธรรมตรี, โท, เอก */}
      {onOpenHtmlBook && (
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0"></span>
            <div>
              <span className="text-xs sm:text-sm font-bold text-gray-900 font-maitree block">
                บทสรุปวิชา (เลือกวิชาแยกชัดเจน • สไลด์เปลี่ยนหน้า)
              </span>
              <p className="text-[11px] text-gray-500 font-light">
                พื้นหลังขาว ตัวหนังสือดำ • สไลด์เปลี่ยนหน้า ถัดไป-ย้อนกลับ
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onOpenHtmlBook('naktham-tee')}
              className="px-2.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-semibold border border-emerald-200 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-2xs"
            >
              <span>บทสรุปวิชา</span>
              <span className="text-emerald-800 font-bold">นักธรรมตรี</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full font-bold">
                ๑๐๐ หน้า
              </span>
            </button>
            <button
              onClick={() => onOpenHtmlBook('naktham-tho')}
              className="px-2.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-amber-950 text-xs font-semibold border border-orange-200 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-2xs"
            >
              <span>บทสรุปวิชา</span>
              <span className="text-amber-800 font-bold">นักธรรมโท</span>
              <span className="text-[10px] text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded-full font-bold">
                ๕๐ หน้า
              </span>
            </button>
            <button
              onClick={() => onOpenHtmlBook('naktham-ek')}
              className="px-2.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 text-xs font-semibold border border-rose-200 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-2xs"
            >
              <span>บทสรุปวิชา</span>
              <span className="text-rose-800 font-bold">นักธรรมเอก</span>
              <span className="text-[10px] text-rose-700 bg-rose-100/70 px-1.5 py-0.2 rounded-full font-bold">
                ๕๐ หน้า
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-amber-100 flex flex-col gap-2.5">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหนังสือ หรือหมวดวิชา..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Format Filter Tabs */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100">
          <div className="flex gap-1">
            <button
              onClick={() => setFormatFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                formatFilter === 'all'
                  ? 'bg-amber-800 text-white font-medium shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFormatFilter('docx')}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                formatFilter === 'docx'
                  ? 'bg-blue-600 text-white font-medium shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              DOCX (Docs)
            </button>
            <button
              onClick={() => setFormatFilter('pdf')}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                formatFilter === 'pdf'
                  ? 'bg-rose-600 text-white font-medium shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              PDF
            </button>
          </div>

          <span className="text-[11px] text-gray-400">
            {filteredBooks.length} เล่ม
          </span>
        </div>

        {/* Levels Filter Chips */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`shrink-0 text-[11px] px-2.5 py-0.5 rounded-full transition-all ${
                levelFilter === lvl
                  ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Books Grid or Clean Empty State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {books.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-maitree font-bold text-sm text-gray-800">
              ไม่มีหนังสือในคลัง (๐ เล่ม)
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              ระบบเชื่อมต่อกับ Google Sheet โดยตรง หากลบหรือเพิ่มแถวบนชีต หน้าแอพจะปรับตามทันที
            </p>
            <button
              onClick={() => handleSyncSheet()}
              disabled={isLoading}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-medium border border-amber-200 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100">
            ไม่พบหนังสือที่ตรงกับคำค้นหา
          </div>
        ) : (
          filteredBooks.map(book => {
            const isPdf = book.format === 'pdf';
            const bookFav = isFavorite(book.id);

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-amber-200/50 hover:border-amber-400 transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono ${
                        isPdf
                          ? 'bg-rose-100 text-rose-800 border border-rose-200/60'
                          : 'bg-blue-100 text-blue-800 border border-blue-200/60'
                      }`}
                    >
                      {book.format}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-amber-900 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                        {book.level}
                      </span>
                      <button
                        onClick={e => handleToggleBookFav(e, book)}
                        className={`p-1 rounded-md transition-colors ${
                          bookFav ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-gray-500'
                        }`}
                        title={bookFav ? 'ลบออกจากรายการโปรด' : 'บันทึกในรายการโปรด'}
                      >
                        <Star className={`w-4 h-4 ${bookFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-maitree text-base font-bold text-gray-900 leading-snug group-hover:text-amber-800 transition-colors">
                    {book.title}
                  </h3>

                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed font-light">
                    {book.description || book.category}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-gray-400 truncate">
                    {book.fileSize || 'Google Drive'}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={book.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title="เปิดใน Drive / Docs"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => onOpenBook(book)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>เปิดอ่าน (พอดีจอ)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Discrete Settings Modal (Only opens when user clicks gear icon) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-gray-200 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2.5 border-gray-100">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-amber-800" />
                <h3 className="font-maitree font-bold text-base text-gray-900">
                  ตั้งค่า Google Sheet ที่เชื่อมต่อ
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  ลิงก์ Google Sheet:
                </label>
                <input
                  type="text"
                  value={tempSheetUrl}
                  onChange={e => setTempSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:border-amber-600 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  รูปแบบคอลัมน์: category, title, description, url
                </p>
              </div>

              {settingsMessage && (
                <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{settingsMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  ปิด
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-xs"
                >
                  บันทึกเชื่อมต่อตลอดไป
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
