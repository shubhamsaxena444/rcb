import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import ARRoomViewer from './ar-room-viewer';

interface ARRoomButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  className?: string;
}

export default function ARRoomButton({ variant = 'default', className = '' }: ARRoomButtonProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Camera className="mr-2 h-4 w-4" />
        AR Room Preview
      </Button>
      
      <ARRoomViewer 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
}