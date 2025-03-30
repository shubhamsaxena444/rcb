import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import ContractorProfilePage from "@/pages/contractor-profile-page";
import ContractorSearchPage from "@/pages/contractor-search-page";
import CreateProjectPage from "@/pages/create-project-page";
import QuoteDetailPage from "@/pages/quote-detail-page";
import QuoteComparisonPage from "@/pages/quote-comparison-page";
import DesignInspirationPage from "@/pages/design-inspiration-page";
import ARPreviewPage from "@/pages/ar-preview-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import ChatBot from "@/components/chat/chat-bot";
import NavBar from "@/components/layout/nav-bar";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/projects/new" component={CreateProjectPage} />
      <ProtectedRoute path="/projects/:id" component={ProjectDetailPage} />
      <ProtectedRoute path="/contractors" component={ContractorSearchPage} />
      <ProtectedRoute path="/contractors/:id" component={ContractorProfilePage} />
      <ProtectedRoute path="/quotes/:id" component={QuoteDetailPage} />
      <ProtectedRoute path="/quotes/compare/:projectId" component={QuoteComparisonPage} />
      <ProtectedRoute path="/design-inspiration" component={DesignInspirationPage} />
      <ProtectedRoute path="/ar-preview" component={ARPreviewPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <ChatBot />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
