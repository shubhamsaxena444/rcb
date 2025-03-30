import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ARRoomButton from '@/components/ar/ar-room-button';
import { Camera, Palette, Ruler, Zap } from 'lucide-react';

export default function ARPreviewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          AR Room Preview
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-8">
          Use augmented reality to visualize your renovation projects. See how new furniture, 
          colors, and materials will look in your actual space before making any purchases.
        </p>
        <ARRoomButton variant="default" className="text-lg px-8 py-6" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Camera className="h-6 w-6 mr-2 text-primary" />
              <CardTitle>How It Works</CardTitle>
            </div>
            <CardDescription>
              Our AR technology helps you visualize your renovation ideas in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal ml-6 space-y-3">
              <li>
                <strong>Capture your room</strong> using your device's camera
              </li>
              <li>
                <strong>Add virtual furniture, colors, and materials</strong> from our extensive library
              </li>
              <li>
                <strong>Arrange and customize</strong> items to match your vision
              </li>
              <li>
                <strong>Save your design</strong> to reference later or share with contractors
              </li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Zap className="h-6 w-6 mr-2 text-primary" />
              <CardTitle>Benefits</CardTitle>
            </div>
            <CardDescription>
              Why use AR for your renovation planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6 space-y-3">
              <li>
                <strong>Visualize before committing</strong> - See exactly how changes will look
              </li>
              <li>
                <strong>Avoid costly mistakes</strong> - Ensure furniture fits and colors match
              </li>
              <li>
                <strong>Experiment freely</strong> - Try different styles without any risk
              </li>
              <li>
                <strong>Better communication</strong> - Share your exact vision with contractors
              </li>
              <li>
                <strong>Save time and money</strong> - Make confident decisions from the start
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="furniture" className="mb-16">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8">
          <TabsTrigger value="furniture">Furniture</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="furniture">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Ruler className="h-10 w-10 text-primary" />}
              title="Accurate Sizing"
              description="All furniture is rendered to scale, so you can see exactly how pieces will fit in your space."
            />
            <FeatureCard 
              icon={<Palette className="h-10 w-10 text-primary" />}
              title="Multiple Styles"
              description="Browse through different furniture styles from modern to traditional to find your perfect match."
            />
            <FeatureCard 
              icon={<Camera className="h-10 w-10 text-primary" />}
              title="3D Visualization"
              description="View furniture from different angles to get a complete understanding of how it will look."
            />
          </div>
        </TabsContent>
        
        <TabsContent value="colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Palette className="h-10 w-10 text-primary" />}
              title="Realistic Color Rendering"
              description="See exactly how paint colors will look in your lighting conditions before buying a single can."
            />
            <FeatureCard 
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Instant Changes"
              description="Switch between colors instantly to compare different options side-by-side."
            />
            <FeatureCard 
              icon={<Camera className="h-10 w-10 text-primary" />}
              title="Full Room Preview"
              description="Apply colors to specific walls or the entire room to visualize the complete transformation."
            />
          </div>
        </TabsContent>
        
        <TabsContent value="materials">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Ruler className="h-10 w-10 text-primary" />}
              title="Texture Visualization"
              description="See how different materials like hardwood, tile, or carpet will look and feel in your space."
            />
            <FeatureCard 
              icon={<Palette className="h-10 w-10 text-primary" />}
              title="Material Matching"
              description="Test how different materials work together to create a cohesive design."
            />
            <FeatureCard 
              icon={<Camera className="h-10 w-10 text-primary" />}
              title="Lighting Effects"
              description="Understand how materials will reflect or absorb light in your specific room conditions."
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <Card className="mb-16 text-center p-8">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to Transform Your Space?</CardTitle>
          <CardDescription className="text-lg">
            Try our AR Room Preview tool and start visualizing your dream renovation today!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ARRoomButton variant="default" className="mt-4" />
        </CardContent>
      </Card>
      
      <div className="text-center text-muted-foreground">
        <p className="mb-2">
          The AR Room Preview feature works best on modern devices with adequate camera capabilities.
        </p>
        <p>
          Please ensure you allow camera permissions when prompted for the best experience.
        </p>
      </div>
    </div>
  );
}

// Helper component for feature cards
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="flex flex-col items-center text-center p-6">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}