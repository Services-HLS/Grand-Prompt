import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Browse from "./pages/Browse.tsx";
import PostPrompt from "./pages/PostPrompt.tsx";
import MyPrompts from "./pages/MyPrompts.tsx";
import PendingApprovals from "./pages/PendingApprovals.tsx";
import AllPrompts from "./pages/AllPrompts.tsx";
import Analytics from "./pages/Analytics.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { PromptsProvider } from "./context/PromptsContext.tsx";
import { CategoryProvider } from "./context/CategoryContext.tsx"; // Add this
import RequireAuth from "./components/RequireAuth.tsx";
import AppShell from "./components/AppShell.tsx";

const queryClient = new QueryClient();

const Shell = ({ children }: { children: React.ReactNode }) => (
  <RequireAuth>
    <AppShell>{children}</AppShell>
  </RequireAuth>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PromptsProvider>
            <CategoryProvider> {/* Add this wrapper */}
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Shell><Browse /></Shell>} />
                <Route
                  path="/post"
                  element={
                    <RequireAuth role="employee">
                      <AppShell><PostPrompt /></AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/my-prompts"
                  element={
                    <RequireAuth role="employee">
                      <AppShell><MyPrompts /></AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/pending"
                  element={
                    <RequireAuth role="moderator">
                      <AppShell><PendingApprovals /></AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/all"
                  element={
                    <RequireAuth role="moderator">
                      <AppShell><AllPrompts /></AppShell>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <RequireAuth role="moderator">
                      <AppShell><Analytics /></AppShell>
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CategoryProvider>
          </PromptsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;