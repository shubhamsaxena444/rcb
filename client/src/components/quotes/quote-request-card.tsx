import { Quote, Project } from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Contractor } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuoteRequestCardProps {
  quote: Quote;
  project?: Project;
}

export default function QuoteRequestCard({ quote, project }: QuoteRequestCardProps) {
  const { toast } = useToast();
  
  // Fetch contractor info
  const { data: contractor } = useQuery<Contractor>({
    queryKey: [`/api/contractors/${quote.contractorId}`],
    enabled: !!quote.contractorId,
  });
  
  // Mutation to update a quote
  const updateQuoteMutation = useMutation({
    mutationFn: async (data: Partial<Quote>) => {
      const res = await apiRequest("PATCH", `/api/quotes/${quote.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Quote Updated",
        description: "The quote has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };
  
  // Get badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
      case "received":
        return "bg-green-100 hover:bg-green-200 text-green-800";
      case "accepted":
        return "bg-blue-100 hover:bg-blue-200 text-blue-800";
      case "completed":
        return "bg-purple-100 hover:bg-purple-200 text-purple-800";
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
    }
  };
  
  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Awaiting Response";
      case "received":
        return "Quote Received";
      case "accepted":
        return "Quote Accepted";
      case "completed":
        return "Project Completed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const handleCancelQuote = () => {
    updateQuoteMutation.mutate({ status: "cancelled" });
  };
  
  const handleAcceptQuote = () => {
    updateQuoteMutation.mutate({ status: "accepted" });
  };

  if (!project) {
    return <div>Error: Project not found</div>;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-medium text-gray-900">{project.name} Quote</h4>
          <p className="mt-1 text-sm text-gray-500">
            {contractor ? `From ${contractor.name}` : 'Loading contractor...'} • Created {formatDate(quote.createdAt)}
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <Badge className={getStatusBadgeClass(quote.status)}>
            {getStatusText(quote.status)}
          </Badge>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="font-medium text-gray-700">Project Type</p>
          <p className="text-gray-500">{project.type}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Quote Amount</p>
          <p className="text-gray-500">{quote.amount ? `$${quote.amount.toLocaleString()}` : 'Pending'}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Timeline</p>
          <p className="text-gray-500">{quote.timeline || project.timeline || 'Not specified'}</p>
        </div>
      </div>
      
      {contractor && (
        <div className="mt-4">
          <Badge variant="outline" className="bg-primary-100 text-primary-800">
            {contractor.name}
          </Badge>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
        <Link href={`/quotes/${quote.id}`}>
          <Button variant="ghost" className="text-primary">
            View Details
          </Button>
        </Link>
        
        <div className="flex items-center space-x-2">
          {quote.status === "received" && (
            <Button
              variant="ghost"
              className="text-green-600"
              onClick={handleAcceptQuote}
              disabled={updateQuoteMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Accept
            </Button>
          )}
          
          {quote.status === "received" && (
            <Link href={`/quotes/compare/${project.id}`}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" /> Compare Quotes
              </Button>
            </Link>
          )}
          
          {quote.status === "pending" && (
            <>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600" 
                onClick={handleCancelQuote}
                disabled={updateQuoteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
