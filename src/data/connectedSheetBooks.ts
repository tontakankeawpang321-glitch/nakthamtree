import { Book } from '../types';

// Embedded books synced with Google Sheet
export const CONNECTED_SHEET_BOOKS: Book[] = [
  {
    id: 'doc_thamavibhaga',
    title: 'ธรรมมะวิภาค',
    category: 'หนังสือทั่วไป',
    level: 'ทั่วไป',
    format: 'docx',
    driveUrl: 'https://docs.google.com/document/d/13PMspfLGWtGIo81eRemCn7ivT50L4vCcKDcko7ykyUk/edit?usp=drivesdk',
    viewUrl: 'https://docs.google.com/document/d/13PMspfLGWtGIo81eRemCn7ivT50L4vCcKDcko7ykyUk/preview',
    downloadUrl: 'https://docs.google.com/document/d/13PMspfLGWtGIo81eRemCn7ivT50L4vCcKDcko7ykyUk/export?format=docx',
    fileSize: 'DOCX',
    description: 'เอกสารประกอบการศึกษา ธรรมมะวิภาค'
  },
  {
    id: 'doc_navakovada',
    title: 'นวโกวาท',
    category: 'หนังสือทั่วไป',
    level: 'ทั่วไป',
    format: 'docx',
    driveUrl: 'https://docs.google.com/document/d/1y1Mh6drltePSMWPkdZ5FBltYAeg_Sp0cmbluwzWoQyY/edit?usp=drivesdk',
    viewUrl: 'https://docs.google.com/document/d/1y1Mh6drltePSMWPkdZ5FBltYAeg_Sp0cmbluwzWoQyY/preview',
    downloadUrl: 'https://docs.google.com/document/d/1y1Mh6drltePSMWPkdZ5FBltYAeg_Sp0cmbluwzWoQyY/export?format=docx',
    fileSize: 'DOCX',
    description: 'เอกสารประกอบการศึกษา นวโกวาท'
  }
];

