import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Download,
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';
import { Book } from '../types';

interface BookViewerModalProps {
  book: Book | null;
  onClose: () => void;
}

export const BookViewerModal: React.FC<BookViewerModalProps> = ({ book, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    // Reset zoom state on book change
    setZoomScale(1);
  }, [book]);

  if (!book) return null;

  // Touch gesture listeners for smooth free pinch-to-zoom and double-tap on mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      initialScaleRef.current = zoomScale;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double-tap toggles between 100% (fit to screen) and 150% zoom
        setZoomScale(prev => (prev > 1.1 ? 1 : 1.5));
      }
      lastTapRef.current = now;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / touchStartDistRef.current;
      const newScale = Math.min(Math.max(initialScaleRef.current * factor, 0.8), 3.5);
      setZoomScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `อ่านหนังสือ ${book.title} (${book.format.toUpperCase()})`,
          url: book.driveUrl
        });
      } catch {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(book.driveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Extract ID from Drive / Docs URLs for preview embedding
  const getEmbedUrl = (): string => {
    if (book.driveUrl.includes('drive.google.com/file/d/')) {
      const match = book.driveUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    } else if (book.driveUrl.includes('docs.google.com/document/d/')) {
      const match = book.driveUrl.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/document/d/${match[1]}/preview`;
      }
    }

    if (book.viewUrl) return book.viewUrl;
    return `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(book.driveUrl)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-black flex flex-col animate-fade-in select-text">
      {/* Top Header Bar */}
      <header className="w-full bg-white border-b border-gray-200 px-3 py-2.5 flex items-center justify-between gap-2 shadow-xs z-30 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg active:scale-95 transition-colors shrink-0"
            title="ย้อนกลับ (Back Key)"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold truncate font-maitree text-black flex items-center gap-1.5">
              <span>{book.title}</span>
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold">
                {book.format}
              </span>
              <span>{book.level}</span>
              {book.fileSize && <span>• {book.fileSize}</span>}
              {zoomScale !== 1 && (
                <span className="text-amber-800 font-mono font-semibold">
                  • ซูม {Math.round(zoomScale * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Actions: Open External in Drive / Docs, Share, Close */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Open original directly in Google Docs / Drive in new tab */}
          <a
            href={book.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-700 hover:text-amber-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
            title="เปิดใน Google Docs / Google Drive โดยตรง"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            title="แชร์ลิงก์เอกสาร"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            title="ปิดหน้าอ่านเอกสาร"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Document Reading Stage: 100% Fit to screen, Free zoom with pinch gesture, No yellow banner */}
      <main
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 w-full h-full relative overflow-hidden bg-white p-0"
        style={{
          touchAction: 'pan-x pan-y pinch-zoom',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          className="w-full h-full origin-top transition-transform duration-75"
          style={{
            transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
            transformOrigin: 'top center'
          }}
        >
          <iframe
            src={getEmbedUrl()}
            title={book.title}
            className="w-full h-full border-0 block"
            allow="autoplay"
          />
        </div>
      </main>

      {/* Footer bar with quick action buttons: Fit to screen & direct Google Docs / Download links */}
      <footer className="w-full bg-white px-3 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 shrink-0">
        <span className="text-[11px] truncate text-gray-600">
          ตัวอย่างผ่าน Google Drive / Docs
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={book.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-800 rounded-md text-[11px] font-semibold hover:bg-gray-200 transition-all"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Google Docs</span>
          </a>
          {book.downloadUrl && (
            <a
              href={book.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-800 text-white rounded-md text-[11px] font-semibold hover:bg-amber-900 active:scale-95 transition-all"
            >
              <Download className="w-3 h-3" />
              <span>ดาวน์โหลด</span>
            </a>
          )}
        </div>
      </footer>
    </div>
  );
};
