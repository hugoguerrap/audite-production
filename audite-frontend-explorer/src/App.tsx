import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BasicAuditList from "./pages/BasicAudit/BasicAuditList";
import BasicAuditCreate from "./pages/BasicAudit/BasicAuditCreate";
import BasicAuditDetail from "./pages/BasicAudit/BasicAuditDetail";
import AgroAuditList from "./pages/AgroAudit/AgroAuditList";
import AgroAuditForm from "./pages/AgroAudit/AgroAuditForm";
import AgroAuditDetail from "./pages/AgroAudit/AgroAuditDetail";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProtectedRoute from "./pages/Admin/AdminProtectedRoute";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import FairDiagnosticPage from "./pages/FairDiagnostic/FairDiagnosticPage";
import DiagnosticResultPage from "./pages/FairDiagnostic/DiagnosticResultPage";
import DiagnosticSearchPage from "./pages/FairDiagnostic/DiagnosticSearchPage";
import BuscarDiagnostico from "./pages/FairDiagnostic/BuscarDiagnostico";
import AutodiagnosticoPage from "./pages/Autodiagnostico/AutodiagnosticoPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/diagnostico-energia" element={<FairDiagnosticPage />} />
            <Route path="/diagnosticos/:id" element={<DiagnosticResultPage />} />
            <Route path="/codigo/:accessCode" element={<DiagnosticResultPage />} />
            <Route path="/codigo" element={<DiagnosticSearchPage />} />
            <Route path="/buscar-diagnostico" element={<BuscarDiagnostico />} />
            <Route path="/diagnostico" element={<AutodiagnosticoPage />} />
            
            {/* Admin routes - separate authentication */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            
            {/* Protected routes */}
            <Route element={<AppLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* API Info */}
              {/* <Route path="/api-info" element={<ApiInfo />} /> */}
              
              {/* Basic Audit routes */}
              <Route path="/auditoria-basica" element={<BasicAuditList />} />
              <Route path="/auditoria-basica/nueva" element={<BasicAuditCreate />} />
              <Route path="/auditoria-basica/:id" element={<BasicAuditDetail />} />
              
              {/* Agro Audit routes */}
              <Route path="/auditoria-agro" element={<AgroAuditList />} />
              <Route path="/auditoria-agro/nueva" element={<AgroAuditForm />} />
              <Route path="/auditoria-agro/:id" element={<AgroAuditDetail />} />
              <Route path="/auditoria-agro/editar/:id" element={<AgroAuditForm isEditing={true} />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
