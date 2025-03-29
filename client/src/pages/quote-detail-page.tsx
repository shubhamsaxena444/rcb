import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Quote, Project, Contractor } from "@shared/schema";
import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Clock, 
  Calendar, 
  FileText,
  MessageSquare
} from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const quoteId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch quote details
  const { 
    data: quote, 
    isLoading: quoteLoading, 
    error: quoteError 
  } = useQuery<Quote>({
    queryKey: [`/api/quotes/${quoteId}`],
    enabled: !!quoteId && !!user,
  });

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${quote?.projectId}`],
    enabled: !!quote?.projectId,
  });

  // Fetch contractor details
  const { data: contractor, isLoading: contractorLoading } = useQuery<Contractor>({
    queryKey: [`/api/contractors/${quote?.contractorId}`],
    enabled: !!quote?.contractorId,
  });

  // Accept/reject quote mutation
  const updateQuoteMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const res = await apiRequest("PATCH", `/api/quotes/${quoteId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Quote Updated",
        description: "The quote status has been successfully updated.",
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

  // Handle accept quote
  const handleAcceptQuote = () => {
    if (confirm("Are you sure you want to accept this quote?")) {
      updateQuoteMutation.mutate({ status: "accepted" });
    }
  };

  // Handle reject quote
  const handleRejectQuote = () => {
    if (confirm("Are you sure you want to reject this quote?")) {
      updateQuoteMutation.mutate({ status: "rejected" });
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
      case "received":
        return "bg-blue-100 hover:bg-blue-200 text-blue-800";
      case "accepted":
        return "bg-green-100 hover:bg-green-200 text-green-800";
      case "rejected":
        return "bg-red-100 hover:bg-red-200 text-red-800";
      case "completed":
        return "bg-purple-100 hover:bg-purple-200 text-purple-800";
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  // Handle navigation back to project
  const navigateToProject = () => {
    if (project) {
      navigate(`/projects/${project.id}`);
    } else {
      navigate("/");
    }
  };

  // Get initial for avatar fallback
  const getInitial = (name: string) => {
    return name.charAt(0);
  };

  const isLoading = quoteLoading || projectLoading || contractorLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </MainLayout>
    );
  }

  if (quoteError || !quote) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Quote not found</h2>
          <p className="mt-2 text-gray-500">The quote you're looking for doesn't exist or you don't have access to it.</p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={navigateToProject}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Quote Details</h1>
        <Badge className={getStatusBadgeClass(quote.status)}>
          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent>
              {project && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Project</h3>
                  <Link href={`/projects/${project.id}`}>
                    <a className="text-primary font-medium hover:underline">{project.name}</a>
                  </Link>
                  <p className="mt-1 text-gray-600">{project.description}</p>
                </div>
              )}

              {quote.amount && (
                <div className="mb-6 flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quote Amount</p>
                    <p className="text-xl font-bold text-gray-900">${quote.amount.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {quote.timeline && (
                <div className="mb-6 flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Timeline</p>
                    <p className="text-lg font-medium text-gray-900">{quote.timeline}</p>
                  </div>
                </div>
              )}

              <div className="mb-6 flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created On</p>
                  <p className="text-lg font-medium text-gray-900">{formatDate(quote.createdAt)}</p>
                </div>
              </div>

              {quote.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quote Description</h3>
                  <p className="text-gray-600">{quote.description}</p>
                </div>
              )}

              {quote.details && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Details</h3>
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                    {JSON.stringify(quote.details, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
            
            {quote.status === "received" && (
              <CardFooter className="flex justify-end space-x-2 pt-0">
                <Button 
                  variant="outline" 
                  className="text-red-600" 
                  onClick={handleRejectQuote}
                  disabled={updateQuoteMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={handleAcceptQuote}
                  disabled={updateQuoteMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Accept
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {contractor && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contractor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    {contractor.profileImage ? (
                      <AvatarImage src={contractor.profileImage} alt={contractor.name} />
                    ) : (
                      <AvatarFallback className="bg-primary text-white">
                        {getInitial(contractor.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{contractor.name}</h3>
                    <StarRating 
                      rating={contractor.rating} 
                      showText={true} 
                      reviewCount={contractor.reviewCount} 
                    />
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{contractor.description}</p>
                
                <div className="mb-4">
                  <Badge className="mb-2 bg-blue-100 text-blue-800">
                    {contractor.specialty}
                  </Badge>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contractor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link href={`/contractors/${contractor.id}`}>
                    <Button variant="outline" className="w-full mb-2">
                      <FileText className="mr-2 h-4 w-4" /> View Profile
                    </Button>
                  </Link>
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" /> Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {project && (
        <div className="flex justify-between">
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project
            </Button>
          </Link>
          
          {quote.status === "received" && (
            <Link href={`/quotes/compare/${project.id}`}>
              <Button>
                <FileText className="mr-2 h-4 w-4" /> Compare Quotes
              </Button>
            </Link>
          )}
        </div>
      )}
    </MainLayout>
  );
}
