import React, { useState } from 'react';
import { ExternalLink, ZoomIn, ZoomOut, RotateCcw, Smartphone, Globe, Maximize2 } from 'lucide-react';

const FB_PAGE_URL = "https://www.facebook.com/p/%E0%B8%AA%E0%B8%B3%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B9%81%E0%B8%A1%E0%B9%88%E0%B8%81%E0%B8%AD%E0%B8%87%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%AA%E0%B8%99%E0%B8%B2%E0%B8%A1%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B8%87-Royal-Dhamma-Studies-Office-61568725258865/";

const FB_EMBED_URL = "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fp%2F%25E0%25B8%25AA%25E0%25B8%25B3%25E0%25B8%2599%25E0%25B8%25B1%25E0%25B8%2581%25E0%25B8%2587%25E0%25B8%25B2%25E0%25B8%2599%25E0%25B9%2581%25E0%25B8%25A1%25E0%25B9%2588%25E0%25B8%2581%25E0%25B8%25AD%25E0%25B8%2587%25E0%25B8%2598%25E0%25B8%25A3%25E0%25B8%25A1%25E0%25B8%25AA%25E0%25B8%2599%25E0%25B8%25B2%25E0%25B8%25A1%25E0%25B8%25AB%25E0%25B8%25A5%25E0%25B8%25A7%25E0%25B8%2587-Royal-Dhamma-Studies-Office-61568725258865%2F&tabs=timeline&width=450&height=650&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true";

export const FacebookPageView: React.FC = () => {
  // Zoom level: default 0.82 (82%) for comfortable mobile viewing without clipping
  const [zoomLevel, setZoomLevel] = useState<number>(0.82);
  const [viewMode, setViewMode] = useState<'plugin' | 'fallback'>('plugin');

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(1.2, +(prev + 0.08).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.6, +(prev - 0.08).toFixed(2)));
  };

  const handleFitMobile = () => {
    setZoomLevel(0.80);
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs border border-amber-200/60 flex flex-col gap-3">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-2xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-maitree text-sm font-bold text-gray-900 leading-tight">
              Facebook สำนักงานแม่กองธรรมสนามหลวง
            </h3>
            <p className="text-[11px] text-gray-500">
              แสดงแบบหน้าเว็บเพจ • ซูมออกพอดีจอมือถือ
            </p>
          </div>
        </div>

        <a
          href={FB_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold active:scale-95 transition-all"
        >
          <span>เปิดเพจเต็ม</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Zoom and Display Bar */}
      <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-2 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={handleFitMobile}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 ${
              zoomLevel === 0.80
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            title="ซูมออกให้พอดีจอมือถือ"
          >
            <Smartphone className="w-3 h-3" />
            <span>พอดีจอมือถือ</span>
          </button>

          <button
            onClick={handleZoomOut}
            className="p-1 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 active:scale-95"
            title="ซูมออก (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono px-1 font-medium text-gray-600">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-1 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 active:scale-95"
            title="ซูมเข้า (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            className="p-1 bg-white hover:bg-gray-100 text-gray-500 rounded-lg border border-gray-200 active:scale-95"
            title="รีเซ็ตขนาด 100%"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode(viewMode === 'plugin' ? 'fallback' : 'plugin')}
            className="text-[11px] text-gray-500 hover:text-gray-800 px-1.5 py-0.5 rounded"
          >
            {viewMode === 'plugin' ? 'โหมดเบา' : 'โหมดเว็บเพจ'}
          </button>
        </div>
      </div>

      {/* Web Page View Container with scale */}
      {viewMode === 'plugin' ? (
        <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white relative">
          <div
            className="w-full flex justify-center origin-top transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              width: `${(1 / zoomLevel) * 100}%`,
              marginLeft: `${((1 - 1 / zoomLevel) / 2) * 100}%`,
              height: `${620 * zoomLevel}px`
            }}
          >
            <iframe
              src={FB_EMBED_URL}
              width="450"
              height="650"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Facebook Fanpage Web Page View"
              className="rounded-lg shadow-xs"
            />
          </div>

          <div className="p-2.5 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>แสดงแบบหน้าเว็บเพจ ย่อขยายได้อิสระ</span>
            <a
              href={FB_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              เปิดแอพ Facebook
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50/70 p-4 text-center flex flex-col items-center justify-center gap-2.5">
          <p className="text-xs text-gray-700 max-w-sm">
            ติดตามประกาศวันสอบ ผลการสอบธรรมศึกษา และข่าวสารทางการจากสำนักงานแม่กองธรรมสนามหลวง
          </p>
          <a
            href={FB_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>เข้าชม Facebook สำนักงานแม่กองธรรมฯ</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
