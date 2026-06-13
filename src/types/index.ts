export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  tags: string[];
  totalPages: number;
  currentPage: number;
  totalReadingTime: number;
  description: string;
  isbn?: string;
  publisher?: string;
  publishDate?: string;
  rating?: number;
  addTime: number;
  lastReadTime?: number;
  status: 'reading' | 'finished' | 'wish';
}

export interface Note {
  id: string;
  bookId: string;
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
  pageNumber?: number;
  createTime: number;
}

export interface Booklist {
  id: string;
  title: string;
  description: string;
  cover: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  books: string[];
  bookCount: number;
  likes: number;
  collections: number;
  tags: string[];
  isLiked: boolean;
  isCollected: boolean;
  createTime: number;
}

export interface Challenge {
  id: string;
  title: string;
  type: 'weekly';
  targetMinutes: number;
  startTime: number;
  endTime: number;
  status: 'ongoing' | 'finished' | 'upcoming';
  participants: ChallengeParticipant[];
  myProgress: number;
}

export interface ChallengeParticipant {
  userId: string;
  userName: string;
  userAvatar: string;
  readingMinutes: number;
  isWinner?: boolean;
}

export interface Medal {
  id: string;
  name: string;
  description: string;
  icon: string;
  obtainTime?: number;
  isObtained: boolean;
}

export interface DailyPlan {
  bookId: string;
  bookTitle: string;
  bookCover: string;
  targetPages: number;
  completedPages: number;
  targetMinutes: number;
  completedMinutes: number;
  date: string;
}

export interface MonthlyReport {
  month: string;
  totalReadingTime: number;
  bookCount: number;
  finishedBooks: number;
  noteCount: number;
  completionRate: number;
  dailyAverage: number;
  categories: { category: string; count: number }[];
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  totalReadingTime: number;
  bookCount: number;
  followers: number;
  following: number;
  level: number;
}

export interface ReadingRecord {
  date: string;
  minutes: number;
}
