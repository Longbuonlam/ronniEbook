export interface RonnieFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileStore?: string;
  fileStatus?: string;
  storageId: string;
  chapterStorageId: string;
  content: string;
}
