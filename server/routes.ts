import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { CosmosStorage } from "./storage.cosmos";
import { estimateRenovationCost, estimateConstructionCost, generateDesignInspiration, designInspirationSchema } from "./openai";
import { renovationEstimateSchema, constructionEstimateSchema, quoteRequestSchema, insertProjectSchema, insertReviewSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupChatServer } from "./chat";

// Add these interfaces at the top after imports
interface Project {
  id: string;
  name: string;
  userId: string;
  description: string;
  type: "project";
  projectType: string;
  location?: string | null;
  status?: string;
  estimatedCostMin?: number | null;
  estimatedCostMax?: number | null;
  actualCost?: number | null;
  timeline?: string | null;
  details?: any;
}

interface InsertProject {
  name: string;
  userId: string;
  description: string;
  projectType: string;
  type: "project";
  location?: string | null;
  status?: string;
  estimatedCostMin?: number | null;
  estimatedCostMax?: number | null;
  actualCost?: number | null;
  timeline?: string | null;
  details?: any;
}

// Remove unused memory store setup
const storage = new CosmosStorage();

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API routes

  // Contractors
  app.get("/api/contractors", async (req, res) => {
    try {
      let contractors;

      if (req.query.search) {
        contractors = await storage.searchContractors(req.query.search as string);
      } else if (req.query.specialty) {
        contractors = await storage.getContractorsBySpecialty(req.query.specialty as string);
      } else {
        contractors = await storage.getAllContractors();
      }

      res.json(contractors);
    } catch (error) {
      console.error("Error retrieving contractors:", error);
      res.status(500).json({ message: "Failed to retrieve contractors" });
    }
  });

  app.get("/api/contractors/:id", async (req, res) => {
    try {
      const id = req.params.id; // Keep as string - CosmosDB expects string IDs
      const contractor = await storage.getContractor(id);

      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }

      res.json(contractor);
    } catch (error) {
      console.error("Error retrieving contractor:", error);
      res.status(500).json({ message: "Failed to retrieve contractor" });
    }
  });

  // Projects
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const projects = await storage.getProjectsByUserId(req.user.id.toString());
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if the project belongs to the user
      if (project.userId !== req.user.id.toString()) { // Convert ID to string for comparison
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve project" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const projectData: InsertProject = {
        ...req.body,
        type: "project",
        projectType: req.body.type || "general",
        userId: req.user.id.toString()
      };

      const validatedData = insertProjectSchema.parse(projectData);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const id = req.params.id; // Keep as string
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if the project belongs to the user
      if (project.userId !== req.user.id.toString()) { // Convert ID to string for comparison
        return res.status(403).json({ message: "Forbidden" });
      }

      const updateData: Partial<Project> = {
        ...req.body,
        type: "project",
        projectType: req.body.type || undefined
      };
      
      const validatedData = insertProjectSchema.partial().parse(updateData);
      
      const updatedProject = await storage.updateProject(id, validatedData);
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Quotes
  app.get("/api/quotes", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projects = await storage.getProjectsByUserId(req.user.id.toString());
      const projectIds = projects.map(project => project.id);
      
      const allQuotes = [];
      for (const projectId of projectIds) {
        const quotes = await storage.getQuotesByProjectId(projectId);
        allQuotes.push(...quotes);
      }
      
      res.json(allQuotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve quotes" });
    }
  });

  app.get("/api/quotes/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const quote = await storage.getQuote(req.params.id);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      // Verify the quote is for a project owned by the user
      const project = await storage.getProject(quote.projectId);
      if (!project || project.userId !== req.user.id.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve quote" });
    }
  });

  app.post("/api/quotes/request", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = quoteRequestSchema.parse({
        ...req.body,
        projectId: req.body.projectId.toString(),
        contractorIds: req.body.contractorIds.map(String)
      });
      
      // Verify the project belongs to the user
      const project = await storage.getProject(validatedData.projectId);
      if (!project || project.userId !== req.user.id.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Create a quote for each contractor
      const quotes = [];
      for (const contractorId of validatedData.contractorIds) {
        const quote = await storage.createQuote({
          projectId: validatedData.projectId,
          contractorId,
          status: "pending",
          description: validatedData.message || `Quote request for ${project.name}`
        });
        quotes.push(quote);
      }
      
      res.status(201).json(quotes);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to request quotes" });
    }
  });

  // Reviews
  app.get("/api/contractors/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByContractorId(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve reviews" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const reviewData = {
        ...req.body,
        userId: req.user.id.toString(),
        contractorId: req.body.contractorId.toString(),
        projectId: req.body.projectId ? req.body.projectId.toString() : undefined,
        review: req.body.review || undefined // Convert null to undefined
      };
      
      const validatedData = insertReviewSchema.parse(reviewData);
      
      if (validatedData.projectId) {
        const project = await storage.getProject(validatedData.projectId);
        if (!project || project.userId !== req.user.id.toString()) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Estimation
  app.post("/api/estimate/renovation", async (req, res) => {
    try {
      const validatedData = renovationEstimateSchema.parse(req.body);
      const estimate = await estimateRenovationCost(validatedData);
      res.json(estimate);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to generate renovation estimate" });
    }
  });

  app.post("/api/estimate/construction", async (req, res) => {
    try {
      const validatedData = constructionEstimateSchema.parse(req.body);
      const estimate = await estimateConstructionCost(validatedData);
      res.json(estimate);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to generate construction estimate" });
    }
  });
  
  // Design Inspiration
  app.post("/api/design/inspiration", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = designInspirationSchema.parse(req.body);
      const inspiration = await generateDesignInspiration(validatedData);
      
      // Save the generated design to the database
      if (inspiration && inspiration.image) {
        await storage.createDesignInspiration({
          userId: req.user.id.toString(),
          room: validatedData.room,
          style: validatedData.style,
          description: validatedData.description || undefined,
          imageUrl: inspiration.image,
          prompt: inspiration.prompt || undefined,
          tips: inspiration.tips || [],
        });
      }
      
      res.json(inspiration);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to generate design inspiration" });
    }
  });
  
  // Get saved design inspirations for current user
  app.get("/api/design/inspirations", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const inspirations = await storage.getDesignInspirationsByUserId(req.user.id.toString());
      res.json(inspirations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve design inspirations" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up chat server with Socket.IO
  setupChatServer(httpServer);
  
  return httpServer;
}
