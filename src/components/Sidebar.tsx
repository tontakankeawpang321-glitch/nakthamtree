import React from 'react';
import { Home, Users, Quote, BookOpen, Bot, X, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenChat
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-[290px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600 text-white p-5 flex flex-col gap-3 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6C8.69,6 6,8.69 6,12C6,15.31 8.69,18 12,18C15.31,18 18,15.31 18,12C18,8.69 15.31,6 12,6M12,8C14.21,8 16,9.79 16,12C16,14.21 14.21,16 12,16C9.79,16 8,14.21 8,12C8,9.79 9.79,8 12,8Z"/>
            </svg>
          </div>

          <div>
            <h2 className="font-maitree text-lg font-bold">นักธรรม ชุมชนธรรมะ</h2>
            <p className="text-xs text-amber-100/90 font-light">
              ศูนย์รวมการศึกษาพระปริยัติธรรมแผนกธรรม
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
          <button
            onClick={() => {
              onSelectTab('home');
              onClose();
            }}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-maitree text-sm font-semibold transition-all ${
              currentTab === 'home'
                ? 'bg-amber-100/80 text-amber-900 shadow-xs'
                : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            <Home className="w-5 h-5 text-amber-700" />
            <div className="text-left">
              <div>หน้าแรก (บทเรียน)</div>
              <div className="text-[11px] text-gray-500 font-sans font-normal">หลักสูตร ตรี-โท-เอก และแบบทดสอบ</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('community');
              onClose();
            }}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-maitree text-sm font-semibold transition-all ${
              currentTab === 'community'
                ? 'bg-amber-100/80 text-amber-900 shadow-xs'
                : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            <Users className="w-5 h-5 text-amber-700" />
            <div className="text-left">
              <div>ชุมชนสนทนาธรรม</div>
              <div className="text-[11px] text-gray-500 font-sans font-normal">ถาม-ตอบข้อธรรมะและแลกเปลี่ยนความรู้</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('proverbs');
              onClose();
            }}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-maitree text-sm font-semibold transition-all ${
              currentTab === 'proverbs'
                ? 'bg-amber-100/80 text-amber-900 shadow-xs'
                : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            <Quote className="w-5 h-5 text-amber-700" />
            <div className="text-left">
              <div>พุทธศาสนสุภาษิต</div>
              <div className="text-[11px] text-gray-500 font-sans font-normal">คลังพุทธศาสนสุภาษิตพร้อมคำแปล</div>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('books');
              onClose();
            }}
            className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-maitree text-sm font-semibold transition-all ${
              currentTab === 'books'
                ? 'bg-amber-100/80 text-amber-900 shadow-xs'
                : 'text-gray-700 hover:bg-amber-50'
            }`}
          >
            <BookOpen className="w-5 h-5 text-amber-700" />
            <div className="text-left">
              <div>คลังหนังสือ Google Drive</div>
              <div className="text-[11px] text-gray-500 font-sans font-normal">อ่าน PDF/DOCX พอดีจอ ซูมอิสระ</div>
            </div>
          </button>

          <div className="my-2 border-t border-gray-100" />

          {/* AI Dhamma Chat trigger */}
          <button
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-maitree text-sm font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 border border-indigo-100/70 hover:from-indigo-100 hover:to-purple-100 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span>ถาม AI ปัญหาธรรมะ</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-[11px] text-indigo-700/80 font-sans font-normal">ระบบ AI อัจฉริยะ ตอบคำถามธรรมะ</div>
            </div>
          </button>

          {/* External Links */}
          <a
            href="https://www.facebook.com/p/%E0%B8%AA%E0%B8%B3%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B9%81%E0%B8%A1%E0%B9%88%E0%B8%81%E0%B8%AD%E0%B8%87%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%AA%E0%B8%99%E0%B8%B2%E0%B8%A1%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B8%87-Royal-Dhamma-Studies-Office-61568725258865/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition-colors mt-2"
          >
            <span className="flex items-center gap-2 font-medium">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1877F2]">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              เพจแม่กองธรรมสนามหลวง
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-amber-50/70 border-t border-amber-100 text-center text-[11px] text-amber-900/80">
          <div className="flex items-center justify-center gap-1 font-semibold mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>รองรับ Android WebView & Back Key</span>
          </div>
          <div className="text-gray-500 font-light">เวอร์ชันใหม่ ประสิทธิภาพสูง เสถียร รวดเร็ว</div>
        </div>
      </aside>
    </>
  );
};
