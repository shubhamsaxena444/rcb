import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// Our predefined furniture and decoration items
const FURNITURE_ITEMS = [
  { id: 'sofa1', name: 'Modern Sofa', type: 'sofa', color: '#A0522D', width: 2, height: 0.8, depth: 0.8 },
  { id: 'sofa2', name: 'Sectional Sofa', type: 'sofa', color: '#8B4513', width: 2.5, height: 0.8, depth: 0.8 },
  { id: 'table1', name: 'Coffee Table', type: 'table', color: '#5F9EA0', width: 1.2, height: 0.4, depth: 0.6 },
  { id: 'chair1', name: 'Dining Chair', type: 'chair', color: '#2F4F4F', width: 0.5, height: 0.9, depth: 0.5 },
  { id: 'bed1', name: 'Queen Bed', type: 'bed', color: '#4682B4', width: 1.5, height: 0.5, depth: 2 },
  { id: 'cabinet1', name: 'Storage Cabinet', type: 'cabinet', color: '#8B4513', width: 1, height: 1.8, depth: 0.4 },
];

const WALL_COLORS = [
  { id: 'white', name: 'White', color: '#FFFFFF' },
  { id: 'beige', name: 'Beige', color: '#F5F5DC' },
  { id: 'lightgray', name: 'Light Gray', color: '#D3D3D3' },
  { id: 'lightblue', name: 'Light Blue', color: '#ADD8E6' },
  { id: 'mint', name: 'Mint', color: '#98FB98' },
  { id: 'peach', name: 'Peach', color: '#FFDAB9' },
];

const FLOOR_TYPES = [
  { id: 'hardwood', name: 'Hardwood', color: '#8B4513' },
  { id: 'tile', name: 'Ceramic Tile', color: '#F5F5F5' },
  { id: 'laminate', name: 'Laminate', color: '#DEB887' },
  { id: 'carpet', name: 'Carpet', color: '#A9A9A9' },
  { id: 'vinyl', name: 'Vinyl', color: '#D2B48C' },
  { id: 'marble', name: 'Marble', color: '#F0F0F0' },
];

