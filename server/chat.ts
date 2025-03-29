import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import axios from "axios";
import { User } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

interface MCPServer {
  uri: string;
  apiKey?: string;
  protocol: string;
}

// Store MCP servers here (in-memory for now)
const mcpServers: { [key: string]: MCPServer } = {};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  userId?: number;
}

export function setupChatServer(httpServer: HttpServer) {
  const io = new Server(httpServer);
  
  // Socket.io connection handling
  io.on("connection", (socket: Socket) => {
    console.log("User connected to chat server");
    
    // Track user context for this connection
    let currentUser: User | null = null;
    const sessionId = socket.id;
    
    // Handle authentication
    socket.on("authenticate", (user: User) => {
      currentUser = user;
      console.log(`User authenticated: ${user.username}`);
      
      // Emit a welcome message
      const welcomeMessage: ChatMessage = {
        role: "assistant",
        content: `Hello ${user.username}! Welcome to RCB Assistant. How can I help you with your renovation or construction project today?`,
        timestamp: new Date(),
      };
      socket.emit("message", welcomeMessage);
    });
    
    // Handle messages
    socket.on("message", async (message: string) => {
      console.log(`Received message: ${message}`);
      
      // Create message object
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date(),
        userId: currentUser?.id,
      };
      
      // Try routing to MCP server if appropriate
      const routedToMCP = await tryRoutingToMCP(socket, message, sessionId);
      
      if (!routedToMCP) {
        // Check if the message seems to be about MCP integration
        if (message.toLowerCase().includes("connect") && 
            (message.toLowerCase().includes("server") || 
             message.toLowerCase().includes("protocol") || 
             message.toLowerCase().includes("mcp"))) {
          await handleMCPIntegrationRequest(socket, message);
        } else {
          // Process with OpenAI
          try {
            const response = await openai.chat.completions.create({
              messages: [
                {
                  role: "system",
                  content: "You are RCB Assistant, an expert in renovation and construction projects in India. You provide helpful advice about home improvement, construction costs, finding contractors, and managing renovation projects. Provide information specific to the Indian market in terms of materials, costs, and practices. Keep your responses focused on the construction and renovation domain."
                },
                { role: "user", content: message }
              ],
              model: "gpt-4o",
            });
            
            const assistantMessage: ChatMessage = {
              role: "assistant",
              content: response.choices[0].message.content || "I'm sorry, I couldn't process that request.",
              timestamp: new Date(),
            };
            
            socket.emit("message", assistantMessage);
          } catch (error) {
            console.error("OpenAI error:", error);
            
            // Send error message
            socket.emit("message", {
              role: "assistant",
              content: "I'm sorry, I encountered an error processing your request. Please try again later.",
              timestamp: new Date(),
            });
          }
        }
      }
    });
    
    // Handle MCP server registration
    socket.on("register-mcp", (serverData: MCPServer) => {
      if (isValidMCPServer(serverData)) {
        const serverKey = serverData.uri;
        mcpServers[serverKey] = serverData;
        
        console.log(`Registered MCP server: ${serverData.uri} (${serverData.protocol})`);
        
        // Broadcast updated MCP list
        io.emit("mcp-list", Object.values(mcpServers));
        
        // Confirmation message
        socket.emit("message", {
          role: "system",
          content: `Successfully connected to ${serverData.protocol} server at ${serverData.uri}`,
          timestamp: new Date(),
        });
      } else {
        socket.emit("message", {
          role: "system",
          content: "Failed to register MCP server. Please check the server details and try again.",
          timestamp: new Date(),
        });
      }
    });
    
    // Handle MCP server list request
    socket.on("list-mcp", () => {
      socket.emit("mcp-list", Object.values(mcpServers));
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected from chat server");
    });
  });
}

// Helper function to validate MCP server details
function isValidMCPServer(server: MCPServer): boolean {
  try {
    // Basic validation
    if (!server.uri || !server.protocol) {
      return false;
    }
    
    // Validate URL format
    new URL(server.uri);
    
    return true;
  } catch (error) {
    console.error("Invalid MCP server:", error);
    return false;
  }
}

// Handle MCP integration requests
async function handleMCPIntegrationRequest(socket: any, message: string) {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an assistant helping with MCP (Message Chat Protocol) server integration. Extract any potential server details from the user message. If the user is asking about connecting to a server but doesn't provide specific details, suggest they might want to connect to a Matrix server. Respond with JSON in this format: { 'suggestRegistration': boolean, 'serverData': { 'uri': string, 'protocol': string } }"
        },
        { role: "user", content: message }
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });
    
    try {
      const content = response.choices[0].message.content || '{}';
      const result = JSON.parse(content);
      
      if (result.suggestRegistration && result.serverData) {
        // Suggest registration in UI
        socket.emit("suggest-mcp-registration", result.serverData);
        
        // Send message to user
        socket.emit("message", {
          role: "assistant",
          content: `I can help you connect to a ${result.serverData.protocol} server. Please check the dialog that appeared to complete the connection.`,
          timestamp: new Date(),
        });
      } else {
        // Regular response about MCP
        socket.emit("message", {
          role: "assistant",
          content: "To connect to an MCP server, click on the server icon in the top right of this chat window and enter the server details. I can help you manage connections to Matrix, XMPP, IRC or other compatible protocol servers.",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      // Fallback response
      socket.emit("message", {
        role: "assistant",
        content: "To connect to an MCP server, click on the server icon in the top right of this chat window and enter the server details.",
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error("Error in handleMCPIntegrationRequest:", error);
    socket.emit("message", {
      role: "assistant",
      content: "I encountered an error while processing your MCP integration request. Please try again later.",
      timestamp: new Date(),
    });
  }
}

// Try routing the message to an MCP server
async function tryRoutingToMCP(socket: any, message: string, sessionId: string): Promise<boolean> {
  // Check if we have any registered MCP servers
  if (Object.keys(mcpServers).length === 0) {
    return false;
  }
  
  // For now, just use the first registered server
  // In a more sophisticated implementation, this could route based on context or user preference
  const server = Object.values(mcpServers)[0];
  
  try {
    // Attempt to route the message to the MCP server
    const response = await axios.post(`${server.uri}/api/chat`, {
      message,
      sessionId,
      protocol: server.protocol,
      apiKey: server.apiKey,
    });
    
    if (response.data && response.data.message) {
      // Forward the response from the MCP server to the user
      const mcpResponse: ChatMessage = {
        role: "assistant",
        content: response.data.message,
        timestamp: new Date(),
      };
      
      socket.emit("message", mcpResponse);
      return true;
    }
  } catch (error) {
    console.error(`Failed to route message to MCP server ${server.uri}:`, error);
    // Don't mark as handled, will fall back to OpenAI
  }
  
  return false;
}