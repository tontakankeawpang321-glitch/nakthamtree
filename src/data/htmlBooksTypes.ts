export interface BookChapter {
  pageNumber: number;
  title: string;
  subject: string;
  contentHtml: string;
}

export interface HtmlBook {
  id: 'naktham-tee' | 'naktham-tho' | 'naktham-ek';
  title: string;
  level: string;
  description: string;
  badge: string;
  totalChapters: number;
  chapters: BookChapter[];
}
