import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ProjectStats } from "@/types";
import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectSummary() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Calculate project statistics
  const getProjectStats = (): ProjectStats => {
    if (!projects) return { total: 0, inProgress: 0, completed: 0, planning: 0 };
    
    return {
      total: projects.length,
      inProgress: projects.filter(p => p.status === "in-progress").length,
      completed: projects.filter(p => p.status === "completed").length,
      planning: projects.filter(p => p.status === "planning").length
    };
  };

  const stats = getProjectStats();

  if (error) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-red-500">Error loading projects: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-6 font-medium text-gray-900">Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <div className="animate-pulse space-y-4 w-full">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Start creating your first renovation or construction project</p>
            </div>
          )}
          
          <div className="mt-6">
            <Link href="/projects/new">
              <Button className="w-full sm:w-auto">
                <PlusIcon className="h-4 w-4 mr-2" /> Create New Project
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
