export type ThemeType = 'light' | 'dark';

export interface Post {
  id: string;
  content: string;
  timestamp: number;
  reactions: {
    hearts: number;
    flames: number;
    frowns: number;
  };
  category?: Category;
  userReactions: {
    [userId: string]: 'hearts' | 'flames' | 'frowns';
  };
  replies: Reply[];
}

export type Category = 'trauma' | 'secrets' | 'confession' | 'body-count' | 'heartbreak' | 'healing' | 'pressure' | 'anxiety' | 'family' | 'success' | 'other';

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
}

export interface Reply {
  id: string;
  content: string;
  timestamp: number;
  userId: string;
}