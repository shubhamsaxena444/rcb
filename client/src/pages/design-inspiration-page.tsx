import React from "react";
import DesignInspirationCarousel from "@/components/design/design-inspiration-carousel";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function DesignInspirationPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-2">Design Inspiration Gallery</h1>
        <p className="text-muted-foreground mb-6">
          Explore AI-generated design inspirations for your home renovation and construction projects
        </p>
        
        <DesignInspirationCarousel />
        
        <div className="mt-10 p-6 border rounded-lg bg-muted/30">
          <h2 className="text-xl font-semibold mb-4">How to Use Design Inspirations</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-medium">1. Generate Custom Designs</h3>
              <p className="text-sm text-muted-foreground">
                Select a room type and style, then optionally add custom descriptions to generate personalized design inspirations using AI.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">2. Explore Design Tips</h3>
              <p className="text-sm text-muted-foreground">
                View detailed design tips and recommendations for each inspiration to guide your renovation decisions.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">3. Share with Contractors</h3>
              <p className="text-sm text-muted-foreground">
                Use these designs as references when communicating with contractors to help visualize your project goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}