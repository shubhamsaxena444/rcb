import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { constructionEstimateSchema } from "@shared/schema";
import { ConstructionFormData, EstimationResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EstimateResult from "./estimate-result";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extended schema with better validation
const formSchema = constructionEstimateSchema.extend({
  squareFootage: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, { message: "Square footage is required" })
  ),
  constructionType: z.string().min(1, { message: "Construction type is required" }),
  stories: z.string().min(1, { message: "Number of stories is required" }),
  qualityLevel: z.string().min(1, { message: "Quality level is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  lotSize: z.string().min(1, { message: "Lot size is required" }),
  details: z.string().min(1, { message: "Project details are required" }),
});

export default function ConstructionEstimator() {
  const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null);
  const { toast } = useToast();
  
  const form = useForm<ConstructionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      constructionType: "",
      squareFootage: undefined,
      stories: "",
      qualityLevel: "",
      location: "",
      lotSize: "",
      details: "",
    },
  });

  const estimateMutation = useMutation({
    mutationFn: async (data: ConstructionFormData) => {
      const res = await apiRequest("POST", "/api/estimate/construction", data);
      return await res.json() as EstimationResult;
    },
    onSuccess: (data) => {
      setEstimationResult(data);
      toast({
        title: "Estimate Generated",
        description: "Your construction cost estimate has been generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Estimation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConstructionFormData) => {
    estimateMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details below to get an AI-powered estimate for your construction project.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="constructionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Construction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new-home">New Home</SelectItem>
                        <SelectItem value="addition">Home Addition</SelectItem>
                        <SelectItem value="garage">Garage</SelectItem>
                        <SelectItem value="deck">Deck/Patio</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Square Footage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Stories</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stories" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4+">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ZIP Code" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot Size (if applicable)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 0.25 acres" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your construction project..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={estimateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {estimateMutation.isPending ? (
                "Calculating..."
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" /> Calculate Estimate
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Estimation Results */}
        {estimationResult && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <EstimateResult
                estimationResult={estimationResult}
                estimationType="construction"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
