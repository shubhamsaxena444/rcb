import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from 'drizzle-orm';

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

//Relations will be defined after all tables are created

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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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

//Project relations will be defined after all tables are created

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Quote model
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  contractorId: integer("contractor_id").notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default("pending"),
  amount: integer("amount"),
  description: text("description"),
  timeline: text("timeline"),
  createdAt: timestamp("created_at").defaultNow(),
  details: json("details")
});

//Quote relations will be defined after all tables are created

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

// Review model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  contractorId: integer("contractor_id").notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: 'set null' }),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

//Review relations will be defined after all tables are created

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

// Define relations after all tables are created
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  reviews: many(reviews),
}));

export const contractorsRelations = relations(contractors, ({ many }) => ({
  quotes: many(quotes),
  reviews: many(reviews),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  project: one(projects, {
    fields: [quotes.projectId],
    references: [projects.id],
  }),
  contractor: one(contractors, {
    fields: [quotes.contractorId],
    references: [contractors.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  contractor: one(contractors, {
    fields: [reviews.contractorId],
    references: [contractors.id],
  }),
  project: one(projects, {
    fields: [reviews.projectId],
    references: [projects.id],
  }),
}));

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
