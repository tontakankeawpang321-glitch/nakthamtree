import React from 'react';
import { ExternalLink, BookOpen, Quote, Sparkles, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { NavTab } from '../types';

interface HomeTabProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenChat: () => void;
  onOpenHtmlBook: (bookId: 'naktham-tee' | 'naktham-tho' | 'naktham-ek') => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onNavigateTab,
  onOpenChat,
  onOpenHtmlBook
}) => {
  // Original 5 course & exam cards (preserved exactly as requested)
  const courseCards = [
    {
      id: 'tee',
      title: 'นักธรรมตรี',
      desc: 'หลักสูตรพื้นฐาน',
      url: 'https://sites.google.com/view/nakthamtee/%E0%B8%AB%E0%B8%99%E0%B8%B2%E0%B9%81%E0%B8%A3%E0%B8%81/%E0%B8%99%E0%B8%81%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%95%E0%B8%A3',
      svgPath: 'M12,2C12,2 6,8 6,13C6,16.31 8.69,19 12,19C15.31,19 18,16.31 18,13C18,8 12,2 12,2M12,22C9.5,22 8,20.5 8,20.5L12,18L16,20.5C16,20.5 14.5,22 12,22Z',
      badge: 'ชั้นต้น'
    },
    {
      id: 'tho',
      title: 'นักธรรมโท',
      desc: 'หลักสูตรชั้นกลาง',
      url: 'https://sites.google.com/view/nakthamtee/%E0%B8%AB%E0%B8%99%E0%B8%B2%E0%B9%81%E0%B8%A3%E0%B8%81/%E0%B8%99%E0%B8%81%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1-%E0%B9%82%E0%B8%97',
      svgPath: 'M11,6V9L13.5,7.5L11,6M13,9V6L15.5,7.5L13,9M7,12C7,9.24 9.24,7 12,7C14.76,7 17,9.24 17,12C17,14.76 14.76,17 12,17C9.24,17 7,14.76 7,12M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z',
      badge: 'ชั้นกลาง'
    },
    {
      id: 'ek',
      title: 'นักธรรมเอก',
      desc: 'หลักสูตรชั้นสูง',
      url: 'https://sites.google.com/view/nakthamtee/%E0%B8%AB%E0%B8%99%E0%B8%B2%E0%B9%81%E0%B8%A3%E0%B8%81/%E0%B8%99%E0%B8%81%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B9%80%E0%B8%AD%E0%B8%81',
      svgPath: 'M12,2L5,14H19L12,2M12,5.27L16.27,12.5H7.73L12,5.27M6,15V17H18V15H6M4,18V20H20V18H4Z',
      badge: 'ชั้นสูง'
    },
    {
      id: 'old_exams',
      title: 'ข้อสอบเก่า',
      desc: 'คลังความรู้',
      url: 'https://sites.google.com/view/nakthamtee/%E0%B8%AB%E0%B8%99%E0%B8%B2%E0%B9%81%E0%B8%A3%E0%B8%81/%E0%B8%82%E0%B8%AD%E0%B8%AA%E0%B8%AD%E0%B8%9A%E0%B8%A2%E0%B8%AD%E0%B8%99%E0%B8%AB%E0%B8%A5%E0%B8%87',
      svgPath: 'M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.5 6.5,20.5C8.45,20.5 10.55,20.9 12,22C13.35,21.15 15.8,20.5 17.5,20.5C19.15,20.5 20.85,20.81 22.25,21.56C22.35,21.61 22.4,21.59 22.5,21.59C22.75,21.59 23,21.34 23,21.09V6.5C22.4,5.9 21.5,5.4 20.5,5C19,4.5 17.5,4.5 16,5C14.8,5.4 13.55,5.9 12.5,6.5L12,6.5L11.5,6.5C10.45,5.9 9.2,5.4 8,5C7.5,4.8 7,4.8 6.5,5Z',
      badge: 'ย้อนหลัง'
    },
    {
      id: 'quiz_100',
      title: 'ทดสอบ 100 ข้อ',
      desc: 'วัดผลปัญญา',
      url: 'https://sites.google.com/view/nakthamtee/%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B8%97%E0%B8%94%E0%B8%AA%E0%B8%AD%E0%B8%9A-100-%E0%B8%82%E0%B8%AD?authuser=0',
      svgPath: 'M12,2A2,2 0 0,1 14,4C14,5.1 13.1,6 12,6A2,2 0 0,1 10,4C10,2.9 10.9,2 12,2M10,8H14C15.1,8 16,8.9 16,10V20C16,21.1 15.1,22 14,22H10C8.9,22 8,21.1 8,20V10C8,8.9 8.9,8 10,8M10,10V20H14V10H10Z',
      badge: 'ประเมินตน'
    }
  ];

  // 3 HTML Books: ปรับเป็น ข้อความ จากหนังสือเป็นบทสรุปวิชา เพิ่มข้อมูลอีก อย่างละ 50 หน้า มีปุ่ม ถัดไป ย้อนกลับ ชัดเจน
  const htmlBooks = [
    {
      id: 'naktham-tee' as const,
      title: 'บทสรุปวิชา นักธรรมตรี',
      desc: 'รวมครบทุกวิชา ๕๐ หน้า',
      badge: 'บทสรุป ๕๐ หน้า',
      level: 'ชั้นต้น',
      accentColor: 'from-amber-600 to-amber-700'
    },
    {
      id: 'naktham-tho' as const,
      title: 'บทสรุปวิชา นักธรรมโท',
      desc: 'รวมครบทุกวิชา ๕๐ หน้า',
      badge: 'บทสรุป ๕๐ หน้า',
      level: 'ชั้นกลาง',
      accentColor: 'from-orange-600 to-amber-700'
    },
    {
      id: 'naktham-ek' as const,
      title: 'บทสรุปวิชา นักธรรมเอก',
      desc: 'รวมครบทุกวิชา ๕๐ หน้า',
      badge: 'บทสรุป ๕๐ หน้า',
      level: 'ชั้นสูง',
      accentColor: 'from-rose-700 to-amber-800'
    }
  ];

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Banner / Welcome card */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600 text-white p-4.5 shadow-md shadow-amber-900/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15 pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-36 h-36 fill-white">
            <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6C8.69,6 6,8.69 6,12C6,15.31 8.69,18 12,18C15.31,18 18,15.31 18,12C18,8.69 15.31,6 12,6M12,8C14.21,8 16,9.79 16,12C16,14.21 14.21,16 12,16C9.79,16 8,14.21 8,12C8,9.79 9.79,8 12,8Z"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-medium backdrop-blur-xs mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>หลักสูตรแม่กองธรรมสนามหลวง</span>
          </div>
          <h2 className="font-maitree text-xl font-bold leading-tight">
            ปัญญาบารมี ธรรมศึกษา
          </h2>
          <p className="text-xs text-amber-100 mt-1 max-w-[90%] font-light leading-relaxed">
            แหล่งรวมเนื้อหาบทเรียน ข้อสอบเก่า พุทธศาสนสุภาษิต และหนังสือรวมวิชาแบบ HTML
          </p>

          <div className="flex flex-wrap gap-2 mt-3.5">
            <button
              onClick={() => onNavigateTab('books')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-amber-900 text-xs font-semibold shadow-xs hover:bg-amber-50 active:scale-95 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>คลังหนังสือ Google Drive</span>
            </button>
            <button
              onClick={() => onNavigateTab('proverbs')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900/40 border border-white/20 text-white text-xs font-semibold hover:bg-amber-900/60 active:scale-95 transition-all"
            >
              <Quote className="w-3.5 h-3.5 text-amber-300" />
              <span>พุทธศาสนสุภาษิต</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Main Courses (Original external links preserved exactly) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="font-maitree text-sm font-bold text-amber-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            บทเรียนและแบบทดสอบภายนอก
          </h3>
          <span className="text-[11px] text-gray-500">แตะเพื่อเปิดลิงก์เดิม</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {courseCards.map((card) => (
            <a
              key={card.id}
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center text-center bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-amber-200/50 hover:border-amber-400 hover:shadow-md active:scale-97 transition-all duration-200"
            >
              <span className="absolute top-2.5 right-2.5 text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-100">
                {card.badge}
              </span>

              {/* Icon */}
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-800 flex items-center justify-center mb-2.5 shadow-inner border border-amber-200/40 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-amber-600 group-hover:to-amber-500 group-hover:text-white transition-all duration-300">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                  <path d={card.svgPath} />
                </svg>
              </div>

              {/* Title & Desc */}
              <div className="w-full flex flex-col items-center">
                <span className="font-maitree text-[15px] sm:text-base font-bold text-gray-900 group-hover:text-amber-800 transition-colors flex items-center gap-1">
                  {card.title}
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-amber-600 transition-colors" />
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 font-light">
                  {card.desc}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/*
        EXPLICIT USER REQUIREMENT:
        "เพิ่มอีก 3 เมนู แบบ html เป็นหนังสือ นักธรรมตรี นักธรรมโท นักธรรมเอก ต่อจาก ทดสอบ 100 ข้อ
         ที่รวมวิชาทุกวิชา ไว้ ให้อ่านแบบ พื้นหลังขาว ตัวหนังสือดำ ลื่นยาวลงมาอ่าน มีประมาณ 10 หน้า"
      */}
      <div className="mt-1">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="font-maitree text-sm font-bold text-amber-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>บทสรุปวิชา (เลือกวิชาแยกชัดเจน • สไลด์เปลี่ยนหน้า)</span>
          </h3>
          <span className="text-[11px] text-emerald-800 font-medium">ถัดไป-ย้อนกลับ ๕๐ หน้า</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {htmlBooks.map((hb) => (
            <button
              key={hb.id}
              onClick={() => onOpenHtmlBook(hb.id)}
              className="group relative flex flex-col text-left bg-white rounded-2xl p-4 sm:p-4.5 shadow-xs border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-md active:scale-97 transition-all duration-200"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${hb.accentColor} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {hb.badge}
                </span>
              </div>

              <h4 className="font-maitree text-base font-bold text-black group-hover:text-emerald-900 transition-colors">
                {hb.title}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 font-light">
                {hb.desc}
              </p>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-emerald-700 font-semibold w-full">
                <span>แตะเพื่อเปิดอ่าน</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards to other features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
        <button
          onClick={() => onNavigateTab('proverbs')}
          className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50/50 p-3.5 rounded-2xl border border-amber-200/60 hover:border-amber-300 text-left active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Quote className="w-5 h-5" />
            </div>
            <div>
              <div className="font-maitree font-bold text-sm text-amber-950">
                พุทธศาสนสุภาษิต
              </div>
              <div className="text-[11px] text-gray-600">
                คลังบทบาลี คำแปล พร้อมคำอธิบาย
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-700" />
        </button>

        <button
          onClick={() => onNavigateTab('books')}
          className="flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-amber-50/40 p-3.5 rounded-2xl border border-emerald-200/60 hover:border-emerald-300 text-left active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-maitree font-bold text-sm text-emerald-950">
                คลังหนังสือ Google Drive
              </div>
              <div className="text-[11px] text-gray-600">
                แปลง DOCX/PDF เปิดด้วย WebView ทันที
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-700" />
        </button>
      </div>
    </div>
  );
};
