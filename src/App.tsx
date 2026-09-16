import React, { useState, useEffect } from 'react';
import { NavTab, Book } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { CommunityTab } from './components/CommunityTab';
import { ProverbsTab } from './components/ProverbsTab';
import { BooksTab } from './components/BooksTab';
import { BookViewerModal } from './components/BookViewerModal';
import { HtmlBookReaderModal } from './components/HtmlBookReaderModal';
import { AIChatModal } from './components/AIChatModal';
import { DidYouKnowModal } from './components/DidYouKnowModal';
import { FavoritesModal } from './components/FavoritesModal';
import { useAndroidBackKey } from './hooks/useAndroidBackKey';
import { HTML_BOOKS, HtmlBook } from './data/htmlBooksData';
import { DEFAULT_BOOKS, getCachedBooks } from './data/booksData';
import { FavoriteItem } from './services/favoritesService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [activeHtmlBook, setActiveHtmlBook] = useState<HtmlBook | null>(null);
  const [htmlReaderInitialPage, setHtmlReaderInitialPage] = useState<number>(0);

  // Favorites Modal state
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);

  // "รู้หรือไม่?" Popup Modal: Shows on first app launch / mount automatically with randomized topic from 1,000 facts
  const [isDidYouKnowOpen, setIsDidYouKnowOpen] = useState<boolean>(() => {
    // Show automatically on entering the app
    return true;
  });

  // Hook for Android Studio WebView hardware Back Key management
  useAndroidBackKey({
    currentTab,
    setCurrentTab,
    isChatOpen,
    setIsChatOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isReaderOpen: activeBook !== null,
    setIsReaderOpen: (open: boolean) => {
      if (!open) setActiveBook(null);
    },
    isHtmlReaderOpen: activeHtmlBook !== null,
    setIsHtmlReaderOpen: (open: boolean) => {
      if (!open) setActiveHtmlBook(null);
    },
    isFavoritesOpen,
    setIsFavoritesOpen,
    isDidYouKnowOpen,
    setIsDidYouKnowOpen
  });

  const handleOpenFavoriteItem = (item: FavoriteItem) => {
    if (item.type === 'book') {
      const allBooks = [...getCachedBooks(), ...DEFAULT_BOOKS];
      const book = allBooks.find(b => b.id === item.targetId || b.id === item.id);
      if (book) {
        setActiveBook(book);
      }
    } else if (item.type === 'html_page' && item.bookId) {
      const b = HTML_BOOKS[item.bookId];
      if (b) {
        const pageIdx = Math.max(0, (item.pageNumber || 1) - 1);
        setHtmlReaderInitialPage(pageIdx);
        setActiveHtmlBook(b);
      }
    }
  };

  return (
    <div className="min-h-screen dhamma-pattern flex flex-col items-center pb-24 selection:bg-amber-200">
      {/* Top Header: Removed "ออนไลน์", Added "รายการโปรด" and "รู้หรือไม่" buttons */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        currentTab={currentTab}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenDidYouKnow={() => setIsDidYouKnowOpen(true)}
      />

      {/* Navigation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Container */}
      <main className="w-full max-w-xl px-3.5 py-4 flex flex-col gap-4">
        {currentTab === 'home' && (
          <HomeTab
            onNavigateTab={tab => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenHtmlBook={bookId => {
              setHtmlReaderInitialPage(0);
              setActiveHtmlBook(HTML_BOOKS[bookId] || null);
            }}
          />
        )}

        {currentTab === 'community' && <CommunityTab />}

        {currentTab === 'proverbs' && <ProverbsTab />}

        {currentTab === 'books' && (
          <BooksTab
            onOpenBook={book => setActiveBook(book)}
            onOpenHtmlBook={bookId => {
              setHtmlReaderInitialPage(0);
              setActiveHtmlBook(HTML_BOOKS[bookId] || null);
            }}
          />
        )}
      </main>

      {/* Converted DOCX/PDF In-App WebView Document Reader with Free Pinch-to-zoom (No zoom buttons) */}
      {activeBook && (
        <BookViewerModal
          book={activeBook}
          onClose={() => setActiveBook(null)}
        />
      )}

      {/* HTML All-in-One Book Reader with Dynamic Subject Selection & Slide Navigation */}
      {activeHtmlBook && (
        <HtmlBookReaderModal
          book={activeHtmlBook}
          initialPageIndex={htmlReaderInitialPage}
          onClose={() => setActiveHtmlBook(null)}
        />
      )}

      {/* Favorites Modal (บันทึกลง LocalStorage ในเครื่อง) */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onOpenItem={handleOpenFavoriteItem}
      />

      {/* "รู้หรือไม่?" Popup Modal: สุ่มเกร็ดความรู้นักธรรม 1,000 เรื่อง */}
      <DidYouKnowModal
        isOpen={isDidYouKnowOpen}
        onClose={() => setIsDidYouKnowOpen(false)}
        onOpenHtmlBook={(bookId, page) => {
          const b = HTML_BOOKS[bookId];
          if (b) {
            setHtmlReaderInitialPage(Math.max(0, page - 1));
            setActiveHtmlBook(b);
          }
        }}
      />

      {/*
        AI Chatbot Window & Floating Button:
        Hidden when on the 'books' tab, or when reading any book/modal!
      */}
      <AIChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpen={() => setIsChatOpen(true)}
        isHidden={
          currentTab === 'books' ||
          activeBook !== null ||
          activeHtmlBook !== null ||
          isFavoritesOpen ||
          isDidYouKnowOpen
        }
      />

      {/* 4 Bottom Navigation Buttons */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
