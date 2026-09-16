import React, { useState, useEffect } from 'react';
import { Menu, Star, Sparkles } from 'lucide-react';
import { NavTab } from '../types';
import { getFavorites } from '../services/favoritesService';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentTab: NavTab;
  onOpenFavorites: () => void;
  onOpenDidYouKnow?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentTab,
  onOpenFavorites,
  onOpenDidYouKnow
}) => {
  const [favoriteCount, setFavoriteCount] = useState<number>(() => getFavorites().length);

  useEffect(() => {
    const handleUpdate = () => {
      setFavoriteCount(getFavorites().length);
    };
    window.addEventListener('naktham_favorites_updated', handleUpdate);
    return () => window.removeEventListener('naktham_favorites_updated', handleUpdate);
  }, []);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'บทเรียน & บทสรุปวิชา';
      case 'community':
        return 'ชุมชนสนทนาธรรม';
      case 'proverbs':
        return 'พุทธศาสนสุภาษิต';
      case 'books':
        return 'คลังหนังสือ Google Docs & Drive';
      default:
        return 'นักธรรม';
    }
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md shadow-xs border-b border-amber-100/60 sticky top-0 z-40 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="เปิดเมนูนำทาง"
          className="p-1.5 text-amber-900 hover:bg-amber-50 active:bg-amber-100 rounded-lg transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Logo Dhammachakka Icon */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-700 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-amber-600/30 shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current">
            <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6C8.69,6 6,8.69 6,12C6,15.31 8.69,18 12,18C15.31,18 18,15.31 18,12C18,8.69 15.31,6 12,6M12,8C14.21,8 16,9.79 16,12C16,14.21 14.21,16 12,16C9.79,16 8,14.21 8,12C8,9.79 9.79,8 12,8Z"/>
          </svg>
        </div>

        <div className="leading-tight min-w-0">
          <h1 className="font-maitree text-sm sm:text-base font-bold text-amber-900 tracking-tight flex items-center gap-1 truncate">
            <span>นักธรรม</span>
            <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-sans hidden xs:inline-block">
              ธรรมศึกษา
            </span>
          </h1>
          <p className="text-[10px] sm:text-[11px] text-gray-500 truncate max-w-[140px] sm:max-w-xs font-medium">
            {getTabTitle()}
          </p>
        </div>
      </div>

      {/* Header Actions: ตัดคำว่า "ออนไลน์" ออก ปรับเป็นปุ่ม "รายการโปรด" และปุ่ม "รู้หรือไม่" */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenDidYouKnow && (
          <button
            onClick={onOpenDidYouKnow}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-medium active:scale-95 transition-all"
            title="รู้หรือไม่? สุ่มอ่านเกร็ดความรู้นักธรรม ๑,๐๐๐ เรื่อง"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span className="hidden sm:inline">รู้หรือไม่</span>
          </button>
        )}

        <button
          onClick={onOpenFavorites}
          className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
          title="รายการโปรดที่บันทึกไว้ในเครื่อง"
        >
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
          <span className="hidden xs:inline whitespace-nowrap">รายการโปรด</span>
          {favoriteCount > 0 && (
            <span className="bg-amber-500 text-amber-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {favoriteCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
