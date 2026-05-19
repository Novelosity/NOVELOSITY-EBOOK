export type UserRole = 'reader' | 'author' | 'editor' | 'admin';

export interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  dataAiHint?: string;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  isLocked: boolean;
  coinCost?: number;
  isPaid?: boolean;
  words?: number;
  date?: string;
}

export interface Novel {
  id: string;
  title: string;
  author: Author;
  genre: string[];
  tags: string[];
  chapters: Chapter[];
  completionStatus?: 'Completed' | 'Ongoing';
  coverImageUrl?: string;
  synopsis?: string;
  language?: string;
  targetAudience?: string;
  contentRating?: string;
}

// Alias for Novel - used in reader pages
export type Book = Novel;

export interface UserComment {
  id: string;
  user: {
    name: string;
    initials: string;
    avatarUrl?: string;
    dataAiHint?: string;
  };
  text: string;
  timestamp: string;
}
