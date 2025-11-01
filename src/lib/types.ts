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
  isRealData?: boolean; // Flag to indicate if data is from real API or fallback
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
  id: string;
  userId: string;
  symbol: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistItemWithQuote extends UserWatchlistItem {
  quote?: MarketQuote;
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

// Database article type with all fields including AI image generation
export interface DatabaseArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image?: string | null;
  cover_alt?: string | null;
  region: Region;
  category: Category;
  tags: string[] | null;
  author_id: string;
  author_name: string;
  author_role: string;
  status: 'draft' | 'review' | 'published' | 'rejected';
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  featured: boolean;
  est_read_min: number;
  views?: number;
  reviewer_id?: string | null;
  review_notes?: string | null;
  submission_notes?: string | null;
  // AI Image Generation fields
  request_ai_image?: boolean;
  ai_image_url?: string | null;
  ai_image_prompt?: string | null;
  ai_image_status?: 'pending' | 'generating' | 'completed' | 'failed' | null;
}

// Article Review type
export interface ArticleReview {
  id: string;
  article_id: string;
  reviewer_id: string;
  status: 'approved' | 'rejected' | 'needs_changes';
  comments: string | null;
  created_at: string;
  updated_at: string;
}