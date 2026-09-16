export type NavTab = 'home' | 'community' | 'proverbs' | 'books';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  timestamp: string;
  author: string;
  category: string;
  question: string;
  comments?: Comment[];
}

export interface Proverb {
  id: string;
  pali: string;
  thai: string;
  source: string;
  category: string;
  meaning?: string;
  level?: 'นักธรรมตรี' | 'นักธรรมโท' | 'นักธรรมเอก' | 'ทั่วไป';
}

export interface Book {
  id: string;
  title: string;
  category: string;
  level: string;
  format: 'pdf' | 'docx';
  driveUrl: string;
  viewUrl?: string;
  downloadUrl?: string;
  fileSize?: string;
  description?: string;
  pages?: number;
  contentHtml?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
