import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { renovationEstimateSchema } from "@shared/schema";
import { RenovationFormData, EstimationResult } from "@/types";
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
const formSchema = renovationEstimateSchema.extend({
  squareFootage: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, { message: "Square footage is required" })
  ),
  renovationType: z.string().min(1, { message: "Renovation type is required" }),
  qualityLevel: z.string().min(1, { message: "Quality level is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  scope: z.string().min(1, { message: "Project scope is required" }),
});

export default function RenovationEstimator() {
  const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null);
  const { toast } = useToast();
  
  const form = useForm<RenovationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      renovationType: "",
      squareFootage: undefined,
      qualityLevel: "",
      location: "",
      scope: "",
    },
  });

  const estimateMutation = useMutation({
    mutationFn: async (data: RenovationFormData) => {
      const res = await apiRequest("POST", "/api/estimate/renovation", data);
      return await res.json() as EstimationResult;
    },
    onSuccess: (data) => {
      setEstimationResult(data);
      toast({
        title: "Estimate Generated",
        description: "Your renovation cost estimate has been generated successfully.",
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

  const onSubmit = (data: RenovationFormData) => {
    estimateMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details below to get an AI-powered estimate for your renovation project.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="renovationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renovation Type</FormLabel>
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
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                        <SelectItem value="bathroom">Bathroom</SelectItem>
                        <SelectItem value="basement">Basement</SelectItem>
                        <SelectItem value="living-room">Living Room</SelectItem>
                        <SelectItem value="bedroom">Bedroom</SelectItem>
                        <SelectItem value="exterior">Exterior</SelectItem>
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
                    <FormLabel>Square Footage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 200"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
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
            </div>

            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Scope</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you want to renovate..."
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
                estimationType="renovation"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
