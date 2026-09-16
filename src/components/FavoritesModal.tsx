import React, { useState, useEffect } from 'react';
import { Star, X, Trash2, BookOpen, ExternalLink, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FavoriteItem, getFavorites, removeFavorite } from '../services/favoritesService';
import { Book } from '../types';
import { getCachedBooks } from '../services/googleSheetService';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBook?: (book: Book) => void;
  onOpenHtmlBook?: (bookId: 'naktham-tee' | 'naktham-tho' | 'naktham-ek', pageNumber?: number) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  onOpenBook,
  onOpenHtmlBook
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  const refreshFavorites = () => {
    setFavorites(getFavorites());
  };

  useEffect(() => {
    if (isOpen) {
      refreshFavorites();
    }

    const handler = () => refreshFavorites();
    window.addEventListener('naktham_favorites_updated', handler);
    return () => window.removeEventListener('naktham_favorites_updated', handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFavorite(id);
    refreshFavorites();
  };

  const handleOpenItem = (item: FavoriteItem) => {
    if (item.type === 'html_page') {
      const bookId = (item.targetId || 'naktham-tee') as 'naktham-tee' | 'naktham-tho' | 'naktham-ek';
      if (onOpenHtmlBook) {
        onOpenHtmlBook(bookId, item.pageNumber || 1);
        onClose();
      }
    } else if (item.type === 'book') {
      // Find in all books
      const allBooks = getCachedBooks();
      const match = allBooks.find(b => b.id === item.targetId || b.title === item.title);
      if (match && onOpenBook) {
        onOpenBook(match);
        onClose();
      }
    }
  };

  const filteredFavorites = favorites.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-700 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-amber-200">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <h3 className="font-maitree text-base font-bold">รายการโปรดของฉัน</h3>
                <p className="text-[11px] text-amber-100 font-light">
                  บันทึกไว้ในเครื่อง ({favorites.length} รายการ)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2.5 bg-amber-50/70 border-b border-amber-100 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-amber-100/50 border border-gray-200'
              }`}
            >
              ทั้งหมด ({favorites.length})
            </button>
            <button
              onClick={() => setFilterType('html_page')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                filterType === 'html_page'
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-amber-100/50 border border-gray-200'
              }`}
            >
              หน้าหนังสือสรุป
            </button>
            <button
              onClick={() => setFilterType('book')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                filterType === 'book'
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-amber-100/50 border border-gray-200'
              }`}
            >
              หนังสือคลังชีต
            </button>
            <button
              onClick={() => setFilterType('trivia')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                filterType === 'trivia'
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-amber-100/50 border border-gray-200'
              }`}
            >
              รู้หรือไม่
            </button>
          </div>

          {/* List Content */}
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-gray-100">
            {filteredFavorites.length === 0 ? (
              <div className="py-12 text-center text-gray-500 space-y-2">
                <Star className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-medium">ยังไม่มีรายการที่บันทึกไว้</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  แตะไอคอนดาวหรือบุ๊กมาร์กในหน้าหนังสือสรุป หรือหนังสือในคลัง เพื่อบันทึกไว้อ่านภายหลัง
                </p>
              </div>
            ) : (
              filteredFavorites.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2.5 hover:bg-amber-50/50 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      {item.type === 'html_page' && <BookOpen className="w-4 h-4" />}
                      {item.type === 'book' && <FileText className="w-4 h-4" />}
                      {item.type === 'trivia' && <Sparkles className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 font-medium">
                            {item.category}
                          </span>
                        )}
                        {item.pageNumber && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                            หน้าที่ {item.pageNumber}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate group-hover:text-amber-900 transition-colors">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-[11px] text-gray-500 truncate max-w-sm">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={e => handleDelete(e, item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบออกจากรายการโปรด"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-700 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-800 hover:bg-black text-white text-xs font-semibold rounded-lg active:scale-95 transition-all"
            >
              ปิด
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
