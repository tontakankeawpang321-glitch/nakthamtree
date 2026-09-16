import React, { useState } from 'react';
import { Sparkles, Shuffle, Star, X, BookOpen, Check, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DidYouKnowItem, getRandomDidYouKnowFact } from '../data/didYouKnowData';
import { toggleFavorite, isFavorite } from '../services/favoritesService';

interface DidYouKnowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DidYouKnowModal: React.FC<DidYouKnowModalProps> = ({ isOpen, onClose }) => {
  const [currentFact, setCurrentFact] = useState<DidYouKnowItem>(() => getRandomDidYouKnowFact());
  const [isFavorited, setIsFavorited] = useState<boolean>(() => isFavorite(`trivia_${currentFact.id}`));
  const [copied, setCopied] = useState<boolean>(false);

  const handleNextRandom = () => {
    const next = getRandomDidYouKnowFact();
    setCurrentFact(next);
    setIsFavorited(isFavorite(`trivia_${next.id}`));
  };

  const handleToggleFavorite = () => {
    const newState = toggleFavorite({
      id: `trivia_${currentFact.id}`,
      type: 'trivia',
      title: currentFact.title,
      subtitle: currentFact.paliMeaning || currentFact.fact.slice(0, 70) + '...',
      category: currentFact.category,
      targetId: String(currentFact.id)
    });
    setIsFavorited(newState);
  };

  const handleShare = async () => {
    const shareText = `รู้หรือไม่? (เกร็ดนักธรรมตรี เรื่องที่ ${currentFact.id}/๑,๐๐๐)\n${currentFact.title}\n${currentFact.pali ? `พุทธพจน์: "${currentFact.pali}"\n` : ''}${currentFact.fact}\n\nศึกษาต่อในแอพนักธรรมศึกษา`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentFact.title,
          text: shareText
        });
      } catch {
        // Ignore user cancellation
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.warn('Clipboard write error', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white p-4 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white active:scale-95 transition-all"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 bg-amber-900/40 border border-amber-300/40 text-amber-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                <span>รู้หรือไม่? เกร็ดความรู้</span>
              </span>
              <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">
                เรื่องที่ {currentFact.id} / ๑,๐๐๐
              </span>
            </div>

            <h3 className="font-maitree text-base sm:text-lg font-bold text-amber-50 leading-snug">
              {currentFact.title}
            </h3>

            <div className="mt-1 flex items-center gap-2 text-xs text-amber-200/90 font-medium">
              <span className="bg-amber-950/30 px-2 py-0.5 rounded border border-amber-300/20">
                {currentFact.category}
              </span>
              <span>คละความรู้นักธรรมตรี</span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 overflow-y-auto space-y-3.5 text-gray-900 leading-relaxed text-sm">
            {currentFact.pali && (
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl">
                <p className="font-serif italic font-bold text-amber-950 text-sm">
                  "{currentFact.pali}"
                </p>
                {currentFact.paliMeaning && (
                  <p className="text-xs text-amber-900 mt-1">
                    แปลว่า: <span className="font-medium">{currentFact.paliMeaning}</span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 font-maitree flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-900">
                <BookOpen className="w-3.5 h-3.5" />
                สาระน่ารู้ & คำอธิบาย
              </h4>
              <p className="text-gray-800 text-xs sm:text-sm">
                {currentFact.fact}
              </p>
            </div>

            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950">
              <p className="font-bold text-emerald-900 flex items-center gap-1 mb-1">
                <span>💡 เกร็ดข้อสอบและวิธีจำ:</span>
              </p>
              <p className="text-emerald-900/90 leading-normal">
                {currentFact.tip}
              </p>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-3 bg-gray-50 border-t border-gray-200/80 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleNextRandom}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                title="สุ่มอ่านเรื่องถัดไปจาก 1,000 เรื่อง"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>สุ่มเรื่องต่อไป 🎲</span>
              </button>

              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 ${
                  isFavorited
                    ? 'bg-amber-100 text-amber-900 border-amber-400'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
                title={isFavorited ? 'บันทึกในรายการโปรดแล้ว' : 'บันทึกในรายการโปรด'}
              >
                <Star className={`w-4 h-4 ${isFavorited ? 'fill-amber-500 text-amber-600' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
                title="แชร์เกร็ดความรู้นี้"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-black active:scale-95 text-white rounded-xl text-xs font-semibold transition-all"
            >
              เข้าสู่บทเรียน
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
