
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

// Layout
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ReadingsPage from "@/pages/ReadingsPage";
import ReadingDetailPage from "@/pages/ReadingDetailPage";
import MetersPage from "@/pages/MetersPage";
import MeterDetailPage from "@/pages/MeterDetailPage";
import MeterCreatePage from "@/pages/MeterCreatePage";
import AgentsPage from "@/pages/AgentsPage";
import AgentDetailPage from "@/pages/AgentDetailPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import UserDetailPage from "@/pages/UserDetailPage";
import UserCreatePage from "@/pages/UserCreatePage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

const AppContent = () => {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* All protected routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/readings" element={<ReadingsPage />} />
        <Route path="/readings/:id" element={<ReadingDetailPage />} />
        <Route path="/meters" element={<MetersPage />} />
        <Route path="/meters/new" element={<MeterCreatePage />} />
        <Route path="/meters/:id" element={<MeterDetailPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/:id" element={<AgentDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        
        {/* Admin routes - NO extra ProtectedRoute wrapper */}
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/users/new" element={<UserCreatePage />} />
        <Route path="/admin/users/:id" element={<UserDetailPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
