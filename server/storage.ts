import { 
  users, type User, type InsertUser, 
  contractors, type Contractor, type InsertContractor, 
  projects, type Project, type InsertProject, 
  quotes, type Quote, type InsertQuote, 
  reviews, type Review, type InsertReview,
  designInspirations, type SavedDesignInspiration, type InsertDesignInspiration
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contractor methods
  getContractor(id: number): Promise<Contractor | undefined>;
  getAllContractors(): Promise<Contractor[]>;
  getContractorsBySpecialty(specialty: string): Promise<Contractor[]>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  updateContractorRating(id: number, rating: number, reviewCount: number): Promise<void>;
  searchContractors(query: string): Promise<Contractor[]>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  
  // Quote methods
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotesByProjectId(projectId: number): Promise<Quote[]>;
  getQuotesByContractorId(contractorId: number): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<Quote>): Promise<Quote | undefined>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByContractorId(contractorId: number): Promise<Review[]>;
  getReviewsByUserId(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Design Inspiration methods
  getDesignInspiration(id: number): Promise<SavedDesignInspiration | undefined>;
  getDesignInspirationsByUserId(userId: number): Promise<SavedDesignInspiration[]>;
  createDesignInspiration(inspiration: InsertDesignInspiration): Promise<SavedDesignInspiration>;
  
  // Session store
  sessionStore: any; // express-session store
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contractors: Map<number, Contractor>;
  private projects: Map<number, Project>;
  private quotes: Map<number, Quote>;
  private reviews: Map<number, Review>;
  private designInspirations: Map<number, SavedDesignInspiration>;
  
  private userId: number;
  private contractorId: number;
  private projectId: number;
  private quoteId: number;
  private reviewId: number;
  private designInspirationId: number;
  
  public sessionStore: any; // express-session store

  constructor() {
    this.users = new Map();
    this.contractors = new Map();
    this.projects = new Map();
    this.quotes = new Map();
    this.reviews = new Map();
    this.designInspirations = new Map();
    
    this.userId = 1;
    this.contractorId = 1;
    this.projectId = 1;
    this.quoteId = 1;
    this.reviewId = 1;
    this.designInspirationId = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    
    // Initialize with sample contractors
    this.seedContractors();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  // Contractor methods
  async getContractor(id: number): Promise<Contractor | undefined> {
    return this.contractors.get(id);
  }
  
  async getAllContractors(): Promise<Contractor[]> {
    return Array.from(this.contractors.values());
  }
  
  async getContractorsBySpecialty(specialty: string): Promise<Contractor[]> {
    return Array.from(this.contractors.values()).filter(
      (contractor) => contractor.specialties && 
      Array.isArray(contractor.specialties) && 
      contractor.specialties.includes(specialty)
    );
  }
  
  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const id = this.contractorId++;
    const contractor: Contractor = { 
      ...insertContractor, 
      id, 
      rating: 0, 
      reviewCount: 0, 
      createdAt: new Date(),
      specialties: insertContractor.specialties || null,
      profileImage: insertContractor.profileImage || null,
      phone: insertContractor.phone || null
    };
    this.contractors.set(id, contractor);
    return contractor;
  }
  
  async updateContractorRating(id: number, rating: number, reviewCount: number): Promise<void> {
    const contractor = this.contractors.get(id);
    if (contractor) {
      contractor.rating = rating;
      contractor.reviewCount = reviewCount;
      this.contractors.set(id, contractor);
    }
  }
  
  async searchContractors(query: string): Promise<Contractor[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.contractors.values()).filter(
      (contractor) => 
        contractor.name.toLowerCase().includes(lowercaseQuery) ||
        contractor.description.toLowerCase().includes(lowercaseQuery) ||
        contractor.specialty.toLowerCase().includes(lowercaseQuery) ||
        contractor.location.toLowerCase().includes(lowercaseQuery) ||
        (contractor.specialties && 
         Array.isArray(contractor.specialties) && 
         contractor.specialties.some(spec => spec.toLowerCase().includes(lowercaseQuery)))
    );
  }
  
  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: now, 
      updatedAt: now,
      status: insertProject.status || 'planning',
      location: insertProject.location || null,
      estimatedCostMin: insertProject.estimatedCostMin || null,
      estimatedCostMax: insertProject.estimatedCostMax || null,
      timeline: insertProject.timeline || null,
      squareFootage: insertProject.squareFootage || null,
      details: insertProject.details || null,
      actualCost: null
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (project) {
      const updatedProject: Project = { 
        ...project, 
        ...projectUpdate, 
        updatedAt: new Date() 
      };
      this.projects.set(id, updatedProject);
      return updatedProject;
    }
    return undefined;
  }
  
  // Quote methods
  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }
  
  async getQuotesByProjectId(projectId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.projectId === projectId
    );
  }
  
  async getQuotesByContractorId(contractorId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.contractorId === contractorId
    );
  }
  
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.quoteId++;
    const quote: Quote = { 
      ...insertQuote, 
      id, 
      createdAt: new Date(),
      status: insertQuote.status || 'pending',
      description: insertQuote.description || null,
      timeline: insertQuote.timeline || null,
      amount: insertQuote.amount || null,
      details: insertQuote.details || null
    };
    this.quotes.set(id, quote);
    return quote;
  }
  
  async updateQuote(id: number, quoteUpdate: Partial<Quote>): Promise<Quote | undefined> {
    const quote = this.quotes.get(id);
    if (quote) {
      const updatedQuote: Quote = { 
        ...quote, 
        ...quoteUpdate
      };
      this.quotes.set(id, updatedQuote);
      return updatedQuote;
    }
    return undefined;
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByContractorId(contractorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.contractorId === contractorId
    );
  }
  
  async getReviewsByUserId(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId
    );
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: new Date(),
      projectId: insertReview.projectId || null,
      review: insertReview.review || null
    };
    this.reviews.set(id, review);
    
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
  
  // Design Inspiration methods
  async getDesignInspiration(id: number): Promise<SavedDesignInspiration | undefined> {
    return this.designInspirations.get(id);
  }
  
  async getDesignInspirationsByUserId(userId: number): Promise<SavedDesignInspiration[]> {
    return Array.from(this.designInspirations.values()).filter(
      (inspiration) => inspiration.user_id === userId
    );
  }
  
  async createDesignInspiration(insertInspiration: InsertDesignInspiration): Promise<SavedDesignInspiration> {
    const id = this.designInspirationId++;
    const inspiration: SavedDesignInspiration = {
      ...insertInspiration,
      id,
      created_at: new Date(),
      description: insertInspiration.description || null,
      image_url: insertInspiration.image_url || null,
      prompt: insertInspiration.prompt || null,
      tips: insertInspiration.tips || [],
    };
    this.designInspirations.set(id, inspiration);
    return inspiration;
  }
  
  // Seed data for initial contractors
  private seedContractors() {
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
    
    initialContractors.forEach(async (contractor) => {
      await this.createContractor(contractor);
    });
  }
}

// Import the DatabaseStorage implementation
import { DatabaseStorage } from './storage.pg';

// Comment out the MemStorage implementation and use DatabaseStorage instead
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
