import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Project, Quote, Contractor } from "@shared/schema";
import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { 
  ArrowLeft, 
  CheckCircle, 
  DollarSign, 
  Clock
} from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function QuoteComparisonPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const projectIdNum = parseInt(projectId);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch project details
  const { 
    data: project, 
    isLoading: projectLoading, 
    error: projectError 
  } = useQuery<Project>({
    queryKey: [`/api/projects/${projectIdNum}`],
    enabled: !!projectIdNum && !!user,
  });

  // Fetch quotes for this project
  const { 
    data: allQuotes, 
    isLoading: quotesLoading 
  } = useQuery<Quote[]>({
    queryKey: [`/api/quotes`],
    select: (data) => data.filter(quote => quote.projectId === projectIdNum),
    enabled: !!projectIdNum && !!user,
  });

  // Filter only received/accepted quotes
  const quotes = allQuotes?.filter(quote => 
    quote.status === "received" || quote.status === "accepted"
  );

  // Fetch contractors
  const { data: contractors, isLoading: contractorsLoading } = useQuery<Contractor[]>({
    queryKey: ['/api/contractors'],
    enabled: !!quotes && quotes.length > 0,
  });

  // Get contractor by ID
  const getContractor = (contractorId: number) => {
    return contractors?.find(c => c.id === contractorId);
  };

  // Get initial for avatar fallback
  const getInitial = (name: string) => {
    return name.charAt(0);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const isLoading = projectLoading || quotesLoading || contractorsLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </MainLayout>
    );
  }

  if (projectError || !project) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Project not found</h2>
          <p className="mt-2 text-gray-500">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(`/projects/${projectIdNum}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Quote Comparison</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900">No quotes to compare</h2>
              <p className="mt-2 text-gray-500">There are no received or accepted quotes for this project yet.</p>
              <Button className="mt-6" onClick={() => navigate(`/projects/${projectIdNum}`)}>
                Back to Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(`/projects/${projectIdNum}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Quote Comparison</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Comparing Quotes for: {project.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{project.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Project Type</p>
              <p className="font-semibold text-gray-900">{project.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="font-semibold text-gray-900">{project.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Budget</p>
              <p className="font-semibold text-gray-900">
                {project.estimatedCostMin && project.estimatedCostMax
                  ? `$${project.estimatedCostMin.toLocaleString()} - $${project.estimatedCostMax.toLocaleString()}`
                  : project.estimatedCostMin
                    ? `$${project.estimatedCostMin.toLocaleString()}`
                    : "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quote Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => {
                  const contractor = getContractor(quote.contractorId);
                  return (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            {contractor?.profileImage ? (
                              <AvatarImage src={contractor.profileImage} alt={contractor.name} />
                            ) : (
                              <AvatarFallback className="bg-primary text-white">
                                {contractor ? getInitial(contractor.name) : "?"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {contractor?.name || "Unknown Contractor"}
                            </p>
                            {contractor && (
                              <StarRating rating={contractor.rating} size="sm" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="font-medium">
                            {quote.amount ? `$${quote.amount.toLocaleString()}` : "Not specified"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span>{quote.timeline || "Not specified"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(quote.createdAt)}</TableCell>
                      <TableCell>
                        <Badge className={
                          quote.status === "accepted" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-100 text-blue-800"
                        }>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/quotes/${quote.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Decision Factors</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Price</h4>
                  <p className="text-gray-600">Compare the quote amounts against your budget and the scope of work</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Timeline</h4>
                  <p className="text-gray-600">Consider how each contractor's timeline aligns with your needs</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <StarRating rating={5} size="sm" className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Rating & Experience</h4>
                  <p className="text-gray-600">Review each contractor's rating, reviews, and experience level</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Scope of Work</h4>
                  <p className="text-gray-600">Ensure each quote covers all your project requirements and specifications</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button variant="outline" onClick={() => navigate(`/projects/${projectIdNum}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project
        </Button>
      </div>
    </MainLayout>
  );
}
