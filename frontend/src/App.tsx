import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { VitrinePage } from './pages/vitrine/VitrinePage';
import { ProdutoDetalhePage } from './pages/vitrine/ProdutoDetalhePage';
import { ProdutosAdminPage } from './pages/admin/produtos/ProdutosAdminPage';
import { EstoquePage } from './pages/admin/estoque/EstoquePage';
import { CalcPage } from './pages/admin/calculadora/CalcPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Vitrine pública */}
              <Route path="/" element={<VitrinePage />} />
              <Route path="/produto/:id" element={<ProdutoDetalhePage />} />

              {/* Admin login */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Admin protegido */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="/admin/produtos" replace />} />
                <Route path="produtos" element={<ProdutosAdminPage />} />
                <Route path="estoque" element={<EstoquePage />} />
                <Route path="calculadora" element={<CalcPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
