import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, SendHorizonal, Bot, Server, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface MCPServer {
  uri: string;
  protocol: string;
}

const mcpServerSchema = z.object({
  uri: z.string().url({ message: "Please enter a valid URL" }),
  protocol: z.string().min(1, { message: "Protocol is required" }),
  apiKey: z.string().optional(),
});

type MCPServerFormValues = z.infer<typeof mcpServerSchema>;

export default function ChatBot() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<MCPServerFormValues>({
    resolver: zodResolver(mcpServerSchema),
    defaultValues: {
      uri: "",
      protocol: "matrix",
      apiKey: "",
    },
  });

  // Initialize socket connection
  useEffect(() => {
    const socketIo = io();
    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("Connected to chat server");
      setIsConnected(true);

      if (user) {
        socketIo.emit("authenticate", user);
      }
    });

    socketIo.on("disconnect", () => {
      console.log("Disconnected from chat server");
      setIsConnected(false);
    });

    socketIo.on("message", (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, { 
        ...message, 
        timestamp: new Date(message.timestamp) 
      }]);
    });

    socketIo.on("mcp-list", (servers: MCPServer[]) => {
      setMcpServers(servers);
    });

    socketIo.on("suggest-mcp-registration", (serverData: MCPServer) => {
      form.setValue("uri", serverData.uri);
      form.setValue("protocol", serverData.protocol);
      setIsAddServerDialogOpen(true);
    });

    // Request list of MCP servers
    socketIo.emit("list-mcp");

    return () => {
      socketIo.disconnect();
    };
  }, [user, form]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket) return;

    // Add user message to local state immediately for responsiveness
    const userMessage: ChatMessage = {
      role: "user",
      content: messageInput,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Send message to server
    socket.emit("message", messageInput);
    setMessageInput("");
  };

  const handleAddServer = (data: MCPServerFormValues) => {
    if (socket) {
      socket.emit("register-mcp", data);
      setIsAddServerDialogOpen(false);

      toast({
        title: "MCP Server Added",
        description: `Successfully registered server at ${data.uri}`,
      });
    }
  };

  const handleClose = () => {
    setIsMinimized(true);
  };

  return (
    <>
      {isMinimized ? (
        <Button
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg"
          onClick={() => setIsMinimized(false)}
        >
          <Bot size={24} />
        </Button>
      ) : (
        <Sheet defaultOpen={true} onOpenChange={(open) => setIsMinimized(!open)}>
          <SheetContent side="right" className="sm:max-w-md p-0 flex flex-col h-[80vh]">
          <SheetHeader className="p-4 border-b">
            <div className="flex justify-between items-center">
              <SheetTitle>RCB Assistant</SheetTitle>
              <div className="flex items-center space-x-2">
                <Dialog open={isAddServerDialogOpen} onOpenChange={setIsAddServerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      title="Connect to MCP Server"
                    >
                      <Server size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect to MCP Server</DialogTitle>
                      <DialogDescription>
                        Enter the details for the MCP server you want to connect to.
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleAddServer)}
                        className="space-y-4 pt-4"
                      >
                        <FormField
                          control={form.control}
                          name="uri"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Server URI</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.org"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="protocol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Protocol</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full px-3 py-2 border rounded-md"
                                  {...field}
                                >
                                  <option value="matrix">Matrix</option>
                                  <option value="xmpp">XMPP</option>
                                  <option value="irc">IRC</option>
                                  <option value="custom">Custom</option>
                                </select>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Your API key for the server"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <DialogFooter className="pt-4">
                          <Button type="submit">Connect</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsMinimized(true)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
            <SheetDescription>
              Ask me anything about renovations and construction projects.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {mcpServers.length > 0 && (
            <div className="px-4 py-2 border-t bg-muted/30">
              <div className="text-xs text-muted-foreground">
                Connected MCP Servers:
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {mcpServers.map((server, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded"
                  >
                    <ExternalLink size={12} className="mr-1" />
                    {new URL(server.uri).hostname} ({server.protocol})
                  </div>
                ))}
              </div>
            </div>
          )}

          <SheetFooter className="p-4 border-t">
            <form
              onSubmit={handleSendMessage}
              className="flex space-x-2 w-full"
            >
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={!isConnected}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!isConnected || !messageInput.trim()}
              >
                <SendHorizonal size={18} />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      )}
    </>
  );
}