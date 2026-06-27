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
import ProjectMembers from "@/pages/project-members";
import Assets from "@/pages/assets";
import Templates from "@/pages/templates";
import Plugins from "@/pages/plugins";
import Packages from "@/pages/packages";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Organizations from "@/pages/organizations";
import OrgDetail from "@/pages/org-detail";
import Invitations from "@/pages/invitations";
import Notifications from "@/pages/notifications";
import ActivityPage from "@/pages/activity";
import Documents from "@/pages/documents";
import DocumentDetail from "@/pages/document-detail";
import DocumentHistory from "@/pages/document-history";
import Folders from "@/pages/folders";
import Bookmarks from "@/pages/bookmarks";
import AssetDashboard from "@/pages/asset-dashboard";
import AssetBrowser from "@/pages/asset-browser";
import AssetDetail from "@/pages/asset-detail";
import AssetCollections from "@/pages/asset-collections";
import AssetFolders from "@/pages/asset-folders";
import UploadCenter from "@/pages/upload-center";
import ProcessingQueue from "@/pages/processing-queue";
import VisualScriptDashboard from "@/pages/visual-script-dashboard";
import GraphEditor from "@/pages/graph-editor";
import GraphBrowser from "@/pages/graph-browser";
import GraphTemplates from "@/pages/graph-templates";
import ExecutionConsole from "@/pages/execution-console";
import MacroLibrary from "@/pages/macro-library";
import CompilerPanel from "@/pages/compiler-panel";
import RuntimeMonitor from "@/pages/runtime-monitor";
import RuntimeDashboard from "@/pages/runtime-dashboard";
import PlayMode from "@/pages/runtime-play";
import SimulationCenter from "@/pages/simulation-center";
import RuntimeProfiler from "@/pages/runtime-profiler";
import RuntimeLogs from "@/pages/runtime-logs";
import RuntimeInspector from "@/pages/runtime-inspector";
import EntityExplorer from "@/pages/entity-explorer";
import ComponentExplorer from "@/pages/component-explorer";
import SystemMonitor from "@/pages/system-monitor";
import EventMonitor from "@/pages/event-monitor";
import DebugConsole from "@/pages/debug-console";
import SnapshotManager from "@/pages/snapshot-manager";
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
            <Route path="/projects/:id/members" component={ProjectMembers} />
            <Route path="/projects/:id" component={ProjectDetail} />
            <Route path="/assets" component={Assets} />
            <Route path="/templates" component={Templates} />
            <Route path="/plugins" component={Plugins} />
            <Route path="/packages" component={Packages} />
            <Route path="/settings" component={Settings} />
            <Route path="/profile" component={Profile} />
            <Route path="/organizations" component={Organizations} />
            <Route path="/organizations/:id" component={OrgDetail} />
            <Route path="/invitations" component={Invitations} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/activity" component={ActivityPage} />
            <Route path="/documents" component={Documents} />
            <Route path="/documents/:id/history" component={DocumentHistory} />
            <Route path="/documents/:id" component={DocumentDetail} />
            <Route path="/folders" component={Folders} />
            <Route path="/bookmarks" component={Bookmarks} />
            <Route path="/asset-pipeline" component={AssetDashboard} />
            <Route path="/asset-browser" component={AssetBrowser} />
            <Route path="/asset-detail/:id" component={AssetDetail} />
            <Route path="/asset-collections" component={AssetCollections} />
            <Route path="/asset-folders" component={AssetFolders} />
            <Route path="/upload-center" component={UploadCenter} />
            <Route path="/processing-queue" component={ProcessingQueue} />
            <Route path="/visual-scripting" component={VisualScriptDashboard} />
            <Route path="/graph-editor/:id" component={GraphEditor} />
            <Route path="/graph-browser" component={GraphBrowser} />
            <Route path="/graph-templates" component={GraphTemplates} />
            <Route path="/execution-console" component={ExecutionConsole} />
            <Route path="/macro-library" component={MacroLibrary} />
            <Route path="/compiler-panel" component={CompilerPanel} />
            <Route path="/runtime-monitor" component={RuntimeMonitor} />
            <Route path="/runtime" component={RuntimeDashboard} />
            <Route path="/runtime-play/:id" component={PlayMode} />
            <Route path="/simulation-center" component={SimulationCenter} />
            <Route path="/runtime-profiler/:id" component={RuntimeProfiler} />
            <Route path="/runtime-logs/:id" component={RuntimeLogs} />
            <Route path="/runtime-inspector/:id" component={RuntimeInspector} />
            <Route path="/entity-explorer/:id" component={EntityExplorer} />
            <Route path="/component-explorer/:id" component={ComponentExplorer} />
            <Route path="/system-monitor/:id" component={SystemMonitor} />
            <Route path="/event-monitor/:id" component={EventMonitor} />
            <Route path="/debug-console/:id" component={DebugConsole} />
            <Route path="/runtime-snapshots/:id" component={SnapshotManager} />
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
