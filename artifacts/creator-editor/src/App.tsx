import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

import Layout from "@/components/layout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import Assets from "@/pages/assets";
import Templates from "@/pages/templates";
import Plugins from "@/pages/plugins";
import Packages from "@/pages/packages";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

setAuthTokenGetter(() => localStorage.getItem("creator_token") ?? "");

function Router() {
  const [location, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const token = localStorage.getItem("creator_token");
    const isPublic = location === "/login" || location === "/register";

    if (!token && !isPublic) {
      setLocation("/login");
    } else if (token && (isPublic || location === "/")) {
      setLocation("/dashboard");
    }
  }, [location, setLocation, isReady]);

  if (!isReady) return null;

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/:rest*">
        <Layout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/projects" component={Projects} />
            <Route path="/projects/:id" component={ProjectDetail} />
            <Route path="/assets" component={Assets} />
            <Route path="/templates" component={Templates} />
            <Route path="/plugins" component={Plugins} />
            <Route path="/packages" component={Packages} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
