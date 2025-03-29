import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import ContractorProfilePage from "@/pages/contractor-profile-page";
import CreateProjectPage from "@/pages/create-project-page";
import QuoteDetailPage from "@/pages/quote-detail-page";
import QuoteComparisonPage from "@/pages/quote-comparison-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { useEffect, useState } from "react";

// Page transition component with animation
function AnimatedRouteTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    // When location changes, trigger fade-out animation
    setIsAnimating(true);
    const timer = setTimeout(() => {
      // After fade-out completes, update content and fade back in
      setContent(children);
      setIsAnimating(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location, children]);

  return (
    <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {content}
    </div>
  );
}

function Router() {
  return (
    <AnimatedRouteTransition>
      <Switch>
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/projects/new" component={CreateProjectPage} />
        <ProtectedRoute path="/projects/:id" component={ProjectDetailPage} />
        <ProtectedRoute path="/contractors/:id" component={ContractorProfilePage} />
        <ProtectedRoute path="/quotes/:id" component={QuoteDetailPage} />
        <ProtectedRoute path="/quotes/compare/:projectId" component={QuoteComparisonPage} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </AnimatedRouteTransition>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <div className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-b from-zinc-800 to-zinc-900"></div>
          <Router />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
