import { create } from 'zustand';
import Taro from '@tarojs/taro';
import {
  Book,
  Note,
  Booklist,
  Challenge,
  ChallengeParticipant,
  Medal,
  DailyPlan,
  MonthlyReport,
  ReadingRecord,
  User,
} from '@/types';
import { mockBooks, mockNotes, mockDailyPlans, mockReadingRecords } from '@/data/books';
import { mockBooklists } from '@/data/booklists';
import { mockChallenges, mockMedals, mockFriends } from '@/data/challenges';
import { generateId, calculateReadingProgress } from '@/utils';

const STORAGE_KEY = 'yuedu_app_store_v1';

const formatTimeStore = (minutes: number): string => {
  if (!minutes) return '0分钟';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}小时${m}分`;
  if (h > 0) return `${h}小时`;
  return `${m}分钟`;
};

const defaultUser: User = {
  id: 'me',
  name: '读书爱好者',
  avatar: 'https://picsum.photos/id/1005/100/100',
  totalReadingTime: 0,
  bookCount: 0,
  followers: 128,
  following: 56,
  level: 3,
};

interface AppState {
  user: User;
  books: Book[];
  notes: Note[];
  booklists: Booklist[];
  challenges: Challenge[];
  medals: Medal[];
  friends: ChallengeParticipant[];
  dailyPlans: DailyPlan[];
  readingRecords: ReadingRecord[];

  initStore: () => void;
  saveToStorage: () => void;

  addBook: (book: Partial<Book> & { title: string; author: string }) => Book;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;

  addNote: (note: Partial<Note> & { bookId: string; content: string }) => Note;
  addReadingRecord: (bookId: string, minutes: number, newPage?: number) => void;

  createBooklist: (data: Partial<Booklist> & { title: string; books: string[] }) => Booklist;
  toggleBooklistLike: (id: string) => void;
  toggleBooklistCollect: (id: string) => void;

  createChallenge: (targetMinutes: number, friendId?: string) => Challenge;
  updateChallengeProgress: (challengeId: string, userId: string, addMinutes: number) => void;
  checkChallengeCompletion: (challengeId: string) => void;

  generateDailyPlans: () => DailyPlan[];
  generateRecommendBooks: () => Book[];
  getMonthlyReport: (month?: string) => MonthlyReport;
  exportMonthlyReportPDF: (month?: string) => Promise<string>;
}

const getInitialState = (): Pick<
  AppState,
  'user' | 'books' | 'notes' | 'booklists' | 'challenges' | 'medals' | 'friends' | 'dailyPlans' | 'readingRecords'
> => ({
  user: defaultUser,
  books: mockBooks.map((b) => ({ ...b })),
  notes: mockNotes.map((n) => ({ ...n })),
  booklists: mockBooklists.map((b) => ({ ...b })),
  challenges: mockChallenges.map((c) => ({ ...c })),
  medals: mockMedals.map((m) => ({ ...m })),
  friends: mockFriends.map((f) => ({
    userId: f.id,
    userName: f.name,
    userAvatar: f.avatar,
    readingMinutes: f.readingTime || 0,
  })),
  dailyPlans: mockDailyPlans.map((d) => ({ ...d })),
  readingRecords: mockReadingRecords.map((r) => ({ ...r })),
});

const useAppStore = create<AppState>((set, get) => ({
  ...getInitialState(),

  initStore: () => {
    try {
      const saved = Taro.getStorageSync(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set(parsed);
      }
    } catch (e) {
      console.warn('[Store] 读取本地存储失败，使用默认数据');
    }
  },

  saveToStorage: () => {
    const state = get();
    const toSave = {
      user: state.user,
      books: state.books,
      notes: state.notes,
      booklists: state.booklists,
      challenges: state.challenges,
      medals: state.medals,
      friends: state.friends,
      dailyPlans: state.dailyPlans,
      readingRecords: state.readingRecords,
    };
    try {
      Taro.setStorageSync(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('[Store] 保存到本地存储失败');
    }
  },

  addBook: (bookData) => {
    const newBook: Book = {
      id: generateId(),
      title: bookData.title,
      author: bookData.author,
      cover: bookData.cover || `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/300/400`,
      category: bookData.category || '其他',
      tags: bookData.tags || [],
      totalPages: bookData.totalPages ? Number(bookData.totalPages) : 200,
      currentPage: 0,
      totalReadingTime: 0,
      description: bookData.description || '',
      isbn: bookData.isbn,
      publisher: bookData.publisher,
      publishDate: bookData.publishDate,
      rating: bookData.rating,
      addTime: Date.now(),
      status: 'wish',
    };
    set((state) => {
      const newState = {
        books: [newBook, ...state.books],
        user: { ...state.user, bookCount: state.user.bookCount + 1 },
      };
      setTimeout(() => get().saveToStorage(), 50);
      return newState;
    });
    return newBook;
  },

  updateBook: (id, updates) => {
    set((state) => {
      const books = state.books.map((b) => (b.id === id ? { ...b, ...updates } : b));
      const updated = books.find((b) => b.id === id);
      let status = updated?.status;
      if (updated && updated.currentPage > 0 && !status) {
        status = 'reading';
      }
      if (updated && updated.totalPages && updated.currentPage >= updated.totalPages) {
        status = 'finished';
      }
      if (status && updated && status !== updated.status) {
        const idx = books.findIndex((b) => b.id === id);
        books[idx] = { ...books[idx], status };
      }
      setTimeout(() => get().saveToStorage(), 50);
      return { books };
    });
  },

  deleteBook: (id) => {
    set((state) => ({
      books: state.books.filter((b) => b.id !== id),
      notes: state.notes.filter((n) => n.bookId !== id),
    }));
    setTimeout(() => get().saveToStorage(), 50);
  },

  addNote: (noteData) => {
    const newNote: Note = {
      id: generateId(),
      bookId: noteData.bookId,
      content: noteData.content,
      type: noteData.type || 'text',
      imageUrl: noteData.imageUrl,
      pageNumber: noteData.pageNumber,
      createTime: Date.now(),
    };
    set((state) => {
      const newState = { notes: [newNote, ...state.notes] };
      setTimeout(() => get().saveToStorage(), 50);
      return newState;
    });
    return newNote;
  },

  addReadingRecord: (bookId, minutes, newPage) => {
    const today = new Date().toISOString().split('T')[0];
    set((state) => {
      let books = state.books.map((b) => {
        if (b.id !== bookId) return b;
        const currentP = newPage !== undefined ? Math.min(newPage, b.totalPages) : b.currentPage;
        const updated: Book = {
          ...b,
          totalReadingTime: b.totalReadingTime + minutes,
          currentPage: currentP,
          lastReadTime: Date.now(),
          status: currentP >= b.totalPages ? 'finished' : currentP > 0 ? 'reading' : b.status,
        };
        return updated;
      });

      const readingRecords = [...state.readingRecords];
      const todayIdx = readingRecords.findIndex((r) => r.date === today);
      if (todayIdx >= 0) {
        readingRecords[todayIdx] = {
          ...readingRecords[todayIdx],
          minutes: readingRecords[todayIdx].minutes + minutes,
        };
      } else {
        readingRecords.push({ date: today, minutes });
      }
      readingRecords.sort((a, b) => a.date.localeCompare(b.date));
      if (readingRecords.length > 60) readingRecords.splice(0, readingRecords.length - 60);

      const totalTime = books.reduce((sum, b) => sum + b.totalReadingTime, 0);
      const finishedCount = books.filter((b) => b.status === 'finished').length;

      const challenges = state.challenges.map((c) => {
        if (c.status !== 'ongoing') return c;
        const participants = c.participants.map((p) => {
          if (p.userId !== 'me') return p;
          return { ...p, readingMinutes: p.readingMinutes + minutes };
        });
        return { ...c, participants, myProgress: c.myProgress + minutes };
      });

      challenges.forEach((c) => {
        if (c.status === 'ongoing') {
          setTimeout(() => get().checkChallengeCompletion(c.id), 100);
        }
      });

      const dailyPlans = state.dailyPlans.map((p) => {
        if (p.bookId !== bookId || p.date !== today) return p;
        return {
          ...p,
          completedMinutes: Math.min(p.completedMinutes + minutes, p.targetMinutes),
          completedPages: newPage !== undefined ? Math.min(newPage, p.targetPages) : p.completedPages,
        };
      });

      const newState = {
        books,
        readingRecords,
        challenges,
        dailyPlans,
        user: {
          ...state.user,
          totalReadingTime: totalTime,
          bookCount: books.length,
        },
      };
      setTimeout(() => get().saveToStorage(), 50);
      return newState;
    });
  },

  createBooklist: (data) => {
    const me = get().user;
    const newBooklist: Booklist = {
      id: generateId(),
      title: data.title,
      description: data.description || '',
      cover: data.cover || `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/400/300`,
      authorId: me.id,
      authorName: me.name,
      authorAvatar: me.avatar,
      books: data.books,
      bookCount: data.books.length,
      likes: 0,
      collections: 0,
      tags: data.tags || [],
      isLiked: false,
      isCollected: false,
      createTime: Date.now(),
    };
    set((state) => {
      const newState = { booklists: [newBooklist, ...state.booklists] };
      setTimeout(() => get().saveToStorage(), 50);
      return newState;
    });
    return newBooklist;
  },

  toggleBooklistLike: (id) => {
    set((state) => {
      const newState = {
        booklists: state.booklists.map((b) =>
          b.id === id
            ? {
                ...b,
                isLiked: !b.isLiked,
                likes: b.isLiked ? b.likes - 1 : b.likes + 1,
              }
            : b
        ),
      };
      setTimeout(() => get().saveToStorage(), 50);
      return newState;
    });
  },

  toggleBooklistCollect: (id) => {
    set((state) => {
      const newState = {
        booklists: state.booklists.map((b) =>
          b.id === id
            ? {
                ...b,
                isCollected: !b.isCollected,
                collections: b.isCollected ? b.collections - 1 : b.collections + 1,
              }
            : b
        ),
      };
      setTimeout(() => get().saveToStorage(), 50);
      return newState;
    });
  },

  createChallenge: (targetMinutes, friendId) => {
    const me = get().user;
    const friends = get().friends;
    let opponent: ChallengeParticipant;
    if (friendId) {
      opponent = friends.find((f) => f.userId === friendId) || friends[0];
    } else {
      opponent = friends[Math.floor(Math.random() * friends.length)];
    }
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const newChallenge: Challenge = {
      id: generateId(),
      title: `一周阅读 ${targetMinutes} 分钟挑战`,
      type: 'weekly',
      targetMinutes,
      startTime: now,
      endTime: now + week,
      status: 'ongoing',
      myProgress: 0,
      participants: [
        {
          userId: 'me',
          userName: me.name,
          userAvatar: me.avatar,
          readingMinutes: 0,
        },
        {
          ...opponent,
          readingMinutes: Math.floor(Math.random() * 30),
        },
      ],
    };
    set((state) => {
      const newState = { challenges: [newChallenge, ...state.challenges] };
      setTimeout(() => get().saveToStorage(), 50);
      return newState;
    });
    return newChallenge;
  },

  updateChallengeProgress: (challengeId, userId, addMinutes) => {
    set((state) => ({
      challenges: state.challenges.map((c) => {
        if (c.id !== challengeId) return c;
        return {
          ...c,
          myProgress: userId === 'me' ? c.myProgress + addMinutes : c.myProgress,
          participants: c.participants.map((p) =>
            p.userId === userId ? { ...p, readingMinutes: p.readingMinutes + addMinutes } : p
          ),
        };
      }),
    }));
    setTimeout(() => get().saveToStorage(), 50);
    setTimeout(() => get().checkChallengeCompletion(challengeId), 100);
  },

  checkChallengeCompletion: (challengeId) => {
    const state = get();
    const challenge = state.challenges.find((c) => c.id === challengeId);
    if (!challenge || challenge.status !== 'ongoing') return;

    const now = Date.now();
    if (now < challenge.endTime) {
      const allReached = challenge.participants.every((p) => p.readingMinutes >= challenge.targetMinutes);
      const anyReached = challenge.participants.some((p) => p.readingMinutes >= challenge.targetMinutes);
      if (!allReached && !anyReached) return;
    }

    const winner = [...challenge.participants].sort((a, b) => b.readingMinutes - a.readingMinutes)[0];
    const updatedChallenge: Challenge = {
      ...challenge,
      status: 'finished',
      participants: challenge.participants.map((p) => ({
        ...p,
        isWinner: p.userId === winner.userId,
      })),
    };

    let medals = [...state.medals];
    if (winner.userId === 'me') {
      const medal: Medal = {
        id: generateId(),
        name: `${challenge.title} - 胜利`,
        description: `恭喜在挑战中击败对手，目标 ${challenge.targetMinutes} 分钟`,
        icon: '🏆',
        obtainTime: Date.now(),
        isObtained: true,
      };
      medals.push(medal);
    }

    set({
      challenges: state.challenges.map((c) => (c.id === challengeId ? updatedChallenge : c)),
      medals,
    });
    setTimeout(() => get().saveToStorage(), 50);
  },

  generateDailyPlans: () => {
    const { books, readingRecords } = get();
    const today = new Date().toISOString().split('T')[0];
    const readingBooks = books.filter((b) => b.status === 'reading').slice(0, 3);

    const plans: DailyPlan[] = readingBooks.map((book) => {
      const remainPages = book.totalPages - book.currentPage;
      const avgSpeed = 2;
      const targetPages = Math.min(Math.max(15, Math.ceil(remainPages / 7)), remainPages, 50);
      const targetMinutes = Math.max(20, Math.ceil(targetPages / avgSpeed));

      const todayRecord = readingRecords.find((r) => r.date === today);
      const completedMinutes = todayRecord ? Math.min(Math.ceil(todayRecord.minutes / readingBooks.length), targetMinutes) : 0;
      const progressRatio = book.totalPages > 0 ? book.currentPage / book.totalPages : 0;
      const completedPages = Math.min(Math.floor(targetPages * (completedMinutes / Math.max(targetMinutes, 1))), targetPages);

      return {
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.cover,
        targetPages,
        completedPages,
        targetMinutes,
        completedMinutes,
        date: today,
      };
    });

    set({ dailyPlans: plans });
    setTimeout(() => get().saveToStorage(), 50);
    return plans;
  },

  generateRecommendBooks: () => {
    const { books, booklists } = get();
    const tagCount: Record<string, number> = {};

    books.forEach((b) => {
      const baseWeight = 1;
      const ratingBonus = (b.rating || 3) * 0.5;
      const timeBonus = Math.min(b.totalReadingTime / 120, 3);
      const statusBonus = b.status === 'reading' ? 1.5 : b.status === 'finished' ? 1 : 0.3;
      const weight = (baseWeight + ratingBonus + timeBonus) * statusBonus;
      b.tags.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + weight;
      });
      if (b.category) {
        tagCount[b.category] = (tagCount[b.category] || 0) + weight * 0.5;
      }
    });

    booklists.forEach((bl) => {
      let w = 0;
      if (bl.isCollected) w += 2;
      if (bl.isLiked) w += 1;
      if (bl.likes > 10) w += 0.5;
      if (w > 0) {
        bl.tags.forEach((t) => {
          tagCount[t] = (tagCount[t] || 0) + w;
        });
      }
    });

    const sortedTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t);

    const existingIds = new Set(books.map((b) => b.id));
    const mockRecommends: Book[] = [
      {
        id: 'rec-r1-' + generateId(),
        title: '思考的艺术',
        author: '文森特·赖安·拉吉罗',
        cover: 'https://picsum.photos/id/180/300/400',
        category: '心理',
        tags: ['思维', '认知', '心理学'],
        totalPages: 280,
        currentPage: 0,
        totalReadingTime: 0,
        description: '批判性思维的经典入门读物，帮助你打破思维定式。',
        rating: 4.6,
        addTime: Date.now(),
        status: 'wish',
      },
      {
        id: 'rec-r2-' + generateId(),
        title: '被讨厌的勇气',
        author: '岸见一郎',
        cover: 'https://picsum.photos/id/106/300/400',
        category: '心理',
        tags: ['心理学', '哲学', '自我提升'],
        totalPages: 256,
        currentPage: 0,
        totalReadingTime: 0,
        description: '阿德勒心理学的通俗解读，自我启发的必读书目。',
        rating: 4.7,
        addTime: Date.now(),
        status: 'wish',
      },
      {
        id: 'rec-r3-' + generateId(),
        title: '置身事内',
        author: '兰小欢',
        cover: 'https://picsum.photos/id/30/300/400',
        category: '商业',
        tags: ['经济', '中国', '商业'],
        totalPages: 340,
        currentPage: 0,
        totalReadingTime: 0,
        description: '从经济学视角理解中国政府与经济的关系。',
        rating: 4.8,
        addTime: Date.now(),
        status: 'wish',
      },
      {
        id: 'rec-r4-' + generateId(),
        title: '沙丘',
        author: '弗兰克·赫伯特',
        cover: 'https://picsum.photos/id/29/300/400',
        category: '科幻',
        tags: ['科幻', '经典', '小说'],
        totalPages: 528,
        currentPage: 0,
        totalReadingTime: 0,
        description: '科幻文学史上的里程碑作品，沙漠星球的史诗传奇。',
        rating: 4.7,
        addTime: Date.now(),
        status: 'wish',
      },
      {
        id: 'rec-r5-' + generateId(),
        title: '活着',
        author: '余华',
        cover: 'https://picsum.photos/id/20/300/400',
        category: '文学',
        tags: ['小说', '经典', '文学'],
        totalPages: 240,
        currentPage: 0,
        totalReadingTime: 0,
        description: '讲述了农村人福贵悲惨的人生遭遇，中国当代文学的经典。',
        rating: 4.9,
        addTime: Date.now(),
        status: 'wish',
      },
      {
        id: 'rec-r6-' + generateId(),
        title: '人类简史',
        author: '尤瓦尔·赫拉利',
        cover: 'https://picsum.photos/id/48/300/400',
        category: '历史',
        tags: ['历史', '认知', '人类学'],
        totalPages: 440,
        currentPage: 0,
        totalReadingTime: 0,
        description: '从认知革命到科学革命，一部宏大的人类发展史。',
        rating: 4.8,
        addTime: Date.now(),
        status: 'wish',
      },
      {
        id: 'rec-r7-' + generateId(),
        title: '原则',
        author: '瑞·达利欧',
        cover: 'https://picsum.photos/id/56/300/400',
        category: '商业',
        tags: ['商业', '思维', '管理'],
        totalPages: 560,
        currentPage: 0,
        totalReadingTime: 0,
        description: '桥水基金创始人分享的生活与工作原则。',
        rating: 4.5,
        addTime: Date.now(),
        status: 'wish',
      },
      {
        id: 'rec-r8-' + generateId(),
        title: '三体',
        author: '刘慈欣',
        cover: 'https://picsum.photos/id/96/300/400',
        category: '科幻',
        tags: ['科幻', '小说', '中国'],
        totalPages: 680,
        currentPage: 0,
        totalReadingTime: 0,
        description: '中国科幻文学巅峰之作，地球文明与三体世界的史诗。',
        rating: 4.9,
        addTime: Date.now(),
        status: 'wish',
      },
    ];

    const scored = mockRecommends
      .filter((b) => !existingIds.has(b.id))
      .map((b) => {
        let score = 0;
        b.tags.forEach((t) => {
          if (tagCount[t]) score += tagCount[t];
        });
        if (tagCount[b.category]) score += tagCount[b.category] * 0.5;
        score += (b.rating || 3) * 0.3;
        score += Math.random() * 0.5;
        return { b, score };
      });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 4).map((x) => x.b);
  },

  getMonthlyReport: (month) => {
    const { books, notes, readingRecords, dailyPlans } = get();
    const now = new Date();
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const startOfMonth = new Date(targetMonth + '-01T00:00:00').getTime();
    const endOfMonth = new Date(targetMonth + '-01T00:00:00');
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    const endTime = endOfMonth.getTime();

    const monthRecords = readingRecords.filter((r) => {
      const t = new Date(r.date).getTime();
      return t >= startOfMonth && t < endTime;
    });
    const totalReadingTime = monthRecords.reduce((sum, r) => sum + r.minutes, 0);

    const monthNotes = notes.filter((n) => n.createTime >= startOfMonth && n.createTime < endTime);
    const noteCount = monthNotes.length;

    const monthBooks = books.filter(
      (b) =>
        (b.lastReadTime && b.lastReadTime >= startOfMonth && b.lastReadTime < endTime) ||
        (b.addTime >= startOfMonth && b.addTime < endTime) ||
        b.status === 'finished'
    );
    const bookCount = monthBooks.length;
    const finishedBooks = monthBooks.filter((b) => b.status === 'finished').length;

    const activeDays = monthRecords.filter((r) => r.minutes > 0).length;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const completionRate = daysInMonth > 0 ? Math.round((activeDays / daysInMonth) * 100) : 0;
    const dailyAverage = activeDays > 0 ? Math.round(totalReadingTime / activeDays) : 0;

    const categoryMap: Record<string, number> = {};
    monthBooks.forEach((b) => {
      categoryMap[b.category] = (categoryMap[b.category] || 0) + 1;
    });
    const categories = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

    return {
      month: targetMonth,
      totalReadingTime,
      bookCount,
      finishedBooks,
      noteCount,
      completionRate,
      dailyAverage,
      categories,
    };
  },

  exportMonthlyReportPDF: async (month) => {
    const report = get().getMonthlyReport(month);
    const { books, readingRecords } = get();
    const finishedInMonth = books.filter(
      (b) => b.status === 'finished' && b.lastReadTime && new Date(b.lastReadTime).toISOString().startsWith(report.month)
    );

    const startOfMonth = new Date(report.month + '-01T00:00:00').getTime();
    const endOfMonth = new Date(report.month + '-01T00:00:00');
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    const endTime = endOfMonth.getTime();
    const daysInMonth = new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), 0).getDate();

    const dailyData: { day: number; minutes: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${report.month}-${String(d).padStart(2, '0')}`;
      const r = readingRecords.find((x) => x.date === key);
      dailyData.push({ day: d, minutes: r ? r.minutes : 0 });
    }
    const maxMinutes = Math.max(30, ...dailyData.map((d) => d.minutes));

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>悦读月度报告_${report.month}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #fff; color: #1D2129; }
    @page { size: A4; margin: 10mm; }
    .page { max-width: 1000px; margin: 0 auto; padding: 40px; }
    .header { background: linear-gradient(135deg, #4A7BFD 0%, #7BA1FF 100%); color: white; padding: 50px 40px; border-radius: 20px; text-align: center; }
    .header h1 { font-size: 38px; margin-bottom: 10px; letter-spacing: 2px; }
    .header p { font-size: 18px; opacity: 0.92; }
    .section { margin-top: 36px; }
    .section-title { font-size: 22px; font-weight: 600; color: #1D2129; margin-bottom: 18px; padding-left: 12px; border-left: 4px solid #4A7BFD; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-card { background: #F7F8FA; border-radius: 14px; padding: 24px 16px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; color: #4A7BFD; line-height: 1.2; }
    .stat-unit { font-size: 14px; color: #4A7BFD; margin-left: 4px; font-weight: 500; }
    .stat-label { font-size: 14px; color: #4E5969; margin-top: 6px; }
    .highlight { background: #FFF6EC; border-radius: 14px; padding: 24px 28px; margin-top: 10px; border: 1px solid #FFE4C7; }
    .highlight h3 { color: #FF9A3C; margin-bottom: 8px; font-size: 18px; }
    .highlight p { color: #4E5969; line-height: 1.9; font-size: 15px; }
    .highlight strong { color: #1D2129; }
    .chart-wrap { margin-top: 10px; }
    .chart-bars { display: flex; align-items: flex-end; gap: 4px; height: 180px; padding: 0 6px; border-bottom: 1px solid #E5E6EB; }
    .bar { flex: 1; background: linear-gradient(180deg, #4A7BFD 0%, #7BA1FF 100%); border-radius: 4px 4px 0 0; min-height: 4px; transition: all 0.3s; }
    .bar.zero { background: #F2F3F5; }
    .bar-labels { display: flex; gap: 4px; margin-top: 8px; padding: 0 6px; }
    .bar-label { flex: 1; text-align: center; font-size: 10px; color: #86909C; }
    .books-list { margin-top: 10px; }
    .book-item { display: flex; gap: 16px; padding: 16px; background: #F7F8FA; border-radius: 12px; margin-bottom: 10px; align-items: center; }
    .book-cover { width: 50px; height: 70px; border-radius: 6px; background: linear-gradient(135deg, #A0B8FF, #4A7BFD); flex-shrink: 0; }
    .book-info { flex: 1; }
    .book-info h4 { font-size: 16px; color: #1D2129; margin-bottom: 4px; }
    .book-info p { font-size: 13px; color: #86909C; }
    .categories { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .category-tag { padding: 8px 16px; background: #E8F0FF; color: #4A7BFD; border-radius: 20px; font-size: 14px; font-weight: 500; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #F2F3F5; text-align: center; color: #86909C; font-size: 13px; }
    .print-tip { background: #E8F0FF; color: #4A7BFD; padding: 14px 20px; border-radius: 10px; text-align: center; margin-bottom: 20px; font-size: 14px; }
    .print-tip strong { font-size: 16px; }
    @media print {
      .print-tip { display: none; }
      .page { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="print-tip">
      <strong>📄 请使用浏览器打印功能保存为 PDF</strong><br/>
      快捷键：Ctrl + P（Windows）或 Cmd + P（Mac），目标选择「另存为 PDF」
    </div>
    <div class="header">
      <h1>📚 悦读月度报告</h1>
      <p>${report.month.replace('-', ' 年 ')} 月 · 你的阅读足迹</p>
    </div>

    <div class="section">
      <div class="section-title">核心数据</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${Math.floor(report.totalReadingTime / 60)}<span class="stat-unit">小时${report.totalReadingTime % 60}分</span></div>
          <div class="stat-label">累计阅读时长</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.bookCount}<span class="stat-unit">本</span></div>
          <div class="stat-label">阅读书籍数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.finishedBooks}<span class="stat-unit">本</span></div>
          <div class="stat-label">完本数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.noteCount}<span class="stat-unit">条</span></div>
          <div class="stat-label">笔记条数</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">本月亮点</div>
      <div class="highlight">
        <h3>✨ 本月总结</h3>
        <p>
          这个月你一共阅读了 <strong>${Math.floor(report.totalReadingTime / 60)} 小时 ${report.totalReadingTime % 60} 分钟</strong>，
          活跃 <strong>${report.completionRate}%</strong> 的天数，日均阅读 <strong>${report.dailyAverage} 分钟</strong>。
          ${report.finishedBooks > 0 ? `你完成了 <strong>${report.finishedBooks}</strong> 本书，太厉害了！` : '继续加油，争取下个月读完更多书～'}
          ${report.noteCount > 0 ? `累计记录了 <strong>${report.noteCount}</strong> 条读书笔记。` : ''}
        </p>
      </div>
    </div>

    ${report.categories.length > 0 ? `
    <div class="section">
      <div class="section-title">阅读偏好</div>
      <div class="categories">
        ${report.categories.map((c) => `<span class="category-tag">${c.category} · ${c.count}本</span>`).join('')}
      </div>
    </div>` : ''}

    <div class="section">
      <div class="section-title">每日阅读时长（分钟）</div>
      <div class="chart-wrap">
        <div class="chart-bars">
          ${dailyData
            .map(
              (d) =>
                `<div class="bar ${d.minutes === 0 ? 'zero' : ''}" style="height: ${Math.max(
                  4,
                  (d.minutes / maxMinutes) * 160
                )}px" title="${d.day}日：${d.minutes}分钟"></div>`
            )
            .join('')}
        </div>
        <div class="bar-labels">
          ${dailyData
            .map((d) => `<div class="bar-label">${d.day % 5 === 1 || d.day === daysInMonth ? d.day : ''}</div>`)
            .join('')}
        </div>
      </div>
    </div>

    ${finishedInMonth.length > 0 ? `
    <div class="section">
      <div class="section-title">本月读完</div>
      <div class="books-list">
        ${finishedInMonth
          .map(
            (b) => `
          <div class="book-item">
            <div class="book-cover"></div>
            <div class="book-info">
              <h4>${b.title}</h4>
              <p>${b.author} · 共 ${b.totalPages} 页 · 阅读 ${formatTimeStore(b.totalReadingTime)}</p>
            </div>
          </div>`
          )
          .join('')}
      </div>
    </div>` : ''}

    <div class="footer">
      由 悦读 APP 自动生成 · 生成时间 ${new Date().toLocaleString('zh-CN')}
    </div>
  </div>
  <script>
    window.onload = function() {
      document.title = '悦读月度报告_${report.month}';
      setTimeout(function() {
        if (window.confirm('是否立即打印/保存为 PDF？\\n\\n选择「另存为 PDF」即可保存文件')) {
          window.print();
        }
      }, 500);
    };
  </script>
</body>
</html>`;

    const fileName = `阅读报告_${report.month}.pdf`;

    try {
      if (process.env.TARO_ENV === 'h5' && typeof window !== 'undefined') {
        const win = window.open('', '_blank');
        if (win) {
          win.document.open();
          win.document.write(htmlContent);
          win.document.close();
          Taro.showToast({ title: '报告已生成，请在新窗口保存为 PDF', icon: 'none', duration: 2500 });
        } else {
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.click();
          URL.revokeObjectURL(url);
          Taro.showToast({ title: '报告已在新窗口打开', icon: 'none', duration: 2500 });
        }
      } else {
        const fs = Taro.getFileSystemManager();
        const filePath = `${Taro.env.USER_DATA_PATH || ''}/${fileName.replace('.pdf', '.html')}`;
        fs.writeFileSync(filePath, htmlContent, 'utf8');
        Taro.showToast({ title: '报告已生成', icon: 'success' });
      }
      return fileName;
    } catch (e) {
      console.warn('导出失败', e);
      if (process.env.TARO_ENV === 'h5' && typeof window !== 'undefined') {
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.click();
        URL.revokeObjectURL(url);
      }
      throw e;
    }
  },
}));

export default useAppStore;
