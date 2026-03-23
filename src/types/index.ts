import { Timestamp } from "firebase/firestore";

// ============================================================
// TYPES PRINCIPAUX DE TRUTH OF NEWS
// ============================================================

export type ArticleStatus = "draft" | "published";

export type ArticleCategory =
  | "politique"
  | "gouvernement"
  | "elections"
  | "economie"
  | "societe"
  | "international"
  | "securite"
  | "culture";

export interface Category {
  id: ArticleCategory;
  label: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "politique", label: "Politique", color: "#1a3a6b" },
  { id: "gouvernement", label: "Gouvernement", color: "#2550eb" },
  { id: "elections", label: "Élections", color: "#e8112d" },
  { id: "economie", label: "Économie", color: "#008751" },
  { id: "societe", label: "Société", color: "#7c3aed" },
  { id: "international", label: "International", color: "#0891b2" },
  { id: "securite", label: "Sécurité", color: "#9f1239" },
  { id: "culture", label: "Culture", color: "#c8a217" },
];

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  imageAlt?: string;
  category: ArticleCategory;
  status: ArticleStatus;
  authorId: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  tags?: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  publishedAt?: Timestamp | Date | null;
}

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  category: ArticleCategory;
  status: ArticleStatus;
  tags: string[];
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "admin" | "user";
  createdAt: Timestamp | Date;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalComments: number;
  totalViews: number;
}
