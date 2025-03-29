import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Quote, Project } from "@shared/schema";
import { Link } from "wouter";
import { QuoteStatus } from "@/types";
import QuoteRequestCard from "./quote-request-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";

export default function QuoteManagement() {
  const [activeTab, setActiveTab] = useState<QuoteStatus>("pending");
  
  const { data: quotes, isLoading: quotesLoading, error: quotesError } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });
  
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Filter quotes by status
  const filteredQuotes = quotes?.filter(quote => quote.status === activeTab) || [];
  
  // Get project details for a quote
  const getProjectForQuote = (projectId: number) => {
    return projects?.find(project => project.id === projectId);
  };
  
  // Count quotes by status
  const countQuotesByStatus = (status: QuoteStatus) => {
    return quotes?.filter(quote => quote.status === status).length || 0;
  };
  
  const isLoading = quotesLoading || projectsLoading;

  return (
    <div id="quotes">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quote Management</h2>
      
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-gray-900">Your Quote Requests</CardTitle>
            <Link href="/projects/new">
              <Button variant="default" size="sm" className="text-sm">
                <PlusIcon className="h-4 w-4 mr-1" /> New Quote Request
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Tabs */}
          <Tabs defaultValue="pending" onValueChange={(value) => setActiveTab(value as QuoteStatus)}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="pending">
                Pending ({countQuotesByStatus("pending")})
              </TabsTrigger>
              <TabsTrigger value="received">
                Received ({countQuotesByStatus("received")})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted ({countQuotesByStatus("accepted")})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({countQuotesByStatus("completed")})
              </TabsTrigger>
            </TabsList>
            
            {quotesError ? (
              <div className="py-8 text-center">
                <p className="text-red-500">Error loading quotes: {(quotesError as Error).message}</p>
              </div>
            ) : isLoading ? (
              <div className="py-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-28 bg-gray-200 rounded"></div>
                  <div className="h-28 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <TabsContent value={activeTab} className="mt-0">
                {filteredQuotes.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No {activeTab} quote requests found.</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {filteredQuotes.map((quote) => (
                      <QuoteRequestCard 
                        key={quote.id} 
                        quote={quote} 
                        project={getProjectForQuote(quote.projectId)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
