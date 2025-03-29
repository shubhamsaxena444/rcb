import { EstimationResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Save, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";

interface EstimateResultProps {
  estimationResult: EstimationResult;
  estimationType: "renovation" | "construction";
}

export default function EstimateResult({ estimationResult, estimationType }: EstimateResultProps) {
  const { toast } = useToast();
  
  const handleSaveEstimate = () => {
    toast({
      title: "Estimate Saved",
      description: "Your estimate has been saved for future reference.",
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Estimated Cost Breakdown</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">Total Estimated Cost:</span>
          <span className="text-xl font-bold text-gray-900">{estimationResult.totalCost}</span>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Detailed Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(estimationResult.breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-sm text-gray-600">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">AI Recommendations</h4>
          <p className="text-sm text-gray-600">
            {estimationResult.recommendations}
          </p>
        </div>
        
        {estimationResult.timeline && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Estimated Timeline</h4>
            <p className="text-sm text-gray-600">
              {estimationResult.timeline}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <Link href="/#contractors">
          <Button className="w-full sm:w-auto">
            <Users className="mr-2 h-4 w-4" /> Find Contractors
          </Button>
        </Link>
        <Button variant="outline" className="w-full sm:w-auto" onClick={handleSaveEstimate}>
          <Save className="mr-2 h-4 w-4" /> Save Estimate
        </Button>
      </div>
    </div>
  );
}
