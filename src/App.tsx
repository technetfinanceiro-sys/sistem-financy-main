import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//Navigate
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Comissionamento from "./pages/Comissionamento";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import FolhaPagamento from "./pages/FolhaPagamento";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <HashRouter basename="/">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/pagamentos"
                element={
                  <ProtectedRoute>
                    <Comissionamento />
                  </ProtectedRoute>
                }
              />
                <Route
              path="/folha-pagamento"
              element={
                <ProtectedRoute requireAdmin>
                  <FolhaPagamento />
                </ProtectedRoute>
              }
            />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
