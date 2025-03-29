import OpenAI from "openai";
import { RenovationEstimate, ConstructionEstimate } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "your-api-key" 
});

// Renovation cost estimation
export async function estimateRenovationCost(data: RenovationEstimate): Promise<any> {
  try {
    const prompt = `
      Generate a detailed cost estimation for a ${data.renovationType} renovation project.
      
      Project details:
      - Type: ${data.renovationType}
      - Square footage: ${data.squareFootage} sq ft
      - Quality level: ${data.qualityLevel}
      - Location: ${data.location}
      - Scope: ${data.scope}
      
      Please provide a JSON response with the following fields:
      - totalCostMin (number): Minimum total cost estimate in USD
      - totalCostMax (number): Maximum total cost estimate in USD
      - breakdown (object): Cost breakdown with the following fields:
        - materials (object): Min and max cost for materials
        - labor (object): Min and max cost for labor
        - fixtures (object): Min and max cost for fixtures and appliances
        - permits (number): Estimated permit costs
      - recommendations (string): Three practical cost-saving recommendations
      - timeline (string): Estimated project timeline
      
      Only provide the JSON response, nothing else.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a professional renovation cost estimator with 20 years of experience." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const messageContent = response.choices[0].message.content;
    const content = typeof messageContent === 'string' ? messageContent : "{}";
    const result = JSON.parse(content);
    
    return {
      totalCost: `$${result.totalCostMin.toLocaleString()} - $${result.totalCostMax.toLocaleString()}`,
      breakdown: {
        materials: `$${result.breakdown.materials.min.toLocaleString()} - $${result.breakdown.materials.max.toLocaleString()}`,
        labor: `$${result.breakdown.labor.min.toLocaleString()} - $${result.breakdown.labor.max.toLocaleString()}`,
        fixtures: `$${result.breakdown.fixtures.min.toLocaleString()} - $${result.breakdown.fixtures.max.toLocaleString()}`,
        permits: `$${result.breakdown.permits.toLocaleString()}`
      },
      recommendations: result.recommendations,
      timeline: result.timeline,
      raw: result
    };
  } catch (error: any) {
    console.error("Error estimating renovation cost:", error);
    
    // Check if this is a rate limit or quota error
    if (error?.error?.type === 'insufficient_quota' || error?.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later or contact support for assistance.");
    }
    
    throw new Error("Failed to generate renovation cost estimate");
  }
}

// Construction cost estimation
export async function estimateConstructionCost(data: ConstructionEstimate): Promise<any> {
  try {
    const prompt = `
      Generate a detailed cost estimation for a ${data.constructionType} construction project.
      
      Project details:
      - Type: ${data.constructionType}
      - Square footage: ${data.squareFootage} sq ft
      - Number of stories: ${data.stories}
      - Quality level: ${data.qualityLevel}
      - Location: ${data.location}
      - Lot size: ${data.lotSize}
      - Additional details: ${data.details}
      
      Please provide a JSON response with the following fields:
      - totalCostMin (number): Minimum total cost estimate in USD
      - totalCostMax (number): Maximum total cost estimate in USD
      - breakdown (object): Cost breakdown with the following fields:
        - foundation (object): Min and max cost for foundation
        - framing (object): Min and max cost for framing
        - exterior (object): Min and max cost for exterior finishes
        - interior (object): Min and max cost for interior finishes
        - mechanical (object): Min and max cost for mechanical systems
        - permits (number): Estimated permit costs
      - recommendations (string): Three practical cost-saving recommendations
      - timeline (string): Estimated project timeline
      
      Only provide the JSON response, nothing else.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a professional construction cost estimator with 20 years of experience." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const messageContent = response.choices[0].message.content;
    const content = typeof messageContent === 'string' ? messageContent : "{}";
    const result = JSON.parse(content);
    
    return {
      totalCost: `$${result.totalCostMin.toLocaleString()} - $${result.totalCostMax.toLocaleString()}`,
      breakdown: {
        foundation: `$${result.breakdown.foundation.min.toLocaleString()} - $${result.breakdown.foundation.max.toLocaleString()}`,
        framing: `$${result.breakdown.framing.min.toLocaleString()} - $${result.breakdown.framing.max.toLocaleString()}`,
        exterior: `$${result.breakdown.exterior.min.toLocaleString()} - $${result.breakdown.exterior.max.toLocaleString()}`,
        interior: `$${result.breakdown.interior.min.toLocaleString()} - $${result.breakdown.interior.max.toLocaleString()}`,
        mechanical: `$${result.breakdown.mechanical.min.toLocaleString()} - $${result.breakdown.mechanical.max.toLocaleString()}`,
        permits: `$${result.breakdown.permits.toLocaleString()}`
      },
      recommendations: result.recommendations,
      timeline: result.timeline,
      raw: result
    };
  } catch (error: any) {
    console.error("Error estimating construction cost:", error);
    
    // Check if this is a rate limit or quota error
    if (error?.error?.type === 'insufficient_quota' || error?.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later or contact support for assistance.");
    }
    
    throw new Error("Failed to generate construction cost estimate");
  }
}