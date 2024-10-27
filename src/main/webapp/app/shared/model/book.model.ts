export interface Book {
  id: string;
  bookName: string;
  title: string;
  author: string;
  description?: string;
  category: string;
  chapterCount?: number;
  language: string;
  bookStatus?: string;
  bookSetting?: string;
  imageUrl?: string;
  isDeleted: boolean;
}
