import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Project, Quote, Review } from "@shared/schema";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  LucideIcon, 
  Calendar, 
  Home, 
  MapPin, 
  Ruler, 
  DollarSign, 
  Users, 
  Clock, 
  ClipboardList,
  PlusIcon
} from "lucide-react";
import { Link } from "wouter";
import QuoteRequestCard from "@/components/quotes/quote-request-card";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch project details
  const { 
    data: project, 
    isLoading: projectLoading, 
    error: projectError 
  } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId && !!user,
  });

  // Fetch quotes for this project
  const { 
    data: quotes, 
    isLoading: quotesLoading 
  } = useQuery<Quote[]>({
    queryKey: [`/api/quotes`],
    select: (data) => data.filter(quote => quote.projectId === projectId),
    enabled: !!projectId && !!user,
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/projects/${projectId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project Deleted",
        description: "The project has been successfully deleted.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect if project doesn't exist or doesn't belong to user
  useEffect(() => {
    if (projectError) {
      toast({
        title: "Error",
        description: "Project not found or you don't have access to it.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [projectError, navigate, toast]);

  // Handle delete project
  const handleDeleteProject = () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProjectMutation.mutate();
    }
  };

  // Get badge color based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "planning":
        return "bg-blue-100 hover:bg-blue-200 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
      case "completed":
        return "bg-green-100 hover:bg-green-200 text-green-800";
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (projectLoading) {
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

  if (!project) {
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

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          <Badge className={getStatusBadgeClass(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${projectId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600" 
            onClick={handleDeleteProject}
            disabled={deleteProjectMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ProjectInfoCard 
          icon={Home} 
          title="Project Type" 
          value={project.type} 
        />
        <ProjectInfoCard 
          icon={MapPin} 
          title="Location" 
          value={project.location || "Not specified"} 
        />
        <ProjectInfoCard 
          icon={Ruler} 
          title="Square Footage" 
          value={project.squareFootage ? `${project.squareFootage} sq ft` : "Not specified"} 
        />
        <ProjectInfoCard 
          icon={DollarSign} 
          title="Estimated Cost" 
          value={
            project.estimatedCostMin && project.estimatedCostMax 
              ? `$${project.estimatedCostMin.toLocaleString()} - $${project.estimatedCostMax.toLocaleString()}`
              : project.estimatedCostMin 
                ? `$${project.estimatedCostMin.toLocaleString()}`
                : project.actualCost
                  ? `$${project.actualCost.toLocaleString()}`
                  : "Not specified"
          } 
        />
        <ProjectInfoCard 
          icon={Clock} 
          title="Timeline" 
          value={project.timeline || "Not specified"} 
        />
        <ProjectInfoCard 
          icon={Calendar} 
          title="Created On" 
          value={formatDate(project.createdAt)} 
        />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{project.description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="quotes" className="mb-8">
        <TabsList>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="details">Additional Details</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Quote Requests</h2>
            <Link href={`/projects/${projectId}/request-quote`}>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" /> Request New Quote
              </Button>
            </Link>
          </div>

          {quotesLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-28 bg-gray-200 rounded"></div>
              <div className="h-28 bg-gray-200 rounded"></div>
            </div>
          ) : quotes && quotes.length > 0 ? (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <QuoteRequestCard 
                  key={quote.id} 
                  quote={quote} 
                  project={project}
                />
              ))}
              
              {quotes.some(q => q.status === "received") && (
                <div className="mt-6 flex justify-center">
                  <Link href={`/quotes/compare/${projectId}`}>
                    <Button variant="outline">
                      <ClipboardList className="h-4 w-4 mr-2" /> Compare Quotes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-gray-500 mb-4">No quotes have been requested for this project yet.</p>
              <Link href={`/projects/${projectId}/request-quote`}>
                <Button>
                  <Users className="h-4 w-4 mr-2" /> Find Contractors
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              {project.details ? (
                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                  {JSON.stringify(project.details, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No additional details available for this project.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}

interface ProjectInfoCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
}

function ProjectInfoCard({ icon: Icon, title, value }: ProjectInfoCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
