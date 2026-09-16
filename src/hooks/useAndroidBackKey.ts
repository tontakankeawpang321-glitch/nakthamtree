import { useEffect, useRef } from 'react';
import { NavTab } from '../types';

interface AndroidBackKeyParams {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isReaderOpen: boolean;
  setIsReaderOpen: (open: boolean) => void;
  isHtmlReaderOpen?: boolean;
  setIsHtmlReaderOpen?: (open: boolean) => void;
  isFavoritesOpen?: boolean;
  setIsFavoritesOpen?: (open: boolean) => void;
  isDidYouKnowOpen?: boolean;
  setIsDidYouKnowOpen?: (open: boolean) => void;
  isCreatePostOpen?: boolean;
  setIsCreatePostOpen?: (open: boolean) => void;
}

declare global {
  interface Window {
    handleAndroidBackKey?: () => boolean;
    onBackPressed?: () => boolean;
  }
}

export function useAndroidBackKey({
  currentTab,
  setCurrentTab,
  isChatOpen,
  setIsChatOpen,
  isSidebarOpen,
  setIsSidebarOpen,
  isReaderOpen,
  setIsReaderOpen,
  isHtmlReaderOpen,
  setIsHtmlReaderOpen,
  isFavoritesOpen,
  setIsFavoritesOpen,
  isDidYouKnowOpen,
  setIsDidYouKnowOpen,
  isCreatePostOpen,
  setIsCreatePostOpen
}: AndroidBackKeyParams) {
  const lastBackPressRef = useRef<number>(0);

  // Maintain refs for access inside the event listener without recreating it constantly
  const stateRef = useRef({
    currentTab,
    isChatOpen,
    isSidebarOpen,
    isReaderOpen,
    isHtmlReaderOpen,
    isFavoritesOpen,
    isDidYouKnowOpen,
    isCreatePostOpen
  });

  stateRef.current = {
    currentTab,
    isChatOpen,
    isSidebarOpen,
    isReaderOpen,
    isHtmlReaderOpen,
    isFavoritesOpen,
    isDidYouKnowOpen,
    isCreatePostOpen
  };

  useEffect(() => {
    const handleBack = (): boolean => {
      const {
        currentTab,
        isChatOpen,
        isSidebarOpen,
        isReaderOpen,
        isHtmlReaderOpen,
        isFavoritesOpen,
        isDidYouKnowOpen,
        isCreatePostOpen
      } = stateRef.current;

      // Priority 0: Close Did You Know Popup if open
      if (isDidYouKnowOpen && setIsDidYouKnowOpen) {
        setIsDidYouKnowOpen(false);
        return true;
      }

      // Priority 0.5: Close Favorites modal if open
      if (isFavoritesOpen && setIsFavoritesOpen) {
        setIsFavoritesOpen(false);
        return true;
      }

      // Priority 1: Close HTML book reader if open
      if (isHtmlReaderOpen && setIsHtmlReaderOpen) {
        setIsHtmlReaderOpen(false);
        return true;
      }

      // Priority 2: Close document/PDF reader if open
      if (isReaderOpen) {
        setIsReaderOpen(false);
        return true;
      }

      // Priority 3: Close AI Chat window if open
      if (isChatOpen) {
        setIsChatOpen(false);
        return true;
      }

      // Priority 4: Close Create Post dialog if open
      if (isCreatePostOpen && setIsCreatePostOpen) {
        setIsCreatePostOpen(false);
        return true;
      }

      // Priority 5: Close Sidebar if open
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        return true;
      }

      // Priority 6: If on another tab, navigate back to 'home'
      if (currentTab !== 'home') {
        setCurrentTab('home');
        return true;
      }

      // Priority 6: Already on Home - Double tap to exit check
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        // Allow app exit
        return false;
      } else {
        lastBackPressRef.current = now;
        // Show gentle toast for Android WebView users
        const toast = document.createElement('div');
        toast.textContent = 'กดปุ่มย้อนกลับอีกครั้งเพื่อออกจากแอพ';
        toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg z-[9999] pointer-events-none transition-opacity duration-300';
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }, 1800);
        return true;
      }
    };

    // Expose globally for Android Studio WebView JavascriptInterface
    window.handleAndroidBackKey = handleBack;
    window.onBackPressed = handleBack;

    // Listen to browser popstate (when user presses back button in WebView that has history)
    const onPopState = () => {
      handleBack();
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
      delete window.handleAndroidBackKey;
      delete window.onBackPressed;
    };
  }, [setCurrentTab, setIsChatOpen, setIsSidebarOpen, setIsReaderOpen, setIsCreatePostOpen]);
}
