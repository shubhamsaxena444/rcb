import { container } from "./cosmosClient";
import { v4 as uuidv4 } from 'uuid'; // Correct import
// import { IStorage } from "./storage"; // Remove dependency on old interface for now
// Only need the Insert types for reference when defining Cosmos Insert types
import type { Container, Database } from "@azure/cosmos";

// --- Cosmos DB Item Interfaces ---

interface BaseItem {
  id: string; // Cosmos DB uses string IDs, typically UUIDs
  type: string; // To distinguish item types within the same container
  createdAt?: string; // ISO 8601 string format
  updatedAt?: string; // ISO 8601 string format
}

// Adapt interfaces from shared/schema.ts
export interface User extends BaseItem {
  type: "user";
  username: string;
  password?: string; // Often excluded from reads
  email: string;
  name: string;
}

export interface Contractor extends BaseItem {
  type: "contractor";
  name: string;
  description: string;
  specialty: string; // e.g., "General", "Specialist", "Electrical"
  profileImage?: string;
  email: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[]; // Array of specific skills
  location: string;
  latitude?: number;
  longitude?: number;
  minRate?: number;
  maxRate?: number;
}

export interface Project extends BaseItem {
  type: "project";
  name: string;
  projectType: string; // Renamed from 'type' to avoid conflict
  description: string;
  userId: string; // Reference to User ID (UUID)
  status?: string; // e.g., "planning", "active", "completed"
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  actualCost?: number;
  timeline?: string;
  location?: string;
  squareFootage?: number;
  details?: any; // JSON blob
}

export interface Quote extends BaseItem {
    type: "quote";
    projectId: string;
    contractorId: string;
    status?: string; // e.g., "pending", "accepted", "rejected"
    amount?: number;
    description?: string;
    timeline?: string;
    details?: any; // JSON blob
}

export interface Review extends BaseItem {
    type: "review";
    userId: string;
    contractorId: string;
    projectId?: string; // Optional link
    rating: number;
    review?: string;
}

export interface SavedDesignInspiration extends BaseItem {
    type: "designInspiration";
    userId: string;
    room: string;
    style: string;
    description?: string;
    imageUrl: string;  // Changed from optional to required
    prompt?: string;
    tips: string[];    // Changed from optional to required
}


// --- Cosmos DB Storage Implementation ---

// Helper function to add base fields
// Takes the specific data (e.g., Omit<Contractor, ...baseFields>) and returns the full item (e.g., Contractor)
const addBaseFields = <TResult extends BaseItem>(
  itemData: Omit<TResult, 'id' | 'type' | 'createdAt' | 'updatedAt'>,
  type: TResult['type']
): TResult => {
  const now = new Date().toISOString();
  const newItem = {
    ...(itemData as any), // Use 'as any' here carefully, assuming itemData structure is correct
    id: uuidv4(),
    type: type,
    createdAt: now,
    updatedAt: now,
  };
  return newItem as TResult; // Still need a cast, but the input type is more constrained
};

// Helper function to update base fields
const updateBaseFields = <T extends BaseItem>(item: T): T => {
    return {
        ...item,
        updatedAt: new Date().toISOString(),
    };
};

// Define input types based on Cosmos structure (omitting generated fields)
export type InsertUser = Omit<User, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'password'> & { password?: string };
export type InsertContractor = Omit<Contractor, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>;
export type InsertProject = Omit<Project, 'id' | 'type' | 'createdAt' | 'updatedAt'>;
export type InsertQuote = Omit<Quote, 'id' | 'type' | 'createdAt' | 'updatedAt'>;
export type InsertReview = Omit<Review, 'id' | 'type' | 'createdAt' | 'updatedAt'>;
export type InsertDesignInspiration = Omit<SavedDesignInspiration, 'id' | 'type' | 'createdAt' | 'updatedAt'>;


export class CosmosStorage /* implements IStorage */ { // Remove implements IStorage for now
  // Note: Session store needs separate handling (e.g., in-memory or Redis)
  // For now, we focus on data operations. We'll need a replacement session store.

