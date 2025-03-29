import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Contractor model
export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  specialty: text("specialty").notNull(),
  profileImage: text("profile_image"),
  email: text("email").notNull(),
  phone: text("phone"),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  specialties: text("specialties").array(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
});

// Project model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("planning"),
  estimatedCostMin: integer("estimated_cost_min"),
  estimatedCostMax: integer("estimated_cost_max"),
  actualCost: integer("actual_cost"),
  timeline: text("timeline"),
  location: text("location"),
  squareFootage: integer("square_footage"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  details: json("details")
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Quote model
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  contractorId: integer("contractor_id").notNull(),
  status: text("status").notNull().default("pending"),
  amount: integer("amount"),
  description: text("description"),
  timeline: text("timeline"),
  createdAt: timestamp("created_at").defaultNow(),
  details: json("details")
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

// Review model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contractorId: integer("contractor_id").notNull(),
  projectId: integer("project_id"),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Estimate request schema (for API)
export const renovationEstimateSchema = z.object({
  renovationType: z.string(),
  squareFootage: z.number(),
  qualityLevel: z.string(),
  location: z.string(),
  scope: z.string(),
});

export const constructionEstimateSchema = z.object({
  constructionType: z.string(),
  squareFootage: z.number(),
  stories: z.string(),
  qualityLevel: z.string(),
  location: z.string(),
  lotSize: z.string(),
  details: z.string(),
});

export const quoteRequestSchema = z.object({
  projectId: z.number(),
  contractorIds: z.array(z.number()),
  message: z.string().optional(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type RenovationEstimate = z.infer<typeof renovationEstimateSchema>;
export type ConstructionEstimate = z.infer<typeof constructionEstimateSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
