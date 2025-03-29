import React from 'react';
import ContractorFinder from '@/components/maps/contractor-finder';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function ContractorSearchPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return <ContractorFinder />;
}