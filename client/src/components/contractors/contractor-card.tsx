import { Contractor } from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ContractorCardProps {
  contractor: Contractor;
}

export default function ContractorCard({ contractor }: ContractorCardProps) {
  // Get first letter of contractor name for avatar fallback
  const getInitial = () => {
    return contractor.name.charAt(0);
  };
  
  // Get specialty badge color
  const getSpecialtyBadgeClass = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'general':
        return "bg-blue-100 hover:bg-blue-200 text-blue-800";
      case 'specialist':
        return "bg-green-100 hover:bg-green-200 text-green-800";
      case 'electrical':
        return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              {contractor.profileImage ? (
                <AvatarImage src={contractor.profileImage} alt={contractor.name} />
              ) : (
                <AvatarFallback className="bg-primary text-white">{getInitial()}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{contractor.name}</h3>
              <div className="mt-1 flex items-center">
                <StarRating 
                  rating={contractor.rating} 
                  showText={true} 
                  reviewCount={contractor.reviewCount} 
                />
              </div>
            </div>
          </div>
          <Badge className={getSpecialtyBadgeClass(contractor.specialty)}>
            {contractor.specialty}
          </Badge>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500">{contractor.description}</p>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {contractor.specialties.map((specialty, index) => (
            <Badge key={index} variant="outline">
              {specialty}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
          <Link href={`/contractors/${contractor.id}`}>
            <Button variant="ghost" className="text-primary">
              View Profile
            </Button>
          </Link>
          <Link href={`/projects/new?contractor=${contractor.id}`}>
            <Button variant="ghost" className="text-green-600 hover:text-green-700">
              Request Quote
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
