import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Contractor, Review } from "@shared/schema";
import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  MessageSquare, 
  Calendar,
  Building
} from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ReviewFormData } from "@/types";

// Review form schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().min(1, { message: "Review text is required" }),
});

export default function ContractorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const contractorId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch contractor details
  const { 
    data: contractor, 
    isLoading: contractorLoading, 
    error: contractorError 
  } = useQuery<Contractor>({
    queryKey: [`/api/contractors/${contractorId}`],
    enabled: !!contractorId,
  });

  // Fetch reviews for this contractor
  const { 
    data: reviews, 
    isLoading: reviewsLoading 
  } = useQuery<Review[]>({
    queryKey: [`/api/contractors/${contractorId}/reviews`],
    enabled: !!contractorId,
  });

  // Get initial for avatar fallback
  const getInitial = (name: string) => {
    return name.charAt(0);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  // Setup form for submitting reviews
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      contractorId,
      rating: 5,
      review: "",
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contractors/${contractorId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/contractors/${contractorId}`] });
      toast({
        title: "Review Submitted",
        description: "Your review has been successfully submitted.",
      });
      form.reset({
        contractorId,
        rating: 5,
        review: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle review submission
  const onSubmitReview = (data: ReviewFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit a review.",
        variant: "destructive",
      });
      return;
    }
    
    submitReviewMutation.mutate({
      ...data,
      contractorId,
    });
  };

  // Set rating in the form
  const setRating = (rating: number) => {
    form.setValue("rating", rating);
  };

  if (contractorLoading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </MainLayout>
    );
  }

  if (contractorError || !contractor) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Contractor not found</h2>
          <p className="mt-2 text-gray-500">The contractor you're looking for doesn't exist.</p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Contractor Profile</h1>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                {contractor.profileImage ? (
                  <AvatarImage src={contractor.profileImage} alt={contractor.name} />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-2xl">
                    {getInitial(contractor.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{contractor.name}</h2>
                <div className="mt-1 flex items-center">
                  <StarRating 
                    rating={contractor.rating} 
                    showText={true} 
                    reviewCount={contractor.reviewCount} 
                    size="lg"
                  />
                </div>
                <Badge className="mt-2 bg-blue-100 text-blue-800">
                  {contractor.specialty}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button className="w-full md:w-auto">
                <MessageSquare className="mr-2 h-4 w-4" /> Request Quote
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{contractor.email}</p>
              </div>
            </div>
            
            {contractor.phone && (
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{contractor.phone}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">{contractor.location}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-gray-600">{contractor.description}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {contractor.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reviews" className="mb-8">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="write-review">Write a Review</TabsTrigger>
          <TabsTrigger value="projects">Past Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>
          
          {reviewsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-28 bg-gray-200 rounded"></div>
              <div className="h-28 bg-gray-200 rounded"></div>
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm text-gray-500">
                            {review.rating.toFixed(1)}/5 stars
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600">{review.review}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-gray-500">No reviews yet. Be the first to write a review!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="write-review" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
              <CardDescription>
                Share your experience working with {contractor.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  className="focus:outline-none"
                                  onClick={() => setRating(rating)}
                                >
                                  <Star
                                    className={`h-6 w-6 ${
                                      field.value >= rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="text-sm text-gray-500 ml-2">
                                {field.value}/5 stars
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="review"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your experience with this contractor..."
                              className="resize-none"
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={submitReviewMutation.isPending}
                    >
                      {submitReviewMutation.isPending
                        ? "Submitting..."
                        : "Submit Review"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You need to be logged in to submit a review.</p>
                  <Link href="/auth">
                    <Button>Sign In</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Past Projects</h3>
          
          <div className="text-center py-8 border rounded-lg">
            <p className="text-gray-500">No past projects are currently displayed.</p>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
