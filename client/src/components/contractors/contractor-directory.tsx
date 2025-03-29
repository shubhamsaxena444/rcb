import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Contractor } from "@shared/schema";
import { ContractorSearchParams } from "@/types";
import ContractorCard from "./contractor-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function ContractorDirectory() {
  const [searchParams, setSearchParams] = useState<ContractorSearchParams>({
    query: "",
    specialty: ""
  });
  const [displayLimit, setDisplayLimit] = useState(6);
  
  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchParams.query) params.append("search", searchParams.query);
    if (searchParams.specialty && searchParams.specialty !== 'all') params.append("specialty", searchParams.specialty);
    return params.toString();
  };
  
  const queryString = buildQueryParams();
  const queryUrl = `/api/contractors${queryString ? `?${queryString}` : ""}`;
  
  const { data: contractors, isLoading, error } = useQuery<Contractor[]>({
    queryKey: [queryUrl],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will be triggered automatically due to the queryKey change
  };
  
  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 6);
  };
  
  const displayedContractors = contractors ? contractors.slice(0, displayLimit) : [];
  const hasMoreToLoad = contractors && displayLimit < contractors.length;

  return (
    <div className="mb-8" id="contractors">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Local Contractors</h2>
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-grow max-w-xl">
                <Input
                  placeholder="Search by name, specialty, or location"
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <Select
                  value={searchParams.specialty}
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, specialty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="General">General Contractor</SelectItem>
                    <SelectItem value="Kitchen">Kitchen Specialist</SelectItem>
                    <SelectItem value="Bathroom">Bathroom Specialist</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Roofing">Roofing</SelectItem>
                    <SelectItem value="Landscaping">Landscaping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse h-60 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading contractors: {(error as Error).message}</p>
            </div>
          ) : displayedContractors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No contractors found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedContractors.map((contractor) => (
                  <ContractorCard key={contractor.id} contractor={contractor} />
                ))}
              </div>
              
              {hasMoreToLoad && (
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={handleLoadMore}>
                    Load More Contractors
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
