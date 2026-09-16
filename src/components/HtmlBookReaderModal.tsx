import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  List,
  X,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Layers,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HtmlBook } from '../data/htmlBooksData';
import { toggleFavorite, isFavorite } from '../services/favoritesService';

interface HtmlBookReaderModalProps {
  book: HtmlBook | null;
  initialPageIndex?: number;
  onClose: () => void;
}

interface SubjectGroup {
  id: string;
  name: string;
  shortName: string;
  startPage: number;
  endPage: number;
  pageCount: number;
  description: string;
}

export const HtmlBookReaderModal: React.FC<HtmlBookReaderModalProps> = ({
  book,
  initialPageIndex = 0,
  onClose
}) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(initialPageIndex);

  useEffect(() => {
    if (initialPageIndex !== undefined && initialPageIndex >= 0) {
      setActivePageIndex(initialPageIndex);
    }
  }, [initialPageIndex]);
  const [slideDirection, setSlideDirection] = useState<number>(1); // +1 = next (slide from right), -1 = prev (slide from left)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState<boolean>(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0 = sm, 1 = base, 2 = lg, 3 = xl
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isQuickJumpOpen, setIsQuickJumpOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Subject groups defined with high precision per curriculum level
  const subjectGroups = useMemo<SubjectGroup[]>(() => {
    if (!book) return [];

    if (book.id === 'naktham-tee') {
      return [
        {
          id: 'dhamma',
          name: '๑. วิชาธรรมวิภาค และคิหิปฏิบัติ',
          shortName: 'ธรรมวิภาค',
          startPage: 1,
          endPage: 28,
          pageCount: 28,
          description: 'ธรรมหมวด ๒ ถึงหมวด ๑๔, ธรรมมีอุปการะมาก, โลกบาล, โอวาท ๓, อิทธิบาท ๔, เบญจศีลเบญจธรรม, ทิศ ๖, อบายมุข ๖, มรรค ๘'
        },
        {
          id: 'vinaya',
          name: '๒. วิชาวินัยมุข เล่ม ๑',
          shortName: 'วินัยมุข',
          startPage: 29,
          endPage: 52,
          pageCount: 24,
          description: 'พระวินัยบัญญัติ, ปาราชิก ๔, สังฆาทิเสส ๑๓, อนิยต ๒, นิสสัคคิยปาจิตตีย์ ๓๐, ปาจิตตีย์, เสขิยวัตร ๗๕ และระเบียบสงฆ์'
        },
        {
          id: 'history',
          name: '๓. วิชาพุทธประวัติ และศาสนพิธี',
          shortName: 'พุทธประวัติ',
          startPage: 53,
          endPage: 76,
          pageCount: 24,
          description: 'ประวัติพระบรมศาสดา ปริจเฉท ๑-๘, พระสาวกสำคัญ, วันสำคัญทางพุทธศาสนา, กุศลพิธี บุญพิธี และทานพิธี'
        },
        {
          id: 'kratu',
          name: '๔. วิชากระทู้ธรรม ชั้นตรี',
          shortName: 'กระทู้ธรรม',
          startPage: 77,
          endPage: 88,
          pageCount: 12,
          description: 'หลักการแต่งกระทู้ธรรม, แบบแผนคำนำ-อธิบาย-เชื่อม-สรุป, พุทธศาสนสุภาษิตหมวดตน กรรม วิริยะ ปัญญา และตัวอย่างเก็ง'
        },
        {
          id: 'exam',
          name: '๕. รวมเก็งข้อสอบสนามหลวง ๔ วิชา',
          shortName: 'เก็งข้อสอบ',
          startPage: 89,
          endPage: 100,
          pageCount: 12,
          description: 'รวมแนวข้อสอบจริงสนามหลวงครบ ๔ วิชา พร้อมเฉลยละเอียดและเทคนิคจำแม่น'
        }
      ];
    } else if (book.id === 'naktham-tho') {
      return [
        {
          id: 'dhamma',
          name: '๑. วิชาธรรมวิจารณ์ (สมถะ-วิปัสสนา)',
          shortName: 'ธรรมวิจารณ์',
          startPage: 1,
          endPage: 14,
          pageCount: 14,
          description: 'สมถกรรมฐาน ๔๐, วิปัสสนากรรมฐาน, นิวรณ์ ๕, ฌาน ๔, อุปกิเลส ๑๖, วิสุทธิ ๗, ญาณ ๑๖'
        },
        {
          id: 'vinaya',
          name: '๒. วิชาวินัยมุข เล่ม ๒',
          shortName: 'วินัยมุข',
          startPage: 15,
          endPage: 26,
          pageCount: 12,
          description: 'ข้อห้ามและข้ออนุญาต, ภิกขุนีขันธกะ, จีวรขันธกะ, เภสัชชขันธกะ, กฐินขันธกะ และครุธรรม ๘'
        },
        {
          id: 'history',
          name: '๓. วิชาอนุพุทธประวัติ และพุทธสาวิกา',
          shortName: 'อนุพุทธประวัติ',
          startPage: 27,
          endPage: 38,
          pageCount: 12,
          description: 'ประวัติพระอสีติมหาสาวก เช่น พระสารีบุตร, พระโมคคัลลานะ, พระอานนท์, พระมหากัสสปะ และพุทธสาวิกา'
        },
        {
          id: 'kratu',
          name: '๔. วิชากระทู้ธรรม ชั้นโท',
          shortName: 'กระทู้ธรรม',
          startPage: 39,
          endPage: 45,
          pageCount: 7,
          description: 'หลักการแต่งกระทู้ธรรมชั้นโท เชื่อมโยง ๒ สุภาษิต คำอธิบายขยายความ และตัวอย่างกระทู้เก็ง'
        },
        {
          id: 'exam',
          name: '๕. รวมเก็งข้อสอบสนามหลวง',
          shortName: 'เก็งข้อสอบ',
          startPage: 46,
          endPage: 50,
          pageCount: 5,
          description: 'เจาะลึกข้อสอบสนามหลวงชั้นโท พร้อมเฉลยแนววิเคราะห์มาตรฐานแม่กองธรรม'
        }
      ];
    } else {
      // naktham-ek
      return [
        {
          id: 'dhamma',
          name: '๑. วิชาธรรมวิจารณ์ ชั้นเอก (ปรมัตถธรรม)',
          shortName: 'ธรรมวิจารณ์',
          startPage: 1,
          endPage: 14,
          pageCount: 14,
          description: 'ปรมัตถธรรม ๔, จิต ๘๙, เจตสิก ๕๒, รูป ๒๘, นิพพาน, ปฏิจจสมุปบาท และโพธิปักขิยธรรม ๓๗'
        },
        {
          id: 'vinaya',
          name: '๒. วิชาวินัยมุข เล่ม ๓ (สังฆกรรม)',
          shortName: 'วินัยมุข',
          startPage: 15,
          endPage: 26,
          pageCount: 12,
          description: 'สังฆกรรม ๔, สีมา, อุปสมบทกรรม, ปาติโมกขุทเทส, กฐินกรรม, อธิกรณ์ ๔ และสมถะ ๗'
        },
        {
          id: 'history',
          name: '๓. วิชาพุทธานุพุทธประวัติ & ประวัติศาสตร์',
          shortName: 'พุทธประวัติ',
          startPage: 27,
          endPage: 38,
          pageCount: 12,
          description: 'ประวัติการทำสังคายนา ๑-๕, การเผยแผ่พระพุทธศาสนาสู่สยาม, ยุคทวารวดี สุโขทัย อยุธยา รัตนโกสินทร์'
        },
        {
          id: 'kratu',
          name: '๔. วิชากระทู้ธรรม ชั้นเอก',
          shortName: 'กระทู้ธรรม',
          startPage: 39,
          endPage: 45,
          pageCount: 7,
          description: 'หลักการแต่งกระทู้ธรรมชั้นเอก เชื่อมโยง ๓ สุภาษิต การใช้โวหารขั้นสูง และตัวอย่างกระทู้เก็ง'
        },
        {
          id: 'exam',
          name: '๕. รวมเก็งข้อสอบสนามหลวง',
          shortName: 'เก็งข้อสอบ',
          startPage: 46,
          endPage: 50,
          pageCount: 5,
          description: 'เก็งข้อสอบสนามหลวงชั้นเอกครบทุกวิชา พร้อมแนววิเคราะห์เชิงลึกและเทคนิคจำแม่น'
        }
      ];
    }
  }, [book]);

  // Reset states when book changes
  useEffect(() => {
    setActivePageIndex(0);
    setSlideDirection(1);
    setSelectedSubjectId('all');
    setIsSubjectModalOpen(false);
    setIsTocOpen(false);
    setIsQuickJumpOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [book]);

  // Scroll page content to top when turning page
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [activePageIndex]);

  // Keyboard navigation for slide/page turning (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePageIndex, book]);

  if (!book || !book.chapters || book.chapters.length === 0) return null;

  const totalPages = book.chapters.length;
  const currentChapter = book.chapters[activePageIndex] || book.chapters[0];

  const currentChapterFavId = `html_${book.id}_page_${currentChapter.pageNumber}`;
  const [isChapterFavorited, setIsChapterFavorited] = useState<boolean>(() => isFavorite(currentChapterFavId));

  useEffect(() => {
    setIsChapterFavorited(isFavorite(currentChapterFavId));
  }, [currentChapterFavId]);

  const handleToggleChapterFavorite = () => {
    const newState = toggleFavorite({
      id: currentChapterFavId,
      type: 'html_page',
      title: `${book.title} (หน้าที่ ${currentChapter.pageNumber})`,
      subtitle: currentChapter.title,
      category: currentChapter.subject,
      targetId: book.id,
      pageNumber: currentChapter.pageNumber
    });
    setIsChapterFavorited(newState);
  };

  // Identify current subject based on page number
  const currentSubject = subjectGroups.find(
    s => currentChapter.pageNumber >= s.startPage && currentChapter.pageNumber <= s.endPage
  );

  const goToNextPage = () => {
    if (activePageIndex < totalPages - 1) {
      setSlideDirection(1);
      setActivePageIndex(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (activePageIndex > 0) {
      setSlideDirection(-1);
      setActivePageIndex(prev => prev - 1);
    }
  };

  const jumpToPage = (index: number) => {
    if (index < 0 || index >= totalPages) return;
    setSlideDirection(index >= activePageIndex ? 1 : -1);
    setActivePageIndex(index);
    setIsQuickJumpOpen(false);
    setIsTocOpen(false);
    setIsSubjectModalOpen(false);
  };

  const selectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    if (subjectId === 'all') {
      // Keep current page or go to page 1
    } else {
      const group = subjectGroups.find(s => s.id === subjectId);
      if (group) {
        jumpToPage(group.startPage - 1);
      }
    }
    setIsSubjectModalOpen(false);
  };

  // Touch Swipe Gesture for Page-Turning (Mobile First)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartXRef.current;
    const deltaY = endY - touchStartYRef.current;

    // Horizontal swipe threshold > 45px and mostly horizontal
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swipe left -> Next Page
        goToNextPage();
      } else {
        // Swipe right -> Prev Page
        goToPrevPage();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const fontSizes = [
    { label: 'ปกติ', sizeClass: 'text-base leading-relaxed', headingClass: 'text-xl' },
    { label: 'ปานกลาง', sizeClass: 'text-lg leading-relaxed', headingClass: 'text-2xl' },
    { label: 'ใหญ่', sizeClass: 'text-xl leading-loose', headingClass: 'text-2xl' },
    { label: 'ใหญ่พิเศษ', sizeClass: 'text-2xl leading-loose', headingClass: 'text-3xl' }
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${book.title} - ${currentChapter.title}`,
          text: `อ่าน ${book.title} (หน้า ${currentChapter.pageNumber}): ${currentChapter.title}`,
          url: window.location.href
        });
      } catch {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Search matches across all chapters
  const searchResults = searchQuery.trim()
    ? book.chapters.filter(
        ch =>
          ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ch.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ch.contentHtml.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-white text-black flex flex-col animate-fade-in select-text overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Navigation */}
      <header className="w-full bg-white border-b border-gray-200 px-2 sm:px-3 py-2 sm:py-2.5 flex items-center justify-between gap-1 sm:gap-2 shadow-xs z-30 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg active:scale-95 transition-colors shrink-0"
            title="ย้อนกลับ (Back Key)"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1 min-w-0">
              <h1 className="text-xs sm:text-sm font-bold truncate text-black font-maitree">
                {book.title}
              </h1>
              <span className="hidden md:inline-block px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-bold shrink-0">
                สไลด์เปลี่ยนหน้า
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 whitespace-nowrap">
              <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 whitespace-nowrap shrink-0 text-[10px] sm:text-[11px]">
                หน้า {activePageIndex + 1}/{totalPages}
              </span>
              {currentSubject && (
                <span className="truncate text-gray-600 font-medium text-[10px] sm:text-[11px] max-w-[85px] xs:max-w-[130px] sm:max-w-[220px]">
                  {currentSubject.shortName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action icons in header - กระชับบนมือถือ ใช้ไอคอนแทนข้อความ */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Button: Select Subject (เลือกวิชา) - แสดงเฉพาะไอคอนบนมือถือ */}
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
            title="เลือกวิชา แยกวิชาชัดเจน"
          >
            <Layers className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">เลือกวิชา</span>
          </button>

          {/* Font Size Adjuster */}
          <button
            onClick={() => setFontSizeLevel(prev => (prev + 1) % fontSizes.length)}
            className="p-1.5 sm:px-2 sm:py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-0.5 active:scale-95 transition-all"
            title="ปรับขนาดตัวหนังสือ"
          >
            <span className="text-[10px]">ก</span>
            <span className="text-xs font-bold">ก</span>
          </button>

          {/* Favorite / Bookmark Current Page */}
          <button
            onClick={handleToggleChapterFavorite}
            className={`p-1.5 rounded-lg active:scale-95 transition-all ${
              isChapterFavorited
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={isChapterFavorited ? 'บันทึกหน้านี้ในรายการโปรดแล้ว' : 'บันทึกหน้านี้ในรายการโปรด'}
          >
            <Star className={`w-4 h-4 ${isChapterFavorited ? 'fill-amber-500 text-amber-600' : ''}`} />
          </button>

          {/* Quick Jump to Page Modal */}
          <button
            onClick={() => setIsQuickJumpOpen(true)}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg active:scale-95 transition-all"
            title={`เลือกข้ามหน้า ๑ - ${totalPages}`}
          >
            <Bookmark className="w-4 h-4 text-amber-700" />
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 rounded-lg active:scale-95 transition-all ${
              isSearchOpen ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="ค้นหาข้อความในเล่ม"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Table of Contents Drawer */}
          <button
            onClick={() => setIsTocOpen(true)}
            className="p-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg active:scale-95 transition-all"
            title={`สารบัญ ${totalPages} หน้า`}
          >
            <List className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg active:scale-95 transition-all"
            title="แชร์หน้านี้"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Subject Bar: แยกวิชาชัดเจน แตะเลือกวิชาเพื่อเปลี่ยนทันที */}
      <nav className="w-full bg-amber-50/70 border-b border-amber-200/80 px-2 py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <span className="text-[11px] font-bold text-amber-950 px-1 shrink-0 flex items-center gap-1" title="หมวดวิชา">
          <GraduationCap className="w-4 h-4 text-amber-800 shrink-0" />
          <span className="hidden sm:inline">วิชา:</span>
        </span>

        <button
          onClick={() => selectSubject('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
            selectedSubjectId === 'all'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-amber-100/60 border border-amber-200'
          }`}
        >
          <span>ทุกวิชา</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedSubjectId === 'all' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 font-bold'
            }`}
          >
            {totalPages}
          </span>
        </button>

        {subjectGroups.map(subj => {
          const isCurrentActive =
            currentChapter.pageNumber >= subj.startPage &&
            currentChapter.pageNumber <= subj.endPage;

          return (
            <button
              key={subj.id}
              onClick={() => selectSubject(subj.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
                isCurrentActive
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white text-gray-800 hover:bg-amber-100/60 border border-amber-200'
              }`}
            >
              <span>{subj.name}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded-full ${
                  isCurrentActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {subj.pageCount}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Search Input Bar (Expandable) */}
      {isSearchOpen && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 animate-fade-in z-20 shrink-0">
          <Search className="w-4 h-4 text-amber-700 shrink-0" />
          <input
            type="text"
            placeholder="พิมพ์คำที่ต้องการค้นหา เช่น พุทธประวัติ, อริยสัจ ๔, สังฆกรรม..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-white text-xs px-3 py-1.5 rounded-lg border border-amber-300 outline-none text-black placeholder:text-gray-400"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-gray-500 hover:text-black p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Search Results Dropdown/Banner */}
      {searchQuery && (
        <div className="bg-amber-100/80 px-3 py-2 border-b border-amber-200 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span>
            พบผลลัพธ์ "{searchQuery}" ใน {searchResults.length} หน้า
          </span>
          <div className="flex items-center gap-1 overflow-x-auto max-w-full">
            {searchResults.slice(0, 10).map(item => (
              <button
                key={item.pageNumber}
                onClick={() => jumpToPage(item.pageNumber - 1)}
                className="px-2 py-0.5 bg-white text-amber-900 rounded font-semibold border border-amber-300 hover:bg-amber-50 text-[11px]"
              >
                หน้า {item.pageNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Single Page Stage with Smooth Slide Animation (แนวสไลด์เปลี่ยนหน้า หรือ ถัดไป-ย้อนกลับ) */}
      <main className="flex-1 w-full relative overflow-hidden bg-white flex flex-col">
        {/* Subtle Floating Side Arrows for Desktop / Tablet */}
        {activePageIndex > 0 && (
          <button
            onClick={goToPrevPage}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-amber-50 border border-gray-300 shadow-md items-center justify-center text-gray-700 hover:text-black active:scale-95 transition-all"
            title="หน้าก่อนหน้า (หรือสไลด์ไปทางขวา)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {activePageIndex < totalPages - 1 && (
          <button
            onClick={goToNextPage}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-amber-50 border border-gray-300 shadow-md items-center justify-center text-gray-700 hover:text-black active:scale-95 transition-all"
            title="หน้าถัดไป (หรือสไลด์ไปทางซ้าย)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Container for the Single Active Page */}
        <div
          ref={contentScrollRef}
          className="flex-1 w-full h-full overflow-y-auto px-4 py-4 sm:px-8 sm:py-6"
          style={{
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="max-w-3xl mx-auto w-full">
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.article
                key={currentChapter.pageNumber}
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -slideDirection * 40 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="w-full pb-10"
              >
                {/* Page Header Card */}
                <div className="mb-5 pb-4 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-bold text-xs">
                        หน้า {currentChapter.pageNumber} / {totalPages}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 font-semibold text-xs border border-gray-200">
                        {currentChapter.subject}
                      </span>
                    </div>

                    <span className="text-[11px] text-gray-500 font-mono">
                      สไลด์ซ้าย-ขวาเพื่อเปลี่ยนหน้า
                    </span>
                  </div>

                  <h2
                    className={`font-maitree font-bold text-black leading-snug ${fontSizes[fontSizeLevel].headingClass}`}
                  >
                    {currentChapter.title}
                  </h2>
                </div>

                {/* Rendered HTML Body - Pure White Background & Sharp Black Text */}
                <div
                  className={`dhamma-book-content text-black leading-relaxed font-normal ${fontSizes[fontSizeLevel].sizeClass}`}
                  dangerouslySetInnerHTML={{ __html: currentChapter.contentHtml }}
                />

                {/* In-Page Navigation Bar at the bottom of the page content */}
                <div className="mt-10 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/90 p-4 rounded-2xl border border-gray-200/80">
                  <button
                    onClick={goToPrevPage}
                    disabled={activePageIndex === 0}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      activePageIndex === 0
                        ? 'opacity-40 bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white hover:bg-amber-50 text-gray-800 border border-gray-300 shadow-xs active:scale-95'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>
                      {activePageIndex === 0 ? 'หน้าแรก' : 'ย้อนกลับ'}
                    </span>
                    {activePageIndex > 0 && (
                      <span className="hidden sm:inline text-[10px] opacity-75">
                        (หน้า {activePageIndex})
                      </span>
                    )}
                  </button>

                  <div className="text-center text-xs text-gray-600 whitespace-nowrap">
                    <span className="font-bold text-amber-900">
                      หน้า {currentChapter.pageNumber}
                    </span>{' '}
                    / {totalPages} หน้า
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={activePageIndex === totalPages - 1}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      activePageIndex === totalPages - 1
                        ? 'opacity-40 bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-amber-800 hover:bg-amber-900 text-white shadow-xs active:scale-95'
                    }`}
                  >
                    <span>
                      {activePageIndex === totalPages - 1 ? 'หน้าสุดท้าย' : 'ถัดไป'}
                    </span>
                    {activePageIndex < totalPages - 1 && (
                      <span className="hidden sm:inline text-[10px] opacity-75">
                        (หน้า {activePageIndex + 2})
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Page Controller: Clear Previous / Next Buttons */}
      <footer className="w-full bg-white border-t border-gray-200 px-3 py-2.5 flex items-center justify-between gap-2 shadow-lg z-30 shrink-0">
        {/* Previous Page Button */}
        <button
          onClick={goToPrevPage}
          disabled={activePageIndex === 0}
          className={`flex-1 sm:flex-initial sm:min-w-[130px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            activePageIndex === 0
              ? 'opacity-35 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-amber-100 text-gray-900 border border-gray-300 active:scale-95'
          }`}
          title="ย้อนกลับหน้าก่อนหน้า (หรือสไลด์ไปทางขวา)"
        >
          <ChevronLeft className="w-4 h-4 text-amber-800 shrink-0" />
          <span>ย้อนกลับ</span>
        </button>

        {/* Center Page Quick Indicator / Jump */}
        <button
          onClick={() => setIsQuickJumpOpen(true)}
          className="px-2 py-1 rounded-lg hover:bg-amber-50 text-center transition-colors shrink-0"
          title="แตะเพื่อเลือกหน้า (๑ - ๕๐)"
        >
          <div className="font-bold text-xs sm:text-sm text-black font-maitree flex items-center justify-center gap-1">
            <span>หน้า {activePageIndex + 1}</span>
            <span className="text-gray-400">/</span>
            <span>{totalPages}</span>
          </div>
          <div className="text-[10px] text-amber-800 font-medium truncate max-w-[140px] sm:max-w-[200px]">
            {currentSubject?.shortName || currentChapter.subject}
          </div>
        </button>

        {/* Next Page Button */}
        <button
          onClick={goToNextPage}
          disabled={activePageIndex === totalPages - 1}
          className={`flex-1 sm:flex-initial sm:min-w-[130px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            activePageIndex === totalPages - 1
              ? 'opacity-35 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-amber-800 hover:bg-amber-900 text-white shadow-xs active:scale-95'
          }`}
          title="ถัดไปหน้าต่อไป (หรือสไลด์ไปทางซ้าย)"
        >
          <span>ถัดไป</span>
          <ChevronRight className="w-4 h-4 text-white shrink-0" />
        </button>
      </footer>

      {/* Modal: เลือกวิชา แยกวิชาชัดเจน (Subject Selection Drawer/Modal) */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-black font-maitree text-base sm:text-lg">
                    เลือกวิชา • {book.title}
                  </h3>
                  <p className="text-xs text-gray-500">แยกวิชาชัดเจนตามหลักสูตรแม่กองธรรมสนามหลวง</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 py-3">
              แตะเลือกวิชาที่ต้องการศึกษา เพื่อเปิดหน้าแรกของวิชานั้นทันที:
            </p>

            {/* Subject Cards Grid */}
            <div className="space-y-2.5 overflow-y-auto p-1 flex-1">
              <button
                onClick={() => selectSubject('all')}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  selectedSubjectId === 'all'
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-black font-maitree flex items-center gap-2">
                    <span>📚 รวมทุกวิชาทั้งหมด</span>
                    <span className="text-xs px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-sans font-semibold">
                      ๕๐ หน้า
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    อ่านเนื้อหาครบถ้วนตามลำดับหน้า ๑ ถึงหน้า ๕๐
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>

              {subjectGroups.map((subj, sIdx) => {
                const isSelected =
                  currentChapter.pageNumber >= subj.startPage &&
                  currentChapter.pageNumber <= subj.endPage;

                return (
                  <button
                    key={subj.id}
                    onClick={() => selectSubject(subj.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-400 shadow-xs ring-2 ring-amber-600/20'
                        : 'bg-white hover:bg-amber-50/40 border-gray-200'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-black font-maitree">
                          {subj.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed pl-7">
                        {subj.description}
                      </p>
                      <div className="pl-7 pt-1 flex items-center gap-2 text-[11px]">
                        <span className="font-semibold text-amber-800 bg-amber-100/60 px-2 py-0.2 rounded">
                          หน้า {subj.startPage} - {subj.endPage}
                        </span>
                        <span className="text-gray-500 font-medium">
                          ({subj.pageCount} หน้า)
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 mt-2 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Jump to Page 1-50 */}
      {isQuickJumpOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-xl border border-gray-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-gray-900 font-maitree text-base">
                  เลือกไปยังหน้า (๑ - {totalPages})
                </h3>
              </div>
              <button
                onClick={() => setIsQuickJumpOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 py-2">
              แตะหมายเลขหน้าที่ต้องการสไลด์เปิดอ่านทันที:
            </p>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 overflow-y-auto p-1 max-h-72">
              {book.chapters.map((ch, idx) => (
                <button
                  key={ch.pageNumber}
                  onClick={() => jumpToPage(idx)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                    activePageIndex === idx
                      ? 'bg-amber-800 text-white shadow-xs scale-105'
                      : 'bg-gray-100 hover:bg-amber-100 text-gray-800'
                  }`}
                >
                  <span>{ch.pageNumber}</span>
                </button>
              ))}
            </div>

            <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-amber-800 font-medium">
                หน้าปัจจุบัน: {activePageIndex + 1} / {totalPages}
              </span>
              <button
                onClick={() => setIsQuickJumpOpen(false)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Table of Contents (สารบัญ ๕๐ หน้า) */}
      {isTocOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900 font-maitree text-base">
                  สารบัญบทสรุปวิชา ({totalPages} หน้า)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{book.title}</p>
              </div>
              <button
                onClick={() => setIsTocOpen(false)}
                className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-gray-100">
              {book.chapters.map((ch, idx) => (
                <button
                  key={ch.pageNumber}
                  onClick={() => jumpToPage(idx)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                    activePageIndex === idx
                      ? 'bg-amber-50 text-amber-950 font-semibold border-l-4 border-amber-800'
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      activePageIndex === idx
                        ? 'bg-amber-800 text-white font-bold'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {ch.pageNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-amber-800 font-medium">
                      {ch.subject}
                    </div>
                    <div className="text-xs font-maitree leading-snug line-clamp-2">
                      {ch.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
