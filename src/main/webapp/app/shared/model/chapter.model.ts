export interface Chapter {
  id: string;
  bookId: string;
  chapterName: string;
  language: string;
  number: number;
  chapterStatus?: string;
  isDeleted: boolean;
}
