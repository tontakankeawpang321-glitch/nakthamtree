import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Send, CornerDownRight, ExternalLink, RefreshCw } from 'lucide-react';
import { Post, Comment } from '../types';
import { FacebookPageView } from './FacebookPageView';

declare const Swal: any;

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxV56uQlUU24xNJ4lX2dEtWIcZW2cj69qCV9CKhAsFOXuoqptvxr4dUOdcY5oeXF4jLiA/exec';

const DEFAULT_POSTS: Post[] = [
  {
    id: 'demo_1',
    timestamp: 'วันนี้ 09:00 น.',
    author: 'พระมหาธรรมะ',
    category: 'นักธรรมตรี',
    question: 'สอบถามเรื่องหัวข้อธรรมใน อริยสัจ 4 เหมาะสำหรับการเก็งข้อสอบปีนี้ครับ',
    comments: [
      {
        id: 'cm_1_1',
        author: 'สามเณรใฝ่ดี',
        text: 'อริยสัจ 4 ออกข้อสอบบ่อยมากครับ โดยเฉพาะเรื่องทุกข์และสมุทัย',
        timestamp: 'วันนี้ 09:15 น.'
      },
      {
        id: 'cm_1_2',
        author: 'อุบาสกวิชัย',
        text: 'อนุโมทนาครับ แนะนำดูเรื่องมรรค 8 เพิ่มเติมด้วยนะครับ',
        timestamp: 'วันนี้ 09:30 น.'
      }
    ]
  },
  {
    id: 'demo_2',
    timestamp: 'เมื่อวาน 15:30 น.',
    author: 'ศิษย์ใฝ่เรียน',
    category: 'ข้อสงสัย',
    question: 'อยากทราบเทคนิคการท่องจำธรรมวิภาคของนักธรรมโทให้จำได้แม่นยำครับ',
    comments: [
      {
        id: 'cm_2_1',
        author: 'ครูสอนพระปริยัติ',
        text: 'ลองแบ่งจำทีละหมวด และทำเป็นสรุปแผนผังความคิด (Mind Map) จะช่วยได้มากครับ',
        timestamp: 'เมื่อวาน 16:00 น.'
      }
    ]
  }
];