  constructor() {
    this.seedContractorsIfNeeded().catch(console.error);
  }

  // --- Contractor Methods ---

  async getContractor(id: string): Promise<Contractor | undefined> {
    try {
      const { resource } = await container.item(id, id).read<Contractor>(); // Use ID as partition key if not specified otherwise
      // Ensure the fetched item is actually a contractor
      if (resource && resource.type === 'contractor') {
          return resource;
      }
      return undefined;
    } catch (error: any) {
      if (error.code === 404) {
        return undefined;
      }
      console.error("Error getting contractor:", error);
      throw error;
    }
  }

  async getAllContractors(): Promise<Contractor[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.type = @type",
      parameters: [{ name: "@type", value: "contractor" }],
    };
    const { resources } = await container.items.query<Contractor>(querySpec).fetchAll();
    return resources;
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
      // Prepare the data specific to the contractor, including defaults
      const contractorData = {
          ...insertContractor,
          rating: 0,
          reviewCount: 0
      };
      // Add base fields (id, type, createdAt, updatedAt)
      // The type of contractorData matches the Omit<...> expected by addBaseFields
      const contractorItem = addBaseFields<Contractor>(contractorData, 'contractor');

      // Create item in Cosmos DB
      const { resource: createdItem } = await container.items.create<Contractor>(contractorItem);
      if (!createdItem) {
          throw new Error("Failed to create contractor in Cosmos DB");
      }
      return createdItem;
  }

  async updateContractorRating(id: string, rating: number, reviewCount: number): Promise<void> {
      const { resource: existingItem } = await container.item(id, id).read<Contractor>();
      if (!existingItem || existingItem.type !== 'contractor') {
          throw new Error(`Contractor with id ${id} not found`);
      }
      const updatedContractor = updateBaseFields({
          ...existingItem,
          rating,
          reviewCount,
      });
      await container.item(id, id).replace<Contractor>(updatedContractor);
  }

  async searchContractors(query: string): Promise<Contractor[]> {
      const lowerCaseQuery = query.toLowerCase();
      const querySpec = {
          query: `SELECT * FROM c WHERE c.type = 'contractor' AND (
              CONTAINS(LOWER(c.name), @query) OR
              CONTAINS(LOWER(c.description), @query) OR
              CONTAINS(LOWER(c.specialty), @query) OR
              CONTAINS(LOWER(c.location), @query) OR
              ARRAY_CONTAINS(c.specialties, @query, true)
          )`,
          parameters: [{ name: "@query", value: lowerCaseQuery }],
      };
      const { resources } = await container.items.query<Contractor>(querySpec).fetchAll();
      return resources;
  }

  // --- Seeding ---
  private async seedContractorsIfNeeded() {
    try {
      const contractorsList = await this.getAllContractors();
      if (contractorsList.length === 0) {
        console.log("Seeding initial contractors...");
        const initialContractors: Omit<InsertContractor, 'id' | 'createdAt' | 'rating' | 'reviewCount'>[] = [
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
        console.log("Finished seeding contractors.");
      }
    } catch (error) {
        console.error("Error seeding contractors:", error);
        // Decide if seeding failure should prevent startup
    }
  }

  // --- Placeholder Methods (To be implemented based on Cosmos structure) ---

  async getUser(id: string): Promise<User | undefined> { console.warn("Method getUser not implemented."); return undefined; }
  async getUserByUsername(username: string): Promise<User | undefined> { console.warn("Method getUserByUsername not implemented."); return undefined; }
  async createUser(insertUser: InsertUser): Promise<User> { throw new Error("Method createUser not implemented."); }
  async getContractorsBySpecialty(specialty: string): Promise<Contractor[]> { console.warn("Method getContractorsBySpecialty not implemented."); return []; }
  async getProject(id: string): Promise<Project | undefined> { console.warn("Method getProject not implemented."); return undefined; }
  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.type = 'project' AND c.userId = @userId",
      parameters: [{ name: "@userId", value: userId }]
    };
    const { resources } = await container.items.query<Project>(querySpec).fetchAll();
    return resources;
  }
  async createProject(insertProject: InsertProject): Promise<Project> {
    const projectData = {
      ...insertProject,
      type: "project" as const
    };
    const projectItem = addBaseFields<Project>(projectData, 'project');
    const { resource } = await container.items.create<Project>(projectItem);
    if (!resource) {
      throw new Error("Failed to create project");
    }
    return resource;
  }

  async updateProject(id: string, projectUpdate: Partial<Project>): Promise<Project> {
    const { resource: existing } = await container.item(id, id).read<Project>();
    if (!existing || existing.type !== 'project') {
      throw new Error(`Project with id ${id} not found`);
    }

    const updatedProject = updateBaseFields({
      ...existing,
      ...projectUpdate
    });

    const { resource } = await container.item(id, id).replace<Project>(updatedProject);
    if (!resource) {
      throw new Error("Failed to update project");
    }
    return resource;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const quoteData = {
      ...insertQuote,
      type: "quote" as const
    };
    const quoteItem = addBaseFields<Quote>(quoteData, 'quote');
    const { resource } = await container.items.create<Quote>(quoteItem);
    if (!resource) {
      throw new Error("Failed to create quote");
    }
    return resource;
  }

  async updateQuote(id: string, quoteUpdate: Partial<Quote>): Promise<Quote | undefined> { throw new Error("Method updateQuote not implemented."); }
  async getReview(id: string): Promise<Review | undefined> { console.warn("Method getReview not implemented."); return undefined; }
  async getReviewsByContractorId(contractorId: string): Promise<Review[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.type = 'review' AND c.contractorId = @contractorId",
      parameters: [{ name: "@contractorId", value: contractorId }]
    };
    const { resources } = await container.items.query<Review>(querySpec).fetchAll();
    return resources;
  }
  async getReviewsByUserId(userId: string): Promise<Review[]> { console.warn("Method getReviewsByUserId not implemented."); return []; }
  async createReview(insertReview: InsertReview): Promise<Review> {
    const reviewData = {
      ...insertReview,
      type: "review" as const
    };
    const reviewItem = addBaseFields<Review>(reviewData, 'review');
    const { resource } = await container.items.create<Review>(reviewItem);
    if (!resource) {
      throw new Error("Failed to create review");
    }
    return resource;
  }

  async getDesignInspiration(id: string): Promise<SavedDesignInspiration | undefined> { console.warn("Method getDesignInspiration not implemented."); return undefined; }
  async getDesignInspirationsByUserId(userId: string): Promise<SavedDesignInspiration[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.type = 'designInspiration' AND c.userId = @userId",
      parameters: [{ name: "@userId", value: userId }]
    };
    const { resources } = await container.items.query<SavedDesignInspiration>(querySpec).fetchAll();
    return resources;
  }
  async createDesignInspiration(insertInspiration: InsertDesignInspiration): Promise<SavedDesignInspiration> {
    const inspirationData = {
      ...insertInspiration,
      type: "designInspiration" as const
    };
    const inspirationItem = addBaseFields<SavedDesignInspiration>(inspirationData, 'designInspiration');
    const { resource } = await container.items.create<SavedDesignInspiration>(inspirationItem);
    if (!resource) {
      throw new Error("Failed to create design inspiration");
    }
    return resource;
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    try {
      const { resource } = await container.item(id, id).read<Quote>();
      if (resource && resource.type === 'quote') {
        return resource;
      }
      return undefined;
    } catch (error: any) {
      if (error.code === 404) return undefined;
      throw error;
    }
  }

  async getQuotesByProjectId(projectId: string): Promise<Quote[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.type = 'quote' AND c.projectId = @projectId",
      parameters: [{ name: "@projectId", value: projectId }]
    };
    const { resources } = await container.items.query<Quote>(querySpec).fetchAll();
    return resources;
  }

  // Session store needs to be handled separately
  public sessionStore: any = null; // Placeholder
}
