import OpenAI from "openai";
import { RenovationEstimate, ConstructionEstimate } from "@shared/schema";
import { z } from "zod";

// Define schema for design inspiration requests
export const designInspirationSchema = z.object({
  style: z.string(),
  room: z.string(),
  description: z.string().optional(),
});

export type DesignInspiration = z.infer<typeof designInspirationSchema>;

// Initialize Azure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": "2023-12-01-preview" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
});

// Renovation cost estimation
export async function estimateRenovationCost(data: RenovationEstimate): Promise<any> {
  try {
    const prompt = `
      Generate a detailed cost estimation for a ${data.renovationType} renovation project in India.
      
      Project details:
      - Type: ${data.renovationType}
      - Square footage: ${data.squareFootage} sq ft
      - Quality level: ${data.qualityLevel}
      - Location: ${data.location || 'Delhi, India'}
      - Scope: ${data.scope}
      
      Please provide a JSON response with the following fields:
      - totalCostMin (number): Minimum total cost estimate in INR (Indian Rupees)
      - totalCostMax (number): Maximum total cost estimate in INR (Indian Rupees)
      - breakdown (object): Cost breakdown with the following fields:
        - materials (object): Min and max cost for materials in INR
        - labor (object): Min and max cost for labor in INR
        - fixtures (object): Min and max cost for fixtures and appliances in INR
        - permits (number): Estimated permit costs in INR
      - recommendations (string): Three practical cost-saving recommendations for Indian homeowners
      - timeline (string): Estimated project timeline considering Indian construction practices
      
      Only provide the JSON response, nothing else. Make sure all costs reflect current Indian market rates.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "",
      messages: [
        { role: "system", content: "You are a professional renovation cost estimator with 20 years of experience working in major Indian cities including Delhi, Mumbai, Bangalore, and Chennai." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const messageContent = response.choices[0].message.content;
    const content = typeof messageContent === 'string' ? messageContent : "{}";
    const result = JSON.parse(content);
    
    // Format currency as INR with Indian number format
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    
    return {
      totalCost: `${formatter.format(result.totalCostMin)} - ${formatter.format(result.totalCostMax)}`,
      breakdown: {
        materials: `${formatter.format(result.breakdown.materials.min)} - ${formatter.format(result.breakdown.materials.max)}`,
        labor: `${formatter.format(result.breakdown.labor.min)} - ${formatter.format(result.breakdown.labor.max)}`,
        fixtures: `${formatter.format(result.breakdown.fixtures.min)} - ${formatter.format(result.breakdown.fixtures.max)}`,
        permits: formatter.format(result.breakdown.permits)
      },
      recommendations: result.recommendations,
      timeline: result.timeline,
      raw: result
    };
  } catch (error: any) {
    console.error("Error estimating renovation cost:", error);
    
    // Check if this is a rate limit or quota error
    if (error?.error?.type === 'insufficient_quota' || 
        error?.status === 429 || 
        error?.message?.includes('quota') || 
        error?.message?.includes('rate limit')) {
      throw new Error("Azure OpenAI API rate limit exceeded. Please try again later or contact support for assistance.");
    }
    
    throw new Error("Failed to generate renovation cost estimate: " + (error?.message || "Unknown error"));
  }
}

// Construction cost estimation
export async function estimateConstructionCost(data: ConstructionEstimate): Promise<any> {
  try {
    const prompt = `
      Generate a detailed cost estimation for a ${data.constructionType} construction project in India.
      
      Project details:
      - Type: ${data.constructionType}
      - Square footage: ${data.squareFootage} sq ft
      - Number of stories: ${data.stories}
      - Quality level: ${data.qualityLevel}
      - Location: ${data.location || 'Delhi, India'}
      - Lot size: ${data.lotSize}
      - Additional details: ${data.details}
      
      Please provide a JSON response with the following fields:
      - totalCostMin (number): Minimum total cost estimate in INR (Indian Rupees)
      - totalCostMax (number): Maximum total cost estimate in INR (Indian Rupees)
      - breakdown (object): Cost breakdown with the following fields:
        - foundation (object): Min and max cost for foundation in INR
        - framing (object): Min and max cost for framing in INR
        - exterior (object): Min and max cost for exterior finishes in INR
        - interior (object): Min and max cost for interior finishes in INR
        - mechanical (object): Min and max cost for mechanical systems in INR
        - permits (number): Estimated permit costs in INR
      - recommendations (string): Three practical cost-saving recommendations for Indian homeowners
      - timeline (string): Estimated project timeline considering Indian construction practices
      
      Only provide the JSON response, nothing else. Make sure all costs reflect current Indian market rates.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "",
      messages: [
        { role: "system", content: "You are a professional construction cost estimator with 20 years of experience working in major Indian cities including Delhi, Mumbai, Bangalore, and Chennai." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const messageContent = response.choices[0].message.content;
    const content = typeof messageContent === 'string' ? messageContent : "{}";
    const result = JSON.parse(content);
    
    // Format currency as INR with Indian number format
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    
    return {
      totalCost: `${formatter.format(result.totalCostMin)} - ${formatter.format(result.totalCostMax)}`,
      breakdown: {
        foundation: `${formatter.format(result.breakdown.foundation.min)} - ${formatter.format(result.breakdown.foundation.max)}`,
        framing: `${formatter.format(result.breakdown.framing.min)} - ${formatter.format(result.breakdown.framing.max)}`,
        exterior: `${formatter.format(result.breakdown.exterior.min)} - ${formatter.format(result.breakdown.exterior.max)}`,
        interior: `${formatter.format(result.breakdown.interior.min)} - ${formatter.format(result.breakdown.interior.max)}`,
        mechanical: `${formatter.format(result.breakdown.mechanical.min)} - ${formatter.format(result.breakdown.mechanical.max)}`,
        permits: formatter.format(result.breakdown.permits)
      },
      recommendations: result.recommendations,
      timeline: result.timeline,
      raw: result
    };
  } catch (error: any) {
    console.error("Error estimating construction cost:", error);
    
    // Check if this is a rate limit or quota error
    if (error?.error?.type === 'insufficient_quota' || 
        error?.status === 429 || 
        error?.message?.includes('quota') || 
        error?.message?.includes('rate limit')) {
      throw new Error("Azure OpenAI API rate limit exceeded. Please try again later or contact support for assistance.");
    }
    
    throw new Error("Failed to generate construction cost estimate: " + (error?.message || "Unknown error"));
  }
}

// Design inspiration generation using DALL-E
export async function generateDesignInspiration(data: DesignInspiration): Promise<any> {
  try {
    // First, generate a detailed prompt for the DALL-E model
    const promptGenerationResponse = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "",
      messages: [
        { 
          role: "system", 
          content: "You are an interior designer specialized in Indian home designs. Your task is to create a detailed prompt for an AI image generator (DALL-E) to visualize a specific room design. Focus on creating visual prompts that reflect Indian design sensibilities, materials, and aesthetics when appropriate." 
        },
        { 
          role: "user", 
          content: `Create a detailed DALL-E prompt to generate an image of a ${data.room} in the ${data.style} style for an Indian home. ${data.description ? `Additional details: ${data.description}` : ''}`
        }
      ],
    });

    const promptContent = promptGenerationResponse.choices[0].message.content || "";
    
    // Generate design description
    const descriptionResponse = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "",
      messages: [
        { 
          role: "system", 
          content: "You are an interior designer specialized in Indian home designs. Provide a brief but informative description of the design, highlighting key elements, materials, and how it fits Indian homes and lifestyle." 
        },
        { 
          role: "user", 
          content: `Describe a ${data.room} in the ${data.style} style for an Indian home. ${data.description ? `Additional details: ${data.description}` : ''}`
        }
      ],
    });

    const designDescription = descriptionResponse.choices[0].message.content || "";

    // Generate design tips
    const tipsResponse = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "",
      messages: [
        { 
          role: "system", 
          content: "You are an interior designer specialized in Indian home designs. Provide 3 practical design tips related to the requested design that would be helpful for homeowners in India." 
        },
        { 
          role: "user", 
          content: `Give 3 design tips for a ${data.room} in the ${data.style} style for an Indian home. ${data.description ? `Additional details: ${data.description}` : ''}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const tipsContent = tipsResponse.choices[0].message.content || "{}";
    const tips = JSON.parse(typeof tipsContent === 'string' ? tipsContent : "{}");

    // Generate image using DALL-E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: promptContent,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return {
      image: imageResponse.data[0]?.url,
      prompt: promptContent,
      description: designDescription,
      tips: tips.tips || [],
      style: data.style,
      room: data.room
    };
  } catch (error: any) {
    console.error("Error generating design inspiration:", error);
    
    // Check if this is a rate limit or quota error
    if (error?.error?.type === 'insufficient_quota' || 
        error?.status === 429 || 
        error?.message?.includes('quota') || 
        error?.message?.includes('rate limit')) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later or contact support for assistance.");
    }
    
    throw new Error("Failed to generate design inspiration: " + (error?.message || "Unknown error"));
  }
}