// Core data types for The Mane Review

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Contributor' | 'Student' | 'Reader';
  avatar?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // Markdown content
  coverImage?: string;
  coverAlt?: string;
  region: 'Brazil' | 'USA' | 'Europe' | 'Asia';
  category: 'Markets' | 'Opinion';
  tags: string[];
  authorId: string;
  authorRole: User['role'];
  status: 'draft' | 'review' | 'published';
  publishedAt?: Date;
  updatedAt: Date;
  featured: boolean;
  estReadMin: number;
  views?: number;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayRange: { low: number; high: number };
  fiftyTwoWeekRange: { low: number; high: number };
  volume: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  lastUpdated: Date;
}

export interface CommunityWatchlistItem {
  id: string;
  symbol: string;
  name: string;
  rationale: string;
  active: boolean;
  sortOrder: number;
}

export interface UserWatchlistItem {
  userId: string;
  symbol: string;
  createdAt: Date;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: Date;
  confirmed: boolean;
}

export interface EarningsCall {
  symbol: string;
  companyName: string;
  marketCap: number; // in billions USD
  earningsDate: Date;
  estimatedEPS: number;
  previousEPS: number;
  sector: string;
  region: Region;
}

export type Region = 'South America' | 'USA' | 'Europe' | 'Asia';
export type Category = 'Markets' | 'Opinion';