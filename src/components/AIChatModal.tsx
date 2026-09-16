import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';

const BACKEND_URL = 'https://spring-bush-acec.tontakankeawpang321.workers.dev';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHidden?: boolean; // When in book viewer or books tab
  onOpen: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init_1',
    text: 'เจริญพร ถามปัญหาธรรมะ หรือข้อมูลการสอบนักธรรมได้เลย ยินดีให้คำแนะนำ',
    sender: 'bot',
    timestamp: 'ตอนนี้'
  }
];

const SUGGESTED_PROMPTS = [
  'อริยสัจ 4 มีอะไรบ้างและประยุกต์ใช้อย่างไร?',
  'สรุปหัวข้อธรรมสำคัญในนักธรรมตรี',
  'เทคนิคการท่องจำธรรมวิภาคให้แม่นยำ',
  'ศีล 227 ข้อของพระภิกษุมีอะไรบ้าง?'
];

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  isHidden,
  onOpen
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      let botReply = '';
      if (!response.ok) {
        throw new Error('Network error status ' + response.status);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        botReply = data.reply || data.response || data.message || JSON.stringify(data);
      } else {
        botReply = await response.text();
      }

      if (!botReply.trim()) {
        botReply = 'ขออภัย ไม่ได้รับคำตอบจากระบบ AI กรุณาลองใหม่อีกครั้ง';
      }

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('AI chat error:', error);
      const fallbackMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        text: 'ขออภัย ระบบ AI กำลังประมวลผลหนักเกินไป หรือการเชื่อมต่อเครือข่ายขัดข้อง กรุณาลองใหม่อีกครั้งในภายหลัง',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // If hidden (e.g. on books tab), do not render floating button
  if (isHidden && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button (FAB) on non-book tabs */}
      {!isOpen && !isHidden && (
        <aside aria-label="Floating AI Actions" className="fixed bottom-20 right-4 z-40 flex flex-col items-end">
          <button
            onClick={onOpen}
            aria-label="เปิดหน้าต่าง AI ตอบปัญหาธรรมะ"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white font-maitree font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-900/30 active:scale-95 hover:shadow-indigo-900/40 transition-all duration-200 border border-white/20 select-none cursor-pointer"
          >
            <div className="relative">
              <Bot className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <span>ถาม AI ธรรมะ</span>
          </button>
        </aside>
      )}

      {/* Chat Dialog Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full sm:max-w-md h-[82vh] sm:h-[560px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Chat Header */}
            <header className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-maitree text-sm font-bold flex items-center gap-1.5">
                    AI ตอบปัญหาธรรมะ
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <p className="text-[10px] text-indigo-100/90 font-light">
                    เชื่อมต่อ API อัจฉริยะ (Workers)
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/15 active:scale-95 transition-all"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-stone-50/60">
              {messages.map(msg => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isUser ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-xs'
                          : 'bg-white text-gray-900 border border-gray-200/70 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col max-w-[80%] self-start items-start">
                  <div className="px-3 py-2 bg-white text-gray-500 border border-gray-200/70 rounded-2xl rounded-tl-xs text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] text-gray-400">AI กำลังประมวลผลคำตอบ...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </main>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-none">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-full border border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="พิมพ์คำถามข้อธรรมะ..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 text-xs sm:text-sm px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full outline-none focus:border-indigo-500 focus:bg-white transition-all font-sans"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                aria-label="ส่งข้อความถาม AI"
                className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
