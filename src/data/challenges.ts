import { Challenge, Medal } from '@/types';

export const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: '一周阅读挑战',
    type: 'weekly',
    targetMinutes: 300,
    startTime: Date.now() - 86400000 * 2,
    endTime: Date.now() + 86400000 * 5,
    status: 'ongoing',
    participants: [
      {
        userId: 'me',
        userName: '我',
        userAvatar: 'https://picsum.photos/id/64/100/100',
        readingMinutes: 120,
      },
      {
        userId: 'friend1',
        userName: '小明',
        userAvatar: 'https://picsum.photos/id/91/100/100',
        readingMinutes: 180,
      },
    ],
    myProgress: 40,
  },
  {
    id: '2',
    title: '30天阅读习惯养成',
    type: 'weekly',
    targetMinutes: 1500,
    startTime: Date.now() - 86400000 * 20,
    endTime: Date.now() + 86400000 * 10,
    status: 'ongoing',
    participants: [
      {
        userId: 'me',
        userName: '我',
        userAvatar: 'https://picsum.photos/id/64/100/100',
        readingMinutes: 850,
      },
      {
        userId: 'friend2',
        userName: '书虫阿花',
        userAvatar: 'https://picsum.photos/id/177/100/100',
        readingMinutes: 920,
      },
    ],
    myProgress: 57,
  },
];

export const mockMedals: Medal[] = [
  {
    id: '1',
    name: '初次阅读',
    description: '完成第一次阅读记录',
    icon: '📖',
    isObtained: true,
    obtainTime: Date.now() - 86400000 * 90,
  },
  {
    id: '2',
    name: '连续7天',
    description: '连续阅读7天',
    icon: '🔥',
    isObtained: true,
    obtainTime: Date.now() - 86400000 * 60,
  },
  {
    id: '3',
    name: '书籍收藏家',
    description: '收藏10本书',
    icon: '📚',
    isObtained: true,
    obtainTime: Date.now() - 86400000 * 30,
  },
  {
    id: '4',
    name: '挑战达人',
    description: '完成一次阅读挑战',
    icon: '🏆',
    isObtained: true,
    obtainTime: Date.now() - 86400000 * 15,
  },
  {
    id: '5',
    name: '笔记达人',
    description: '累计记录50条笔记',
    icon: '✍️',
    isObtained: false,
  },
  {
    id: '6',
    name: '月度冠军',
    description: '月度阅读时长超过20小时',
    icon: '👑',
    isObtained: false,
  },
  {
    id: '7',
    name: '书评达人',
    description: '发布3篇高质量书评',
    icon: '⭐',
    isObtained: false,
  },
  {
    id: '8',
    name: '连续30天',
    description: '连续阅读30天',
    icon: '💎',
    isObtained: false,
  },
];

export const mockFriends = [
  {
    id: 'f1',
    name: '小明',
    avatar: 'https://picsum.photos/id/91/100/100',
    readingTime: 1250,
    level: 6,
  },
  {
    id: 'f2',
    name: '书虫阿花',
    avatar: 'https://picsum.photos/id/177/100/100',
    readingTime: 2340,
    level: 8,
  },
  {
    id: 'f3',
    name: '阅读小王子',
    avatar: 'https://picsum.photos/id/338/100/100',
    readingTime: 890,
    level: 4,
  },
];
