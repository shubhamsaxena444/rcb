import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import ProjectSummary from "@/components/dashboard/project-summary";
import RenovationEstimator from "@/components/estimator/renovation-estimator";
import ConstructionEstimator from "@/components/estimator/construction-estimator";
import ContractorDirectory from "@/components/contractors/contractor-directory";
import QuoteManagement from "@/components/quotes/quote-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";

export default function HomePage() {
  const [estimatorTab, setEstimatorTab] = useState("renovation");

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your renovation projects and find qualified contractors.
        </p>
      </div>

      <ProjectSummary />

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Cost Estimation Tools
        </h2>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Tabs 
            defaultValue="renovation" 
            value={estimatorTab} 
            onValueChange={setEstimatorTab}
          >
            <TabsList className="border-b border-gray-200 w-full justify-start rounded-none h-12 bg-white">
              <TabsTrigger 
                value="renovation" 
                className="data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none rounded-t-lg px-4 py-2"
              >
                <Calculator className="h-4 w-4 mr-2" /> 
                Renovation Estimator
              </TabsTrigger>
              <TabsTrigger 
                value="construction" 
                className="data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r data-[state=active]:border-gray-200 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none rounded-t-lg px-4 py-2"
              >
                <Calculator className="h-4 w-4 mr-2" /> 
                Construction Estimator
              </TabsTrigger>
            </TabsList>
            <TabsContent value="renovation" className="mt-0">
              <RenovationEstimator />
            </TabsContent>
            <TabsContent value="construction" className="mt-0">
              <ConstructionEstimator />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ContractorDirectory />

      <QuoteManagement />
    </MainLayout>
  );
}
