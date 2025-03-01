export interface Chapter {
  id: string;
  bookId: string;
  chapterName: string;
  language: string;
  number: number;
  storageId: string;
  chapterStatus?: string;
  isDeleted: boolean;
}
