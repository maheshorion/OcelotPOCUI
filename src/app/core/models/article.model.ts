export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedDate: string;
  category: string;
  isFeatured: boolean;
  readTimeMinutes: number;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  tags: string[];
  isPublished: boolean;
  lastModified: string;
  summary: string;
}
