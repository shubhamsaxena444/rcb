import { users, type User, type InsertUser, contractors, type Contractor, type InsertContractor, projects, type Project, type InsertProject, quotes, type Quote, type InsertQuote, reviews, type Review, type InsertReview } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, like, desc, asc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { IStorage } from "./storage";

// PostgreSQL session store for express-session
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: any; // express-session store

  constructor() {
    // Initialize session store with PostgreSQL
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Seed initial contractors if needed
    this.seedContractorsIfNeeded();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Contractor methods
  async getContractor(id: number): Promise<Contractor | undefined> {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, id));
    return contractor;
  }
  
  async getAllContractors(): Promise<Contractor[]> {
    return await db.select().from(contractors);
  }
  
  async getContractorsBySpecialty(specialty: string): Promise<Contractor[]> {
    // Using contains operator for array columns is tricky, so we'll filter in JS for now
    const allContractors = await db.select().from(contractors);
    return allContractors.filter(contractor => 
      contractor.specialties && Array.isArray(contractor.specialties) && 
      contractor.specialties.includes(specialty)
    );
  }
  
  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const [contractor] = await db.insert(contractors).values(insertContractor).returning();
    return contractor;
  }
  
  async updateContractorRating(id: number, rating: number, reviewCount: number): Promise<void> {
    await db.update(contractors)
      .set({ rating, reviewCount })
      .where(eq(contractors.id, id));
  }
  
  async searchContractors(query: string): Promise<Contractor[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    return await db.select().from(contractors)
      .where(
        sql`LOWER(${contractors.name}) LIKE ${lowercaseQuery} OR 
            LOWER(${contractors.description}) LIKE ${lowercaseQuery} OR 
            LOWER(${contractors.specialty}) LIKE ${lowercaseQuery} OR 
            LOWER(${contractors.location}) LIKE ${lowercaseQuery}`
      );
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set({ ...projectUpdate, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    
    return updatedProject;
  }
  
  // Quote methods
  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }
  
  async getQuotesByProjectId(projectId: number): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.projectId, projectId));
  }
  
  async getQuotesByContractorId(contractorId: number): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.contractorId, contractorId));
  }
  
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    return quote;
  }
  
  async updateQuote(id: number, quoteUpdate: Partial<Quote>): Promise<Quote | undefined> {
    const [updatedQuote] = await db.update(quotes)
      .set(quoteUpdate)
      .where(eq(quotes.id, id))
      .returning();
    
    return updatedQuote;
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async getReviewsByContractorId(contractorId: number): Promise<Review[]> {
    return await db.select()
      .from(reviews)
      .where(eq(reviews.contractorId, contractorId))
      .orderBy(desc(reviews.createdAt));
  }
  
  async getReviewsByUserId(userId: number): Promise<Review[]> {
    return await db.select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    
    // Update contractor rating
    const contractorReviews = await this.getReviewsByContractorId(review.contractorId);
    const totalRating = contractorReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / contractorReviews.length;
    await this.updateContractorRating(
      review.contractorId, 
      avgRating, 
      contractorReviews.length
    );
    
    return review;
  }
  
  // Seed initial contractors if none exist
  private async seedContractorsIfNeeded() {
    const existingContractors = await this.getAllContractors();
    
    if (existingContractors.length === 0) {
      const initialContractors: InsertContractor[] = [
        {
          name: "Sharma Construction",
          description: "Specializing in full home renovations with over 15 years of experience. Licensed and insured.",
          specialty: "General",
          profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
          email: "info@sharmaconstruction.com",
          phone: "+91 98765 43210",
          specialties: ["Kitchen", "Bathroom", "Vastu Compliant"],
          location: "Delhi, India"
        },
        {
          name: "Luxury Kitchen Designs",
          description: "Luxury kitchen renovations and custom cabinetry. Award-winning designs and certified installers.",
          specialty: "Specialist",
          profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
          email: "design@luxurykitchens.co.in",
          phone: "+91 87654 32109",
          specialties: ["Modular Kitchens", "Cabinets", "Granite Countertops"],
          location: "Mumbai, India"
        },
        {
          name: "Modern Bath Solutions",
          description: "Complete bathroom remodeling services. Specializing in accessible designs and quick turnarounds.",
          specialty: "Specialist",
          profileImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
          email: "info@modernbath.co.in",
          phone: "+91 76543 21098",
          specialties: ["Bathrooms", "Jacuzzi", "Accessible"],
          location: "Bangalore, India"
        },
        {
          name: "Patel Home Builders",
          description: "Custom home construction and major renovations with attention to detail and quality craftsmanship.",
          specialty: "General",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
          email: "build@patelhomes.in",
          phone: "+91 65432 10987",
          specialties: ["New Construction", "Bungalows", "Duplex Homes"],
          location: "Ahmedabad, India"
        },
        {
          name: "Eco-Friendly Renovations",
          description: "Sustainable and environmentally conscious renovation services using recycled materials and energy-efficient designs.",
          specialty: "Specialist",
          profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
          email: "green@ecofriendly.co.in",
          phone: "+91 54321 09876",
          specialties: ["Solar Integration", "Energy Efficiency", "Sustainable Materials"],
          location: "Pune, India"
        },
        {
          name: "Mehta Electrical Services",
          description: "Professional electrical contractors for residential and commercial projects. Full-service from wiring to smart home installations.",
          specialty: "Electrical",
          profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
          email: "service@mehtaelectrical.in",
          phone: "+91 43210 98765",
          specialties: ["Electrical", "Lighting", "Smart Home"],
          location: "Chennai, India"
        }
      ];
      
      for (const contractor of initialContractors) {
        await this.createContractor(contractor);
      }
    }
  }
}