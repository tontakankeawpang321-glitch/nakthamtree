import React, { useState, useMemo } from 'react';
import { Search, Quote, Copy, Check, Shuffle, Share2, Sparkles, BookMarked } from 'lucide-react';
import { DEFAULT_PROVERBS, PROVERBS_CATEGORIES } from '../data/proverbsData';
import { Proverb } from '../types';

export const ProverbsTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Daily proverb index
  const [dailyIndex, setDailyIndex] = useState<number>(() => {
    return Math.floor(Math.random() * DEFAULT_PROVERBS.length);
  });

  const dailyProverb = DEFAULT_PROVERBS[dailyIndex] || DEFAULT_PROVERBS[0];

  const handleShuffleDaily = () => {
    let next = Math.floor(Math.random() * DEFAULT_PROVERBS.length);
    if (next === dailyIndex) {
      next = (dailyIndex + 1) % DEFAULT_PROVERBS.length;
    }
    setDailyIndex(next);
  };

  const filteredProverbs = useMemo(() => {
    return DEFAULT_PROVERBS.filter(p => {
      const matchCat = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        p.pali.toLowerCase().includes(query) ||
        p.thai.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.meaning && p.meaning.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const copyProverb = (proverb: Proverb) => {
    const textToCopy = `"${proverb.pali}"\nคำแปล: ${proverb.thai}\nที่มา: ${proverb.source} (${proverb.category})\n- นักธรรม ธรรมศึกษา`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(proverb.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const shareProverb = (proverb: Proverb) => {
    const textToShare = `"${proverb.pali}"\nคำแปล: ${proverb.thai}\nที่มา: ${proverb.source}\n- นักธรรม ชุมชนธรรมะ`;
    if (navigator.share) {
      navigator.share({
        title: 'พุทธศาสนสุภาษิต',
        text: textToShare
      }).catch(() => {});
    } else {
      copyProverb(proverb);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Daily Proverb Highlight Card */}
      <div className="bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600 rounded-2xl text-white p-4.5 shadow-md shadow-amber-900/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-medium backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>สุภาษิตประจำวัน</span>
          </div>
          <button
            onClick={handleShuffleDaily}
            className="inline-flex items-center gap-1 text-[11px] bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full text-white/90 active:scale-95 transition-all"
            title="สุ่มสุภาษิตใหม่"
          >
            <Shuffle className="w-3 h-3" />
            <span>สุ่มข้อคิด</span>
          </button>
        </div>

        <div className="relative z-10 my-2">
          <div className="font-maitree text-lg sm:text-xl font-bold tracking-wide text-amber-50">
            “{dailyProverb.pali}”
          </div>
          <div className="text-sm sm:text-base font-semibold text-white mt-1">
            {dailyProverb.thai}
          </div>
          {dailyProverb.meaning && (
            <p className="text-xs text-amber-100/90 mt-1.5 font-light leading-relaxed">
              {dailyProverb.meaning}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 text-[11px] text-amber-200">
            <span className="bg-amber-900/40 px-2 py-0.5 rounded-md border border-white/10">
              {dailyProverb.source}
            </span>
            <span className="bg-amber-900/40 px-2 py-0.5 rounded-md border border-white/10">
              {dailyProverb.category}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-amber-200/50 flex flex-col gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาสุภาษิต บาลี หรือคำแปล..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 text-xs text-gray-800 rounded-xl border border-gray-200 outline-none focus:border-amber-600 focus:bg-white transition-all font-sans"
          />
        </div>

        {/* Categories scrollable horizontal list */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {PROVERBS_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 text-xs px-3 py-1 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-amber-50/80 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Proverbs List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
          <span>พบ {filteredProverbs.length} สุภาษิต</span>
          {selectedCategory !== 'ทั้งหมด' && (
            <span className="font-medium text-amber-800">{selectedCategory}</span>
          )}
        </div>

        {filteredProverbs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100">
            ไม่พบพุทธศาสนสุภาษิตที่ตรงกับคำค้นหา
          </div>
        ) : (
          filteredProverbs.map(item => {
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-amber-200/50 hover:border-amber-400 transition-all flex flex-col gap-2 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/50">
                      {item.category}
                    </span>
                    {item.level && (
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {item.level}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyProverb(item)}
                      title="คัดลอกข้อความ"
                      className="p-1.5 text-gray-400 hover:text-amber-800 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => shareProverb(item)}
                      title="แชร์สุภาษิต"
                      className="p-1.5 text-gray-400 hover:text-amber-800 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pali Heading */}
                <div className="font-maitree text-base sm:text-lg font-bold text-amber-950 leading-snug">
                  “{item.pali}”
                </div>

                {/* Thai translation */}
                <div className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <span className="text-amber-700">คำแปล:</span> {item.thai}
                </div>

                {/* Dhamma meaning */}
                {item.meaning && (
                  <p className="text-xs text-gray-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/60 leading-relaxed font-light">
                    {item.meaning}
                  </p>
                )}

                {/* Reference */}
                <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
                  <span>ที่มา: {item.source}</span>
                  {isCopied && (
                    <span className="text-emerald-600 text-[10px] font-medium">คัดลอกแล้ว</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
