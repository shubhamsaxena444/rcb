import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  reviewCount?: number;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showText = false,
  reviewCount,
  className
}: StarRatingProps) {
  // Calculate filled stars and half stars
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Size mappings
  const sizeMap = {
    sm: {
      icon: "h-3 w-3",
      text: "text-xs",
      gap: "gap-0.5"
    },
    md: {
      icon: "h-4 w-4",
      text: "text-sm",
      gap: "gap-1"
    },
    lg: {
      icon: "h-6 w-6",
      text: "text-base",
      gap: "gap-1.5"
    }
  };

  return (
    <div className={cn("flex items-center", sizeMap[size].gap, className)}>
      <div className="flex">
        {/* Filled stars */}
        {Array.from({ length: filledStars }).map((_, i) => (
          <Star 
            key={`filled-${i}`} 
            className={cn("fill-yellow-400 text-yellow-400", sizeMap[size].icon)} 
          />
        ))}
        
        {/* Half star if needed */}
        {hasHalfStar && (
          <StarHalf 
            className={cn("text-yellow-400 fill-yellow-400", sizeMap[size].icon)}
          />
        )}
        
        {/* Empty stars */}
        {Array.from({ length: maxRating - filledStars - (hasHalfStar ? 1 : 0) }).map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            className={cn("text-yellow-400", sizeMap[size].icon)} 
          />
        ))}
      </div>
      
      {showText && (
        <span className={cn("text-gray-500 ml-1.5", sizeMap[size].text)}>
          {reviewCount ? `(${reviewCount})` : `${rating.toFixed(1)}/${maxRating}`}
        </span>
      )}
    </div>
  );
}
