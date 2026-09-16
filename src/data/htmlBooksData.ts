import { BookChapter, HtmlBook } from './htmlBooksTypes';
import { NAKTHAM_TEE_CHAPTERS } from './htmlBooksDataTee';
import { NAKTHAM_THO_CHAPTERS } from './htmlBooksDataTho';
import { NAKTHAM_EK_CHAPTERS } from './htmlBooksDataEk';

export type { BookChapter, HtmlBook };

export const HTML_BOOKS: Record<string, HtmlBook> = {
  'naktham-tee': {
    id: 'naktham-tee',
    title: 'บทสรุปวิชา นักธรรมตรี',
    level: 'ชั้นต้น',
    badge: 'ครบทุกวิชา ๑๐๐ หน้า',
    description: 'บทสรุป ๔ วิชาหลัก: ธรรมวิภาค วินัยมุข พุทธประวัติ-ศาสนพิธี กระทู้ธรรม และเก็งข้อสอบสนามหลวง รวม ๑๐๐ หน้า',
    totalChapters: 100,
    chapters: NAKTHAM_TEE_CHAPTERS
  },
  'naktham-tho': {
    id: 'naktham-tho',
    title: 'บทสรุปวิชา นักธรรมโท',
    level: 'ชั้นกลาง',
    badge: 'ครบทุกวิชา ๕๐ หน้า',
    description: 'บทสรุป ๔ วิชาหลัก: ธรรมวิจารณ์ วินัยมุข เล่ม ๒ อนุพุทธประวัติ กระทู้ธรรมชั้นโท และเก็งข้อสอบสนามหลวง รวม ๕๐ หน้า',
    totalChapters: 50,
    chapters: NAKTHAM_THO_CHAPTERS
  },
  'naktham-ek': {
    id: 'naktham-ek',
    title: 'บทสรุปวิชา นักธรรมเอก',
    level: 'ชั้นสูง',
    badge: 'ครบทุกวิชา ๕๐ หน้า',
    description: 'บทสรุป ๔ วิชาหลัก: ธรรมวิจารณ์ชั้นเอก วินัยมุข เล่ม ๓ พุทธานุพุทธประวัติและประวัติศาสตร์ กระทู้ธรรมชั้นเอก รวม ๕๐ หน้า',
    totalChapters: 50,
    chapters: NAKTHAM_EK_CHAPTERS
  }
};
