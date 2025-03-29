import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample design styles
const designStyles = [
  "Modern",
  "Contemporary",
  "Minimalist",
  "Traditional",
  "Indo-Colonial",
  "Bohemian",
  "Industrial",
  "Mid-Century Modern",
  "Rustic",
  "Art Deco",
  "Coastal",
  "Eclectic",
  "Scandinavian",
  "Transitional",
  "Farmhouse",
];

// Sample room types
const roomTypes = [
  "Living Room",
  "Kitchen",
  "Bedroom",
  "Bathroom",
  "Dining Room",
  "Home Office",
  "Balcony",
  "Patio",
  "Courtyard",
  "Garden",
  "Pooja Room",
  "Entertainment Room",
  "Basement",
  "Terrace",
  "Kids Room",
];

// Mock inspirations with placeholder images for initial render
const placeholderInspirations = [
  {
    style: "Modern",
    room: "Living Room",
    description: "Explore design inspirations by selecting room and style...",
    tips: [
      "Choose a style and room to generate design ideas",
      "Add custom specifications in the description",
      "Save your favorite designs for future reference",
    ],
    image: null,
  },
  {
    style: "Contemporary",
    room: "Kitchen",
    description: "AI can help visualize your dream spaces...",
    tips: [
      "Try different style combinations",
      "Specify color preferences in the description",
      "Consider ergonomics and functionality for your space",
    ],
    image: null,
  },
  {
    style: "Traditional",
    room: "Bedroom",
    description: "Get personalized design recommendations...",
    tips: [
      "Include existing furniture in your description",
      "Mention color preferences or restrictions",
      "Consider the natural light in your space",
    ],
    image: null,
  },
];

interface DesignInspiration {
  style: string;
  room: string;
  description: string;
  image: string | null;
  tips: string[];
  prompt?: string;
}

export default function DesignInspirationCarousel() {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [inspirations, setInspirations] = useState<DesignInspiration[]>(placeholderInspirations);
  const [activeInspiration, setActiveInspiration] = useState<DesignInspiration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const { toast } = useToast();

  // Generate a new design inspiration
  const generateDesignInspiration = async () => {
    if (!selectedStyle || !selectedRoom) {
      toast({
        title: "Selection required",
        description: "Please select both a style and room type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await apiRequest("POST", "/api/design/inspiration", {
        style: selectedStyle,
        room: selectedRoom,
        description: customDescription || undefined,
      });

      const newInspiration = await response.json();

      // Add the new inspiration to the beginning of the array
      setInspirations(prev => [newInspiration, ...prev].slice(0, 10));
      
      toast({
        title: "Design generated!",
        description: `${selectedStyle} ${selectedRoom} design has been created.`,
      });
    } catch (error) {
      console.error("Error generating design inspiration:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate design inspiration. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const openDetailView = (inspiration: DesignInspiration) => {
    setActiveInspiration(inspiration);
    setIsDetailOpen(true);
  };

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Design Inspirations</h2>
          <p className="text-muted-foreground">
            Explore AI-generated design ideas tailored for Indian homes
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="grid grid-cols-2 gap-4 w-full md:flex md:flex-row">
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((room) => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                {designStyles.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={generateDesignInspiration} 
            disabled={isGenerating || !selectedRoom || !selectedStyle}
            className="w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Design
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <Carousel className="w-full">
          <CarouselContent>
            {inspirations.map((inspiration, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full flex flex-col">
                  <CardHeader className="p-4">
                    <CardTitle className="text-md truncate">
                      {inspiration.style} {inspiration.room}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {inspiration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow flex items-center justify-center">
                    {inspiration.image ? (
                      <img
                        src={inspiration.image}
                        alt={`${inspiration.style} ${inspiration.room}`}
                        className="rounded-md object-cover w-full h-48"
                        onClick={() => openDetailView(inspiration)}
                      />
                    ) : (
                      <div className="border rounded-md flex items-center justify-center w-full h-48 bg-muted">
                        <p className="text-muted-foreground text-sm text-center p-4">
                          Generate your first design by selecting a style and room type
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {inspiration.image ? (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => openDetailView(inspiration)}
                      >
                        View Details
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        disabled={!selectedRoom || !selectedStyle || isGenerating}
                        onClick={generateDesignInspiration}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate Design
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:block">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
      
      {/* Custom Description Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">Add Custom Description</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Custom Design Description</DialogTitle>
            <DialogDescription>
              Add specific requirements or preferences for your design inspiration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customDescription">Description</Label>
              <Textarea
                id="customDescription"
                placeholder="E.g., Wood finishes, color preferences, existing furniture, space constraints..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setCustomDescription("")} variant="outline" className="mr-2">
              Clear
            </Button>
            <DialogTrigger asChild>
              <Button>Save Description</Button>
            </DialogTrigger>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Design Detail View */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {activeInspiration && (
            <>
              <DialogHeader>
                <DialogTitle>{activeInspiration.style} {activeInspiration.room}</DialogTitle>
                <DialogDescription>
                  {activeInspiration.description}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="rounded-md overflow-hidden mb-4">
                  {activeInspiration.image && (
                    <img
                      src={activeInspiration.image}
                      alt={`${activeInspiration.style} ${activeInspiration.room}`}
                      className="w-full object-cover max-h-[400px]"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Design Tips</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {activeInspiration.tips.map((tip, index) => (
                        <li key={index} className="text-sm">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}