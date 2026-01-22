import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Editor from "@/pages/Editor";
import SitePreview from "@/pages/SitePreview";
import { useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/editor/:siteId">
        <ProtectedRoute component={Editor} />
      </Route>
      <Route path="/site/:slug" component={SitePreview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
