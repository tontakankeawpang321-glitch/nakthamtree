import React from 'react';
import { Home, Users, Quote, BookOpen } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'หน้าแรก',
      icon: Home,
      desc: 'บทเรียน'
    },
    {
      id: 'community' as NavTab,
      label: 'ชุมชน',
      icon: Users,
      desc: 'สนทนาธรรม'
    },
    {
      id: 'proverbs' as NavTab,
      label: 'สุภาษิต',
      icon: Quote,
      desc: 'พุทธศาสน์'
    },
    {
      id: 'books' as NavTab,
      label: 'หนังสือ',
      icon: BookOpen,
      desc: 'คลังหนังสือ'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full h-[66px] bg-white/95 backdrop-blur-md border-t border-amber-100 shadow-[0_-4px_20px_rgba(133,77,14,0.06)] z-40 flex items-center justify-around px-1 pb-safe">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            id={`nav-btn-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 h-full flex flex-col items-center justify-center relative py-1 transition-all duration-200 select-none ${
              isActive
                ? 'text-amber-800'
                : 'text-gray-400 hover:text-amber-700 active:scale-95'
            }`}
          >
            {/* Active pill background */}
            {isActive && (
              <span className="absolute top-1.5 w-12 h-8 bg-amber-100/90 rounded-2xl -z-10 animate-fade-in" />
            )}

            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
              {tab.id === 'books' && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
              )}
            </div>

            <span
              className={`font-maitree text-[11px] leading-tight mt-0.5 tracking-tight ${
                isActive ? 'font-bold text-amber-900' : 'font-medium'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
