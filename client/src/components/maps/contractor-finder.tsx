import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contractor } from '@shared/schema';
import { Search, MapPin, Filter, Star, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import ContractorMap from './contractor-map';
import { formatCurrency } from '@/lib/format';

const specialties = [
  "General Contractor",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Roofing",
  "Landscaping",
  "HVAC",
  "Flooring",
  "Interior Design",
  "Masonry",
  "Tiling",
  "Glass & Windows",
  "Home Security",
  "Renovation"
];

const locations = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "All India"
];

export default function ContractorFinder() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<number[]>([0]);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  
  // Fetch all contractors
  const { data: contractors, isLoading } = useQuery({ 
    queryKey: ['/api/contractors']
  });

  // Filter contractors based on search criteria
  const filteredContractors = contractors?.filter(contractor => {
    const matchesQuery = searchQuery === '' || 
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesSpecialty = selectedSpecialty === '' || 
      contractor.specialties.includes(selectedSpecialty);
      
    const matchesLocation = selectedLocation === '' || selectedLocation === 'All India' ||
      contractor.location.includes(selectedLocation);
      
    const matchesRating = contractor.rating >= ratingFilter[0];
    
    return matchesQuery && matchesSpecialty && matchesLocation && matchesRating;
  });

  // View contractor profile
  const viewContractorProfile = (contractorId: number) => {
    navigate(`/contractors/${contractorId}`);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Find Contractors</h1>
      <p className="text-muted-foreground mb-6">
        Discover reliable contractors for your renovation and construction projects near you
      </p>
      
      {/* Search and Filters */}
      <div className="bg-card mb-8 p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or keyword..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any location</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-full sm:w-64">
            <Label htmlFor="rating-filter" className="text-sm font-medium mb-2 block">
              Minimum Rating: {ratingFilter[0]} ⭐
            </Label>
            <Slider
              id="rating-filter"
              min={0}
              max={5}
              step={0.5}
              value={ratingFilter}
              onValueChange={setRatingFilter}
              className="w-full"
            />
          </div>
          
          {searchQuery || selectedSpecialty || selectedLocation || ratingFilter[0] > 0 ? (
            <div className="flex-grow">
              <p className="text-sm text-muted-foreground mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <Search className="h-3 w-3" />
                    {searchQuery}
                  </Badge>
                )}
                {selectedSpecialty && (
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <Filter className="h-3 w-3" />
                    {selectedSpecialty}
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <MapPin className="h-3 w-3" />
                    {selectedLocation}
                  </Badge>
                )}
                {ratingFilter[0] > 0 && (
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <Star className="h-3 w-3" />
                    {ratingFilter[0]}+ stars
                  </Badge>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialty('');
                    setSelectedLocation('');
                    setRatingFilter([0]);
                  }}
                >
                  Clear all
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Map and List View */}
      <Tabs defaultValue="map" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="map" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="border rounded-lg p-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredContractors ? filteredContractors.length : 0} contractors found
              {searchQuery || selectedSpecialty || selectedLocation ? ' matching your criteria' : ' in your area'}
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3">
              <ContractorMap 
                contractors={filteredContractors} 
                selectedContractorId={selectedContractor?.id}
                onSelectContractor={setSelectedContractor}
              />
            </div>
            
            <div className="w-full lg:w-1/3">
              {selectedContractor ? (
                <Card className="w-full h-full">
                  <CardHeader>
                    <CardTitle>{selectedContractor.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{selectedContractor.location}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Rating</p>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-medium">{selectedContractor.rating}</span>
                          <span className="text-muted-foreground text-sm ml-1">
                            ({selectedContractor.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Price Range</p>
                        <p className="text-sm">
                          {formatCurrency(selectedContractor.minRate)} - {formatCurrency(selectedContractor.maxRate)}
                          <span className="text-muted-foreground text-xs ml-1">/day</span>
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedContractor.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="text-sm line-clamp-4">
                          {selectedContractor.description}
                        </p>
                      </div>
                      
                      <Button
                        className="w-full"
                        onClick={() => viewContractorProfile(selectedContractor.id)}
                      >
                        View Full Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-full border rounded-lg p-6 bg-muted/30">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a contractor</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Click on any marker on the map to view contractor details
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          {filteredContractors && filteredContractors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContractors.map((contractor) => (
                <Card key={contractor.id} className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{contractor.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {contractor.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pb-2">
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{contractor.rating}</span>
                      <span className="text-muted-foreground text-sm ml-1">
                        ({contractor.reviewCount} reviews)
                      </span>
                      <span className="ml-auto text-sm font-medium">
                        {formatCurrency(contractor.minRate)} - {formatCurrency(contractor.maxRate)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {contractor.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                      {contractor.specialties.length > 3 && (
                        <Badge variant="outline">
                          +{contractor.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-3 mb-3">
                      {contractor.description}
                    </p>
                  </CardContent>
                  <div className="px-6 pb-6 mt-auto">
                    <Button 
                      className="w-full" 
                      onClick={() => viewContractorProfile(contractor.id)}
                    >
                      View Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-12 text-center">
              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No contractors found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search criteria
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('');
                  setSelectedLocation('');
                  setRatingFilter([0]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Tips Section */}
      <div className="bg-muted/30 rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Tips for Finding the Right Contractor</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="font-medium">Check References & Reviews</h3>
            <p className="text-sm text-muted-foreground">
              Always verify a contractor's past work by checking reviews and asking for references from previous clients.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Verify Licensing & Insurance</h3>
            <p className="text-sm text-muted-foreground">
              Ensure contractors have proper licensing for your area and carry liability insurance to protect your property.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Get Multiple Quotes</h3>
            <p className="text-sm text-muted-foreground">
              Compare quotes from several contractors to ensure competitive pricing and comprehensive service offerings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}