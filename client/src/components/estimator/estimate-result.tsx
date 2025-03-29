import { EstimationResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Save, Users, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface EstimateResultProps {
  estimationResult: EstimationResult;
  estimationType: "renovation" | "construction";
}

// Convert USD to INR (approximate exchange rate)
const convertToINR = (usdAmount: string): string => {
  // Extract numerical values from the string
  const matches = usdAmount.match(/[$]?([\d,]+(?:\.\d+)?)\s*(?:-\s*[$]?([\d,]+(?:\.\d+)?))?/);
  
  if (!matches) return `₹${usdAmount}`;
  
  // Convert to INR (using approximate exchange rate of 83)
  const exchangeRate = 83;
  
  // If it's a range (e.g. $10,000 - $15,000)
  if (matches[2]) {
    const minUSD = parseFloat(matches[1].replace(/,/g, ''));
    const maxUSD = parseFloat(matches[2].replace(/,/g, ''));
    
    const minINR = Math.round(minUSD * exchangeRate);
    const maxINR = Math.round(maxUSD * exchangeRate);
    
    return `₹${minINR.toLocaleString('en-IN')} - ₹${maxINR.toLocaleString('en-IN')}`;
  } 
  // If it's a single value
  else {
    const usd = parseFloat(matches[1].replace(/,/g, ''));
    const inr = Math.round(usd * exchangeRate);
    return `₹${inr.toLocaleString('en-IN')}`;
  }
};

export default function EstimateResult({ estimationResult, estimationType }: EstimateResultProps) {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const handleSaveEstimate = () => {
    toast({
      title: "Estimate Saved",
      description: "Your estimate has been saved for future reference.",
      className: "luxury-accent",
    });
  };

  return (
    <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <h3 className="text-xl font-medium mb-4 luxury-gradient font-bold">Estimated Cost Breakdown</h3>
      
      <div className="card p-6 rounded-lg animate-stagger">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-amber-500/20">
          <span className="text-sm font-medium text-gray-400">Total Estimated Cost:</span>
          <div className="flex items-center">
            <IndianRupee className="h-5 w-5 mr-1 text-amber-400" />
            <span className="text-2xl font-bold luxury-gradient">{convertToINR(estimationResult.totalCost)}</span>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-amber-400 mb-3">Detailed Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(estimationResult.breakdown).map(([key, value], index) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-white/5" style={{animationDelay: `${index * 0.1}s`}}>
                <span className="text-sm text-gray-300">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-medium text-amber-300">{convertToINR(value)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 p-4 luxury-accent rounded">
          <h4 className="text-sm font-medium text-amber-400 mb-2">AI Recommendations</h4>
          <p className="text-sm text-gray-300">
            {estimationResult.recommendations}
          </p>
        </div>
        
        {estimationResult.timeline && (
          <div className="mt-6 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <h4 className="text-sm font-medium text-amber-400 mb-2">Estimated Timeline</h4>
            <p className="text-sm text-gray-300">
              {estimationResult.timeline}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{animationDelay: '0.7s'}}>
        <Link href="/#contractors">
          <Button className="w-full sm:w-auto luxury-btn">
            <Users className="mr-2 h-4 w-4" /> Find Contractors
          </Button>
        </Link>
        <Button variant="outline" className="w-full sm:w-auto gold-border" onClick={handleSaveEstimate}>
          <Save className="mr-2 h-4 w-4 text-amber-400" /> Save Estimate
        </Button>
      </div>
    </div>
  );
}