interface ARRoomViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ARRoomViewer({ open, onOpenChange }: ARRoomViewerProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('furniture');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  
  // Function to capture current webcam frame
  const captureFrame = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      toast({
        title: "Image captured",
        description: "You can now add virtual elements to your room",
      });
    }
  };
  
  // Function to reset the captured image
  const resetCapture = () => {
    setCapturedImage(null);
    setSelectedItems([]);
  };
  
  // Function to add an item to the preview
  const addItem = (item: any) => {
    setSelectedItems([...selectedItems, {
      ...item,
      id: `${item.id}_${Date.now()}`, // Generate unique ID
      position: { x: 50, y: 50 }, // Default position in the middle
      rotation: 0,
      scale: 1,
    }]);
    
    toast({
      title: `Added ${item.name}`,
      description: "Drag to position it in your room",
    });
  };
  
  // Function to remove an item from the preview
  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };
  
  // Function to handle drag events for positioning items
  const handleDragItem = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setSelectedItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, position: { x, y } }
          : item
      )
    );
  };
  
  // Function to handle saving the design
  const saveDesign = () => {
    toast({
      title: "Design saved",
      description: "Your AR room design has been saved successfully",
    });
    onOpenChange(false);
  };
  
  // Helper function to generate furniture item visualization
  const renderFurniturePreview = (item: any) => {
    const { width, height, color } = item;
    const aspectRatio = width / height;
    const displayWidth = Math.min(60, aspectRatio * 40);
    
    return (
      <div 
        style={{ 
          backgroundColor: color,
          width: `${displayWidth}px`,
          height: `${displayWidth / aspectRatio}px`,
          borderRadius: '2px',
        }}
      />
    );
  };
  
  // Function to render the items on the canvas when we have a captured image
  const renderItemsOnCanvas = () => {
    if (!canvasRef.current || !capturedImage) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw the captured image as background
    const img = new Image();
    img.src = capturedImage;
    img.onload = () => {
      // Adjust canvas size to match image
      canvasRef.current!.width = img.width;
      canvasRef.current!.height = img.height;
      
      // Draw background image
      ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
      
      // Draw each item
      selectedItems.forEach(item => {
        const { position, width, height, color } = item;
        const x = (position.x / 100) * canvasRef.current!.width;
        const y = (position.y / 100) * canvasRef.current!.height;
        
        // Adjust size based on position (perspective simulation)
        const sizeAdjust = 1 - (position.y / 200); // Items lower in frame are larger
        const drawWidth = (width * 50) * sizeAdjust;
        const drawHeight = (height * 50) * sizeAdjust;
        
        // Draw rectangular representation of furniture
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(
          x - drawWidth/2,
          y - drawHeight/2,
          drawWidth,
          drawHeight
        );
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add label
        ctx.font = '12px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, x, y);
      });
    };
  };
  
  // Render items whenever selected items change
  useEffect(() => {
    renderItemsOnCanvas();
  }, [selectedItems, capturedImage]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>AR Room Preview</DialogTitle>
          <DialogDescription>
            Capture your room and add virtual furniture, colors, and materials to visualize your renovation
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
          {/* Main Preview Area */}
          <div className="flex-1 relative min-h-[300px] border rounded-lg overflow-hidden">
            {!capturedImage ? (
              <div className="relative w-full h-full">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "environment"
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Button 
                    onClick={captureFrame}
                    size="lg"
                    variant="default"
                    className="rounded-full h-14 w-14 p-0 flex items-center justify-center"
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button 
                    onClick={resetCapture}
                    size="sm"
                    variant="destructive"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Design Controls */}
          {capturedImage && (
            <div className="w-full md:w-72 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="furniture">Furniture</TabsTrigger>
                  <TabsTrigger value="walls">Walls</TabsTrigger>
                  <TabsTrigger value="floor">Floor</TabsTrigger>
                </TabsList>
                
                <TabsContent value="furniture" className="border rounded-lg mt-2">
                  <ScrollArea className="h-[300px] md:h-[400px]">
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {FURNITURE_ITEMS.map((item) => (
                        <Card 
                          key={item.id} 
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => addItem(item)}
                        >
                          <CardContent className="p-3 flex flex-col items-center">
                            <div className="w-full flex justify-center py-2">
                              {renderFurniturePreview(item)}
                            </div>
                            <p className="text-sm font-medium mt-2 text-center">{item.name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="walls" className="border rounded-lg mt-2">
                  <ScrollArea className="h-[300px] md:h-[400px]">
                    <div className="grid grid-cols-3 gap-2 p-2">
                      {WALL_COLORS.map((color) => (
                        <Card 
                          key={color.id} 
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => addItem({
                            ...color,
                            type: 'wall',
                            width: 100,
                            height: 100,
                          })}
                        >
                          <CardContent className="p-3 flex flex-col items-center">
                            <div 
                              className="w-12 h-12 rounded-md" 
                              style={{ backgroundColor: color.color }}
                            />
                            <p className="text-sm font-medium mt-2 text-center">{color.name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="floor" className="border rounded-lg mt-2">
                  <ScrollArea className="h-[300px] md:h-[400px]">
                    <div className="grid grid-cols-3 gap-2 p-2">
                      {FLOOR_TYPES.map((floor) => (
                        <Card 
                          key={floor.id} 
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => addItem({
                            ...floor,
                            type: 'floor',
                            width: 100,
                            height: 50,
                          })}
                        >
                          <CardContent className="p-3 flex flex-col items-center">
                            <div 
                              className="w-12 h-12 rounded-md" 
                              style={{ backgroundColor: floor.color }}
                            />
                            <p className="text-sm font-medium mt-2 text-center">{floor.name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              
              {selectedItems.length > 0 && (
                <div className="mt-4 border rounded-lg p-2">
                  <p className="text-sm font-medium mb-2">Added Items:</p>
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-1">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {capturedImage && (
            <Button onClick={saveDesign}>
              <Check className="mr-1 h-4 w-4" />
              Save Design
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}