import React from "react";
import DesignInspirationCarousel from "@/components/design/design-inspiration-carousel";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ImageIcon, BookmarkIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DesignInspirationPage() {
  const { user, isLoading } = useAuth();
  const [selectedDesign, setSelectedDesign] = React.useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState<boolean>(false);
  
  // Fetch saved designs
  const { 
    data: savedDesigns, 
    isLoading: isLoadingDesigns 
  } = useQuery({
    queryKey: ['/api/design/inspirations'],
    enabled: !!user && !isLoading
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  const openDetailView = (design: any) => {
    setSelectedDesign(design);
    setIsDetailOpen(true);
  };

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-2">Design Inspiration Gallery</h1>
        <p className="text-muted-foreground mb-6">
          Explore AI-generated design inspirations for your home renovation and construction projects
        </p>
        
        <DesignInspirationCarousel />
        
        {/* Saved Designs Section */}
        {user && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Your Saved Designs</h2>
              <Badge variant="outline" className="px-3 py-1">
                {isLoadingDesigns ? 'Loading...' : 
                  savedDesigns && savedDesigns.length > 0 ? 
                  `${savedDesigns.length} saved` : 'No saved designs'}
              </Badge>
            </div>
            
            {isLoadingDesigns ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-border" />
              </div>
            ) : savedDesigns && savedDesigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedDesigns.map((design: any) => (
                  <Card key={design.id} className="h-full flex flex-col">
                    <CardHeader className="p-4">
                      <CardTitle className="text-md truncate">
                        {design.style} {design.room}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {design.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-grow flex items-center justify-center">
                      {design.imageUrl ? (
                        <img
                          src={design.imageUrl}
                          alt={`${design.style} ${design.room}`}
                          className="rounded-md object-cover w-full h-48"
                          onClick={() => openDetailView(design)}
                        />
                      ) : (
                        <div className="border rounded-md flex items-center justify-center w-full h-48 bg-muted">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => openDetailView(design)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg p-12 text-center bg-muted/30">
                <BookmarkIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Saved Designs Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate design inspirations using the tool above and they will automatically be saved to your profile.
                </p>
              </div>
            )}
          </div>
        )}
        
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
      
      {/* Design Detail View */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {selectedDesign && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDesign.style} {selectedDesign.room}</DialogTitle>
                <DialogDescription>
                  {selectedDesign.description || 'No description provided'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="rounded-md overflow-hidden mb-4">
                  {selectedDesign.imageUrl && (
                    <img
                      src={selectedDesign.imageUrl}
                      alt={`${selectedDesign.style} ${selectedDesign.room}`}
                      className="w-full object-cover max-h-[400px]"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Design Tips</h3>
                    {selectedDesign.tips && selectedDesign.tips.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedDesign.tips.map((tip: string, index: number) => (
                          <li key={index} className="text-sm">{tip}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No design tips available for this inspiration.</p>
                    )}
                  </div>
                  {selectedDesign.prompt && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">AI Prompt</h3>
                      <p className="text-sm border p-3 rounded bg-muted/20">{selectedDesign.prompt}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}