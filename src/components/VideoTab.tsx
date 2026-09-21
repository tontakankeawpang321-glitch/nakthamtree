import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Play, RefreshCw, ChevronLeft, ChevronRight, X, Film, Sparkles, BookOpen } from 'lucide-react';
import { VideoItem } from '../types';
import {
  getCachedVideos,
  fetchLiveVideosFromSheet
} from '../services/videoSheetService';

interface VideoTabProps {
  onSwitchToCourseView?: () => void;
}

const ITEMS_PER_PAGE = 10;

export const VideoTab: React.FC<VideoTabProps> = ({ onSwitchToCourseView }) => {
  const [videos, setVideos] = useState<VideoItem[]>(() => getCachedVideos());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Background silent real-time fetch on component mount
  const handleSyncVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchLiveVideosFromSheet();
      if (res.success) {
        setVideos(res.videos);
      }
    } catch (err) {
      console.warn('Video sheet fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Background fetch without disturbing the user
    handleSyncVideos();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ videos: VideoItem[] }>;
      if (customEvent.detail?.videos) {
        setVideos(customEvent.detail.videos);
      }
    };
    window.addEventListener('naktham_videos_updated', handleUpdate);
    return () => window.removeEventListener('naktham_videos_updated', handleUpdate);
  }, [handleSyncVideos]);

  // Extract available unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('ทั้งหมด');
    videos.forEach(v => {
      if (v.category && v.category.trim()) {
        set.add(v.category.trim());
      }
    });
    return Array.from(set);
  }, [videos]);

  // Filtered video list based on search and category
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchSearch =
        searchQuery.trim() === '' ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ทั้งหมด' || v.category.trim() === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [videos, searchQuery, selectedCategory]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Pagination calculation: exactly 10 clips per page
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / ITEMS_PER_PAGE));
  const paginatedVideos = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVideos.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredVideos, currentPage]);

  return (
    <div className="flex flex-col gap-3.5 animate-fade-in">
      {/* Top Banner & Mode Switch */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600 text-white p-4 shadow-md shadow-amber-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-medium backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>วิดีโอ & เสียงอ่านนักธรรม</span>
            </div>

            {/* Quick Button to switch to Course View if available */}
            {onSwitchToCourseView && (
              <button
                onClick={onSwitchToCourseView}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-medium transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>ดูบทเรียน/แบบทดสอบ</span>
              </button>
            )}
          </div>

          <div>
            <h2 className="font-maitree text-lg sm:text-xl font-bold leading-tight">
              คลังวิดีโอบทเรียนธรรมะ
            </h2>
            <p className="text-[11px] text-amber-100 font-light mt-0.5">
              รับชมคลิปบรรยาย เก็งข้อสอบ และเสียงอ่านธรรมวิภาค
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar & Categories */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-amber-200/60 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อคลิป หรือหมวดวิชา..."
              className="w-full pl-9 pr-8 py-2 bg-amber-50/40 border border-amber-200/80 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-600 focus:bg-white transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleSyncVideos}
            disabled={isLoading}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 active:scale-95 transition-all shrink-0"
            title="รีเฟรชข้อมูลคลิปล่าสุด"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-700' : ''}`} />
          </button>
        </div>

        {/* Categories horizontal scroll */}
        {categories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 text-[11px] px-3 py-1 rounded-full font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-amber-50/80 text-amber-900 hover:bg-amber-100 border border-amber-200/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100 px-0.5">
          <span>พบทั้งหมด {filteredVideos.length} คลิป</span>
          <span>
            หน้า {currentPage} จาก {totalPages} (แสดง {paginatedVideos.length} คลิป)
          </span>
        </div>
      </div>

      {/* 2-Column Video Grid Layout */}
      {paginatedVideos.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200 flex flex-col items-center gap-2">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="font-maitree font-bold text-sm text-gray-800">
            {videos.length === 0 ? 'ไม่มีคลิปวิดีโอในคลัง (๐ คลิป)' : 'ไม่พบคลิปที่ตรงกับคำค้นหา'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm">
            {videos.length === 0
              ? 'ระบบเชื่อมต่อกับ Google Sheet โดยตรง เมื่อมีการเพิ่มหรือลบแถวบนชีต หน้าแอพจะปรับตามทันที'
              : 'ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {paginatedVideos.map(video => {
            return (
              <div
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-amber-200/60 hover:border-amber-400 hover:shadow-md active:scale-98 transition-all flex flex-col justify-between"
              >
                {/* Video Thumbnail with Play Badge */}
                <div className="relative aspect-video w-full bg-black/90 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={e => {
                      // Fallback image if youtube thumbnail fails
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60';
                    }}
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Play Button Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-600/90 group-hover:bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
                    </div>
                  </div>

                  {/* Category Pill Tag */}
                  {video.category && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/75 text-amber-200 backdrop-blur-xs line-clamp-1 max-w-[85%]">
                      {video.category}
                    </span>
                  )}
                </div>

                {/* Title and Direct Play Action */}
                <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 gap-2">
                  <h4 className="font-maitree text-xs sm:text-sm font-bold text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                    {video.title}
                  </h4>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] sm:text-[11px] text-amber-700 font-semibold">
                    <span>แตะเพื่อรับชมทันที</span>
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls (Previous / Next) - Exactly 10 items per page */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-amber-200/60 flex items-center justify-between mt-1">
          <button
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
              // Show limited page numbers on mobile
              if (
                totalPages > 5 &&
                p !== 1 &&
                p !== totalPages &&
                Math.abs(p - currentPage) > 1
              ) {
                if (p === 2 || p === totalPages - 1) {
                  return (
                    <span key={p} className="text-gray-400 text-xs px-0.5">
                      •
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    currentPage === p
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-amber-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-amber-800 hover:bg-amber-900 text-white active:scale-95 shadow-xs'
            }`}
          >
            <span>ถัดไป</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Embedded Player Modal (Plays directly inside the app, without outbound link button) */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200/60 flex flex-col">
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-900 to-amber-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Play className="w-4 h-4 text-amber-300 fill-current shrink-0" />
                <h3 className="font-maitree font-bold text-sm truncate">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Responsive Player */}
            <div className="relative aspect-video w-full bg-black">
              {activeVideo.embedUrl ? (
                <iframe
                  src={`${activeVideo.embedUrl}?autoplay=1`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center">
                  <Play className="w-10 h-10 text-amber-500 mb-2" />
                  <p className="text-xs">ไม่สามารถฝังตัวเล่นได้โดยตรง</p>
                </div>
              )}
            </div>

            {/* Modal Details */}
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  {activeVideo.category || 'นักธรรมตรี'}
                </span>
                <span className="text-[11px] text-gray-500">
                  โหมดรับชมในแอพ
                </span>
              </div>
              <h4 className="font-maitree font-bold text-base text-gray-900 leading-snug">
                {activeVideo.title}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
