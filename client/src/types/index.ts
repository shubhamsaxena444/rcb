import { User, Contractor, Project, Quote, Review } from "@shared/schema";

export type UserWithoutPassword = Omit<User, "password">;

export type EstimationResult = {
  totalCost: string;
  breakdown: {
    [key: string]: string;
  };
  recommendations: string;
  timeline: string;
  raw: any;
};

export type RenovationFormData = {
  renovationType: string;
  squareFootage: number;
  qualityLevel: string;
  location: string;
  scope: string;
};

export type ConstructionFormData = {
  constructionType: string;
  squareFootage: number;
  stories: string;
  qualityLevel: string;
  location: string;
  lotSize: string;
  details: string;
};

export type QuoteRequestFormData = {
  projectId: number;
  contractorIds: number[];
  message?: string;
};

export type ReviewFormData = {
  contractorId: number;
  projectId?: number;
  rating: number;
  review: string;
};

export type ProjectStats = {
  total: number;
  inProgress: number;
  completed: number;
  planning: number;
};

export type ContractorSearchParams = {
  query?: string;
  specialty?: string;
};

export type ProjectFormData = {
  name: string;
  type: string;
  description: string;
  status: string;
  location: string;
  squareFootage?: number;
  timeline?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  details?: any;
};

export type QuoteStatus = "pending" | "received" | "accepted" | "rejected" | "completed";

export type ProjectWithQuotes = Project & {
  quotes: Quote[];
};

export type ContractorWithReviews = Contractor & {
  reviews: Review[];
};
