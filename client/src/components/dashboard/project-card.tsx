import { Project } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  // Helper function to get badge color based on status
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

  // Format date to readable format
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return d.toLocaleDateString();
  };

  // Format estimated cost range
  const getEstimatedCost = () => {
    if (project.estimatedCostMin && project.estimatedCostMax) {
      return `$${project.estimatedCostMin.toLocaleString()} - $${project.estimatedCostMax.toLocaleString()}`;
    } else if (project.estimatedCostMin) {
      return `$${project.estimatedCostMin.toLocaleString()}`;
    } else if (project.actualCost) {
      return `$${project.actualCost.toLocaleString()}`;
    }
    return "Not set";
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formatDate(project.updatedAt)}
            </p>
          </div>
          <Badge className={getStatusBadgeClass(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{getEstimatedCost()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Type</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{project.type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Timeline</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{project.timeline || "Not set"}</p>
          </div>
        </div>

        <div className="mt-4">
          <Link href={`/projects/${project.id}`}>
            <a className="text-sm font-medium text-primary hover:text-primary/90 inline-flex items-center">
              View details <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
