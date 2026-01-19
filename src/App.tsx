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
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
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
import BarterDashboard from "./pages/barter/BarterDashboard";
import ReportsIndex from "./pages/reports/ReportsIndex";
import SalesReport from "./pages/reports/SalesReport";
import ProductsReport from "./pages/reports/ProductsReport";
import CustomersReport from "./pages/reports/CustomersReport";
import FinancialReport from "./pages/reports/FinancialReport";
import SuppliersReport from "./pages/reports/SuppliersReport";
import TickingReport from "./pages/reports/TickingReport";
import OperatorDashboard from "./pages/operations/OperatorDashboard";
import LoadedOrders from "./pages/operations/LoadedOrders";
import FuelEntry from "./pages/operations/FuelEntry";
import VehicleManagement from "./pages/operations/VehicleManagement";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DailyReport from "./pages/driver/DailyReport";
import SafetyChecklist from "./pages/driver/SafetyChecklist";
import MaintenanceReport from "./pages/driver/MaintenanceReport";
import DailyReportsAdmin from "./pages/reports/DailyReportsAdmin";
import ChecklistsAdmin from "./pages/reports/ChecklistsAdmin";
import MaintenanceAdmin from "./pages/reports/MaintenanceAdmin";
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

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    toast.error('Acesso restrito a administradores');
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

type PermissionRouteProps = {
  module: string;
  action: string;
  children: React.ReactNode;
};

const PermissionRoute = ({ module, action, children }: PermissionRouteProps) => {
  const { hasActionAccess } = usePermissions();
  if (!hasActionAccess(module, action)) {
    toast.error('Você não tem permissão para acessar esta página');
    return <Navigate to="/" replace />;
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
        <Route path="/configuracao/usuarios" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/configuracao/pagamentos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="configuracao" action="Empresa">
              <PaymentMethods />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/configuracao/empresa" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="configuracao" action="Empresa">
              <CompanySettingsPage />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/configuracao/contas-recebimento" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="configuracao" action="Contas de Recebimento">
              <ReceivingAccounts />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/cadastro/clientes" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="cadastro" action="Clientes">
              <CustomerManagement />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/cadastro/produtos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="cadastro" action="Produtos">
              <ProductManagement />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/cadastro/fornecedores" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="cadastro" action="Fornecedores">
              <SupplierManagement />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/vendas/nova" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="vendas" action="Nova Venda">
              <NewSale />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/vendas/pedidos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="vendas" action="Pedidos">
              <SalesList type="pedido" />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/vendas/orcamentos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="vendas" action="Orçamentos">
              <SalesList type="orcamento" />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/financeiro/contas-a-receber" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="financeiro" action="Contas a Receber">
              <AccountsReceivable />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/financeiro/contas-a-pagar" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="financeiro" action="Contas a Pagar">
              <AccountsPayable />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/permuta" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Permuta">
              <BarterDashboard />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ReportsIndex />
          </ProtectedRoute>
        } />
        <Route path="/relatorios/vendas" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Vendas">
              <SalesReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/produtos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Produtos">
              <ProductsReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/clientes" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Clientes">
              <CustomersReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/financeiro" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Financeiro">
              <FinancialReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/fornecedores" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Fornecedores">
              <SuppliersReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/ticagem" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Ticagem">
              <TickingReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/operacao/operador" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="operacao" action="Operador">
              <OperatorDashboard />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/operacao/carregados" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="operacao" action="Carregados">
              <LoadedOrders />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/operacao/abastecimento" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="operacao" action="Abastecimento">
              <FuelEntry />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/operacao/veiculos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="operacao" action="Veículos">
              <VehicleManagement />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        {/* Driver Routes */}
        <Route path="/motorista" element={<ProtectedRoute isAuthenticated={isAuthenticated}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/motorista/parte-diaria" element={<ProtectedRoute isAuthenticated={isAuthenticated}><DailyReport /></ProtectedRoute>} />
        <Route path="/motorista/checklist" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SafetyChecklist /></ProtectedRoute>} />
        <Route path="/motorista/manutencao" element={<ProtectedRoute isAuthenticated={isAuthenticated}><MaintenanceReport /></ProtectedRoute>} />
        {/* Admin Reports for Driver Module */}
        <Route path="/relatorios/partes-diarias" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Partes Diárias">
              <DailyReportsAdmin />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/checklists" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Checklists">
              <ChecklistsAdmin />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/manutencoes" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PermissionRoute module="relatorios" action="Manutenções">
              <MaintenanceAdmin />
            </PermissionRoute>
          </ProtectedRoute>
        } />
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
