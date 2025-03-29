import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useQuery } from '@tanstack/react-query';
import { Contractor } from '@shared/schema';
import { Loader2, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Map container style
const containerStyle = {
  width: '100%',
  height: '500px'
};

// Default center position (New Delhi, India)
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

interface ContractorMapProps {
  contractors?: Contractor[];
  selectedContractorId?: number;
  onSelectContractor?: (contractor: Contractor) => void;
  showInfoWindows?: boolean;
}

export default function ContractorMap({
  contractors: propContractors,
  selectedContractorId,
  onSelectContractor,
  showInfoWindows = true
}: ContractorMapProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });

  // Fetch contractors if not provided as props
  const { data: fetchedContractors, isLoading: isLoadingContractors } = useQuery({
    queryKey: ['/api/contractors'],
    enabled: !propContractors
  });

  const contractors = propContractors || fetchedContractors || [];
  
  // State for the map and selected marker
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Contractor | null>(null);
  
  // Set center based on user's location or default to New Delhi
  const [center, setCenter] = useState(defaultCenter);
  
  // Try to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // If user denies location access, use default center
          toast({
            title: "Location access denied",
            description: "Using default location. Grant location access for better results.",
            variant: "default",
          });
        }
      );
    }
  }, [toast]);
  
  // Set selected marker based on selectedContractorId
  useEffect(() => {
    if (selectedContractorId && contractors) {
      const selected = contractors.find(c => c.id === selectedContractorId);
      if (selected) {
        setSelectedMarker(selected);
      }
    }
  }, [selectedContractorId, contractors]);

  // Callback when the map is loaded
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Callback when the map is unmounted
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);
  
  // Handle marker click
  const handleMarkerClick = (contractor: Contractor) => {
    setSelectedMarker(contractor);
    if (onSelectContractor) {
      onSelectContractor(contractor);
    }
  };
  
  // Navigate to contractor profile
  const goToContractorProfile = (contractorId: number) => {
    navigate(`/contractors/${contractorId}`);
  };

  if (loadError) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted">
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">Failed to load Google Maps</p>
          <p className="text-muted-foreground text-sm">Please check your internet connection or API key configuration.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || isLoadingContractors) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {/* Add markers for each contractor */}
        {contractors.map((contractor) => {
          // Use default location if contractor doesn't have lat/lng
          // In a real app, you'd geocode addresses to get lat/lng
          const position = {
            lat: contractor.latitude || defaultCenter.lat + (Math.random() * 0.1 - 0.05),
            lng: contractor.longitude || defaultCenter.lng + (Math.random() * 0.1 - 0.05)
          };
          
          return (
            <Marker
              key={contractor.id}
              position={position}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new google.maps.Size(40, 40)
              }}
              onClick={() => handleMarkerClick(contractor)}
              animation={google.maps.Animation.DROP}
            />
          );
        })}
        
        {/* Show info window for selected marker */}
        {showInfoWindows && selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.latitude || defaultCenter.lat + (Math.random() * 0.1 - 0.05),
              lng: selectedMarker.longitude || defaultCenter.lng + (Math.random() * 0.1 - 0.05)
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 max-w-[250px]">
              <h3 className="font-semibold text-sm">{selectedMarker.name}</h3>
              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{selectedMarker.location}</span>
              </div>
              <div className="mt-2 flex gap-1">
                {selectedMarker.specialties.slice(0, 2).map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-[10px]">
                    {specialty}
                  </Badge>
                ))}
                {selectedMarker.specialties.length > 2 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{selectedMarker.specialties.length - 2}
                  </Badge>
                )}
              </div>
              <Button 
                variant="link" 
                className="p-0 h-auto mt-2 text-xs"
                onClick={() => goToContractorProfile(selectedMarker.id)}
              >
                View Profile
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}