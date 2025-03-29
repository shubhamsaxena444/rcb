import OpenAI from "openai";
import { RenovationEstimate, ConstructionEstimate } from "@shared/schema";

// Initialize Azure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": "2023-12-01-preview" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
});

// Format currency in INR
const formatINR = (amount: number): string => {
  return amount.toLocaleString('en-IN');
};

// Renovation cost estimation
export async function estimateRenovationCost(data: RenovationEstimate): Promise<any> {
  try {
    const prompt = `
      Generate a detailed cost estimation for a ${data.renovationType} renovation project in India.
      
      Project details:
      - Type: ${data.renovationType}
      - Square footage: ${data.squareFootage} sq ft
      - Quality level: ${data.qualityLevel}
      - Location: ${data.location}, India
      - Scope: ${data.scope}
      
      Please provide a JSON response with the following fields:
      - totalCostMin (number): Minimum total cost estimate in Indian Rupees (INR)
      - totalCostMax (number): Maximum total cost estimate in Indian Rupees (INR)
      - breakdown (object): Cost breakdown with the following fields:
        - materials (object): Min and max cost for materials in INR
        - labor (object): Min and max cost for labor in INR
        - fixtures (object): Min and max cost for fixtures and appliances in INR
        - permits (number): Estimated permit costs in INR
      - recommendations (string): Three practical cost-saving recommendations applicable in India
      - timeline (string): Estimated project timeline for Indian construction standards
      
      Base your estimates on current Indian construction market prices.
      Only provide the JSON response, nothing else.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "",
      messages: [
        { 
          role: "system", 
          content: "You are a professional renovation cost estimator with 20 years of experience in the Indian construction industry. Provide costs in Indian Rupees (INR) using Indian market rates." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const messageContent = response.choices[0].message.content;
    const content = typeof messageContent === 'string' ? messageContent : "{}";
    const result = JSON.parse(content);
    
    return {
      totalCost: `₹${formatINR(result.totalCostMin)} - ₹${formatINR(result.totalCostMax)}`,
      breakdown: {
        materials: `₹${formatINR(result.breakdown.materials.min)} - ₹${formatINR(result.breakdown.materials.max)}`,
        labor: `₹${formatINR(result.breakdown.labor.min)} - ₹${formatINR(result.breakdown.labor.max)}`,
        fixtures: `₹${formatINR(result.breakdown.fixtures.min)} - ₹${formatINR(result.breakdown.fixtures.max)}`,
        permits: `₹${formatINR(result.breakdown.permits)}`
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
      - Location: ${data.location}, India
      - Lot size: ${data.lotSize}
      - Additional details: ${data.details}
      
      Please provide a JSON response with the following fields:
      - totalCostMin (number): Minimum total cost estimate in Indian Rupees (INR)
      - totalCostMax (number): Maximum total cost estimate in Indian Rupees (INR)
      - breakdown (object): Cost breakdown with the following fields:
        - foundation (object): Min and max cost for foundation in INR
        - framing (object): Min and max cost for framing in INR
        - exterior (object): Min and max cost for exterior finishes in INR
        - interior (object): Min and max cost for interior finishes in INR
        - mechanical (object): Min and max cost for mechanical systems in INR
        - permits (number): Estimated permit costs in INR
      - recommendations (string): Three practical cost-saving recommendations applicable in India
      - timeline (string): Estimated project timeline for Indian construction standards
      
      Base your estimates on current Indian construction market prices.
      Only provide the JSON response, nothing else.
    `;

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "",
      messages: [
        { 
          role: "system", 
          content: "You are a professional construction cost estimator with 20 years of experience in the Indian construction industry. Provide costs in Indian Rupees (INR) using Indian market rates." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const messageContent = response.choices[0].message.content;
    const content = typeof messageContent === 'string' ? messageContent : "{}";
    const result = JSON.parse(content);
    
    return {
      totalCost: `₹${formatINR(result.totalCostMin)} - ₹${formatINR(result.totalCostMax)}`,
      breakdown: {
        foundation: `₹${formatINR(result.breakdown.foundation.min)} - ₹${formatINR(result.breakdown.foundation.max)}`,
        framing: `₹${formatINR(result.breakdown.framing.min)} - ₹${formatINR(result.breakdown.framing.max)}`,
        exterior: `₹${formatINR(result.breakdown.exterior.min)} - ₹${formatINR(result.breakdown.exterior.max)}`,
        interior: `₹${formatINR(result.breakdown.interior.min)} - ₹${formatINR(result.breakdown.interior.max)}`,
        mechanical: `₹${formatINR(result.breakdown.mechanical.min)} - ₹${formatINR(result.breakdown.mechanical.max)}`,
        permits: `₹${formatINR(result.breakdown.permits)}`
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