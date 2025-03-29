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
          <div className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50"></div>
          <div className="fixed top-0 left-0 w-full h-full -z-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik0wIDYwTDYwIDBaTTYwIDYwTDAgMFoiIHN0cm9rZT0iI2Y1ZjVmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiPjwvcGF0aD4KPC9zdmc+')] opacity-20"></div>
          <div className="fixed top-20 right-20 w-96 h-96 rounded-full bg-gradient-to-br from-purple-300/20 to-indigo-300/20 blur-3xl -z-10 animate-float"></div>
          <div className="fixed bottom-20 left-20 w-96 h-96 rounded-full bg-gradient-to-br from-violet-200/20 to-blue-300/20 blur-3xl -z-10 animate-float" style={{animationDelay: '1.5s'}}></div>
          <Router />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
