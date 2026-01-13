import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SalesProvider } from "@/contexts/SalesContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { SupplierProvider } from "@/contexts/SupplierContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UserManagement from "./pages/settings/UserManagement";
import PaymentMethods from "./pages/settings/PaymentMethods";
import CompanySettingsPage from "./pages/settings/CompanySettings";
import ReceivingAccounts from "./pages/settings/ReceivingAccounts";
import CustomerManagement from "./pages/customers/CustomerManagement";
import ProductManagement from "./pages/products/ProductManagement";
import SupplierManagement from "./pages/suppliers/SupplierManagement";
import NewSale from "./pages/sales/NewSale";
import SalesList from "./pages/sales/SalesList";
import AccountsReceivable from "./pages/financial/AccountsReceivable";
import AccountsPayable from "./pages/financial/AccountsPayable";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type RouteGateProps = {
  isAuthenticated: boolean;
  children: React.ReactNode;
};

const ProtectedRoute = ({ isAuthenticated, children }: RouteGateProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ isAuthenticated, children }: RouteGateProps) => {
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute isAuthenticated={isAuthenticated}><Login /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Index /></ProtectedRoute>} />
        <Route path="/configuracao/usuarios" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UserManagement /></ProtectedRoute>} />
        <Route path="/configuracao/pagamentos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PaymentMethods /></ProtectedRoute>} />
        <Route path="/configuracao/empresa" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CompanySettingsPage /></ProtectedRoute>} />
        <Route path="/configuracao/contas-recebimento" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ReceivingAccounts /></ProtectedRoute>} />
        <Route path="/cadastro/clientes" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CustomerManagement /></ProtectedRoute>} />
        <Route path="/cadastro/produtos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProductManagement /></ProtectedRoute>} />
        <Route path="/cadastro/fornecedores" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SupplierManagement /></ProtectedRoute>} />
        <Route path="/vendas/nova" element={<ProtectedRoute isAuthenticated={isAuthenticated}><NewSale /></ProtectedRoute>} />
        <Route path="/vendas/pedidos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SalesList type="pedido" /></ProtectedRoute>} />
        <Route path="/vendas/orcamentos" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SalesList type="orcamento" /></ProtectedRoute>} />
        <Route path="/financeiro/contas-a-receber" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AccountsReceivable /></ProtectedRoute>} />
        <Route path="/financeiro/contas-a-pagar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AccountsPayable /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CustomerProvider>
        <ProductProvider>
          <SettingsProvider>
            <SalesProvider>
              <CompanyProvider>
                <FinancialProvider>
                  <SupplierProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <AppRoutes />
                    </TooltipProvider>
                  </SupplierProvider>
                </FinancialProvider>
              </CompanyProvider>
            </SalesProvider>
          </SettingsProvider>
        </ProductProvider>
      </CustomerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