export const CommunityTab: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem('naktham_demo_posts');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return DEFAULT_POSTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: { name: string; text: string } }>({});

  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem('naktham_demo_posts', JSON.stringify(newPosts));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(APPS_SCRIPT_URL);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const json = await response.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        savePosts(json.data);
      }
    } catch (err) {
      console.warn('Using local posts due to network/CORS:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openCreatePostModal = async () => {
    if (typeof Swal !== 'undefined') {
      const { value: formValues } = await Swal.fire({
        title: 'ตั้งคำถาม / สนทนาธรรม',
        html: `
          <input id="swal-author" class="swal2-input" placeholder="ชื่อของคุณ (เช่น ศิษย์วัด/ผู้ใฝ่ธรรม)" style="margin-bottom:10px; font-size:14px;">
          <select id="swal-category" class="swal2-select" style="display:flex; width:80%; margin:0 auto 10px auto; font-size:14px;">
            <option value="ธรรมทั่วไป">ธรรมทั่วไป</option>
            <option value="นักธรรมตรี">นักธรรมตรี</option>
            <option value="นักธรรมโท">นักธรรมโท</option>
            <option value="นักธรรมเอก">นักธรรมเอก</option>
            <option value="ข้อสงสัย">ข้อสงสัยการสอบ</option>
          </select>
          <textarea id="swal-question" class="swal2-textarea" placeholder="พิมพ์ข้อความคำถามหรือข้อธรรมะที่ต้องการสนทนา..." style="height:90px; margin-top:5px; font-size:14px;"></textarea>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'โพสต์ข้อความ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#854D0E',
        preConfirm: () => {
          const author = (document.getElementById('swal-author') as HTMLInputElement)?.value?.trim() || 'ผู้ใฝ่ธรรม';
          const category = (document.getElementById('swal-category') as HTMLSelectElement)?.value;
          const question = (document.getElementById('swal-question') as HTMLTextAreaElement)?.value?.trim();

          if (!question) {
            Swal.showValidationMessage('กรุณากรอกข้อความคำถาม');
            return false;
          }
          return { author, category, question };
        }
      });

      if (formValues) {
        handleCreatePost(formValues);
      }
    } else {
      const question = prompt('พิมพ์ข้อความคำถามหรือข้อธรรมะ:');
      if (question) {
        handleCreatePost({ author: 'ผู้ใฝ่ธรรม', category: 'ธรรมทั่วไป', question });
      }
    }
  };

  const handleCreatePost = async (data: { author: string; category: string; question: string }) => {
    const timestamp = new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const newPost: Post = {
      id: 'post_' + Date.now(),
      timestamp,
      author: data.author,
      category: data.category,
      question: data.question,
      comments: []
    };

    const updated = [newPost, ...posts];
    savePosts(updated);

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'โพสต์สำเร็จ!',
        timer: 1500,
        showConfirmButton: false
      });
    }

    // Try remote sync in background
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'create', ...data })
      });
    } catch (e) {
      console.warn('Remote sync skipped:', e);
    }
  };

  const handleDeletePost = async (id: string) => {
    let confirmDelete = true;
    if (typeof Swal !== 'undefined') {
      const res = await Swal.fire({
        title: 'ยืนยันการลบโพสต์?',
        text: 'ข้อความนี้จะถูกลบออกจากระบบ',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'ลบโพสต์',
        cancelButtonText: 'ยกเลิก'
      });
      confirmDelete = res.isConfirmed;
    } else {
      confirmDelete = window.confirm('ยืนยันการลบโพสต์นี้?');
    }

    if (!confirmDelete) return;

    const updated = posts.filter(p => p.id !== id);
    savePosts(updated);

    // Try remote sync in background
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete', id })
      });
    } catch (e) {
      console.warn('Remote sync failed:', e);
    }
  };

  const handleAddComment = async (postId: string) => {
    const inputData = commentInputs[postId] || { name: 'ผู้ใฝ่ธรรม', text: '' };
    const text = inputData.text.trim();
    if (!text) return;

    const author = inputData.name.trim() || 'ผู้ใฝ่ธรรม';
    const timestamp = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    const newComment: Comment = {
      id: 'cm_' + Date.now(),
      author,
      text,
      timestamp
    };

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    });

    savePosts(updated);
    setCommentInputs(prev => ({
      ...prev,
      [postId]: { ...prev[postId], text: '' }
    }));

    // Try remote sync
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addComment', postId, comment: newComment })
      });
    } catch (e) {
      console.warn('Remote sync comment error:', e);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId && p.comments) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        };
      }
      return p;
    });
    savePosts(updated);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Forum Box */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-amber-200/50 flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-maitree text-base font-bold text-amber-900 leading-tight">
                สนทนาธรรม
              </h2>
              <p className="text-[11px] text-gray-500">
                แลกเปลี่ยนข้อคิดและคำถามในการสอบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadPosts}
              disabled={isLoading}
              title="โหลดข้อมูลใหม่"
              className="p-1.5 text-gray-400 hover:text-amber-800 rounded-lg hover:bg-amber-50 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-700' : ''}`} />
            </button>
            <button
              onClick={openCreatePostModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-700 to-amber-600 text-white font-maitree text-xs font-semibold shadow-xs hover:from-amber-800 hover:to-amber-700 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ตั้งคำถาม</span>
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="flex flex-col gap-3">
          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs font-light">
              ยังไม่มีกระทู้สนทนา ร่วมเปิดประเด็นธรรมะเป็นคนแรก!
            </div>
          ) : (
            posts.map(post => {
              const comments = post.comments || [];
              const isCommentsExpanded = activeCommentsPostId === post.id;
              const input = commentInputs[post.id] || { name: 'ผู้ใฝ่ธรรม', text: '' };

              return (
                <div
                  key={post.id}
                  className="bg-[#FDFBF7] rounded-xl p-3.5 border border-amber-100/70 shadow-xs flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center text-[10px]">
                        {post.author.charAt(0)}
                      </span>
                      {post.author}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800 font-medium text-[10px]">
                      {post.category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                    {post.question}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-100/40 text-[11px]">
                    <button
                      onClick={() => setActiveCommentsPostId(isCommentsExpanded ? null : post.id)}
                      className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-amber-100/50 transition-colors"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>ความคิดเห็น ({comments.length})</span>
                    </button>

                    <div className="flex items-center gap-2 text-gray-400">
                      <span>{post.timestamp}</span>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                        title="ลบโพสต์"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Comments accordion */}
                  {isCommentsExpanded && (
                    <div className="mt-1 pt-2 border-t border-dashed border-amber-200/60 flex flex-col gap-2 animate-fade-in">
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {comments.length === 0 ? (
                          <div className="text-[11px] text-gray-400 text-center py-2">
                            ยังไม่มีความคิดเห็น ร่วมแสดงความคิดเห็นคนแรก
                          </div>
                        ) : (
                          comments.map(cm => (
                            <div
                              key={cm.id}
                              className="bg-white rounded-lg p-2 border border-gray-100 shadow-2xs text-[11px]"
                            >
                              <div className="flex items-center justify-between text-gray-500 mb-0.5">
                                <span className="font-semibold text-amber-900">{cm.author}</span>
                                <div className="flex items-center gap-1.5">
                                  <span>{cm.timestamp}</span>
                                  <button
                                    onClick={() => handleDeleteComment(post.id, cm.id)}
                                    className="text-red-400 hover:text-red-600 font-bold ml-1 text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-800 font-normal">{cm.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment box */}
                      <div className="bg-amber-50/60 rounded-xl p-2 border border-amber-200/50 flex flex-col gap-1.5">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="ชื่อของคุณ"
                            value={input.name}
                            onChange={e => {
                              const val = e.target.value;
                              setCommentInputs(prev => ({
                                ...prev,
                                [post.id]: { ...(prev[post.id] || { text: '' }), name: val }
                              }));
                            }}
                            className="w-1/3 text-[11px] px-2 py-1 bg-white border border-gray-200 rounded-md outline-none focus:border-amber-500"
                          />
                          <input
                            type="text"
                            placeholder="พิมพ์ความคิดเห็น..."
                            value={input.text}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            onChange={e => {
                              const val = e.target.value;
                              setCommentInputs(prev => ({
                                ...prev,
                                [post.id]: { ...(prev[post.id] || { name: 'ผู้ใฝ่ธรรม' }), text: val }
                              }));
                            }}
                            className="flex-1 text-[11px] px-2 py-1 bg-white border border-gray-200 rounded-md outline-none focus:border-amber-500"
                          />
                        </div>
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="self-end inline-flex items-center gap-1 px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-md text-[10px] font-semibold active:scale-95 transition-all"
                        >
                          <Send className="w-3 h-3" />
                          <span>ส่งความเห็น</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Facebook Section: Web page view with mobile zoom-out support */}
      <FacebookPageView />
    </div>
  );
};
