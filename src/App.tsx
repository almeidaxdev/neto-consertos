import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Services from "@/pages/Services";
import ServiceForm from "@/pages/ServiceForm";
import ServiceDetails from "@/pages/ServiceDetails";
import Payments from "@/pages/Payments";
import Search from "@/pages/Search";
import More from "@/pages/More";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/servicos" element={<Services />} />
                  <Route path="/servicos/novo" element={<ServiceForm />} />
                  <Route path="/servicos/:id" element={<ServiceDetails />} />
                  <Route path="/servicos/:id/editar" element={<ServiceForm />} />
                  <Route path="/pagamentos" element={<Payments />} />
                  <Route path="/pesquisa" element={<Search />} />
                  <Route path="/mais" element={<More />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
