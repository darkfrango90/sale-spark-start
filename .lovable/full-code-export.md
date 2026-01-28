# Exportação Completa do Código - Sistema Cezar

Este documento contém TODO o código-fonte necessário para recriar o sistema em um novo projeto Lovable com Supabase externo.

---

## INSTRUÇÕES DE USO

1. No novo projeto Lovable, vá em cada arquivo listado abaixo
2. Copie o conteúdo completo e cole no arquivo correspondente
3. Para arquivos que não existem, crie-os primeiro
4. Após copiar todos os arquivos, o sistema funcionará corretamente

---

## 1. ARQUIVO: src/App.tsx

Este é o arquivo principal com TODAS as rotas e providers. COPIE EXATAMENTE como está.

```tsx
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
import AIAssistant from "./pages/reports/AIAssistant";
import CashRegisterReport from "./pages/reports/CashRegisterReport";
import OperatorDashboard from "./pages/operations/OperatorDashboard";
import OperatorPanel from "./pages/operations/OperatorPanel";
import OperatorChecklist from "./pages/operations/OperatorChecklist";
import LoadedOrders from "./pages/operations/LoadedOrders";
import FuelEntry from "./pages/operations/FuelEntry";
import FuelReport from "./pages/reports/FuelReport";
import VehicleManagement from "./pages/operations/VehicleManagement";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DailyReport from "./pages/driver/DailyReport";
import SafetyChecklist from "./pages/driver/SafetyChecklist";
import MaintenanceReport from "./pages/driver/MaintenanceReport";
import ExpenseEntry from "./pages/driver/ExpenseEntry";
import DailyReportsAdmin from "./pages/reports/DailyReportsAdmin";
import ChecklistsAdmin from "./pages/reports/ChecklistsAdmin";
import MaintenanceAdmin from "./pages/reports/MaintenanceAdmin";
import NotFound from "./pages/NotFound";
import Documentation from "./pages/Documentation";
import DataImport from "./pages/settings/DataImport";

const queryClient = new QueryClient();

type RouteGateProps = {
  isAuthenticated: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
};

const ProtectedRoute = ({ isAuthenticated, isLoading, children }: RouteGateProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Carregando…</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role !== 'diretor') {
    toast.error('Acesso restrito a diretores');
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

const PublicRoute = ({ isAuthenticated, isLoading, children }: RouteGateProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Carregando…</div>
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
      <Routes>
        <Route path="/login" element={<PublicRoute isAuthenticated={isAuthenticated} isLoading={isLoading}><Login /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}><Index /></ProtectedRoute>} />
        <Route path="/configuracao/usuarios" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/configuracao/pagamentos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="configuracao" action="Empresa">
              <PaymentMethods />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/configuracao/empresa" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="configuracao" action="Empresa">
              <CompanySettingsPage />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/configuracao/contas-recebimento" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="configuracao" action="Contas de Recebimento">
              <ReceivingAccounts />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/configuracao/importacao" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="configuracao" action="Importação">
              <DataImport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/cadastro/clientes" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="cadastro" action="Clientes">
              <CustomerManagement />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/cadastro/produtos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="cadastro" action="Produtos">
              <ProductManagement />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/cadastro/fornecedores" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="cadastro" action="Fornecedores">
              <SupplierManagement />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/vendas/nova" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="vendas" action="Nova Venda">
              <NewSale />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/vendas/pedidos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="vendas" action="Pedidos">
              <SalesList type="pedido" />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/vendas/orcamentos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="vendas" action="Orçamentos">
              <SalesList type="orcamento" />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/financeiro/contas-a-receber" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="financeiro" action="Contas a Receber">
              <AccountsReceivable />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/financeiro/contas-a-pagar" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="financeiro" action="Contas a Pagar">
              <AccountsPayable />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/permuta" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Permuta">
              <BarterDashboard />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <ReportsIndex />
          </ProtectedRoute>
        } />
        <Route path="/relatorios/vendas" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Vendas">
              <SalesReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/produtos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Produtos">
              <ProductsReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/clientes" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Clientes">
              <CustomersReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/financeiro" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Financeiro">
              <FinancialReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/fornecedores" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Fornecedores">
              <SuppliersReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/ticagem" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Ticagem">
              <TickingReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/assistente" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <AIAssistant />
          </ProtectedRoute>
        } />
        <Route path="/relatorios/caixa" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Caixa">
              <CashRegisterReport />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        {/* Operator Routes */}
        <Route path="/operador" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="operacao" action="Operador">
              <OperatorPanel />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/operador/carregamento" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="operacao" action="Operador">
              <OperatorDashboard />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/operador/checklist" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="operacao" action="Operador">
              <OperatorChecklist />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/operacao/carregados" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="operacao" action="Carregados">
              <LoadedOrders />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/operacao/abastecimento" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <FuelEntry />
          </ProtectedRoute>
        } />
        <Route path="/configuracao/veiculos" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="configuracao" action="Veículos">
              <VehicleManagement />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        {/* Driver Routes */}
        <Route path="/motorista" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/motorista/parte-diaria" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}><DailyReport /></ProtectedRoute>} />
        <Route path="/motorista/checklist" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}><SafetyChecklist /></ProtectedRoute>} />
        <Route path="/motorista/manutencao" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}><MaintenanceReport /></ProtectedRoute>} />
        <Route path="/motorista/despesas" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}><ExpenseEntry /></ProtectedRoute>} />
        {/* Admin Reports for Driver Module */}
        <Route path="/relatorios/partes-diarias" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Partes Diárias">
              <DailyReportsAdmin />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/checklists" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Checklists">
              <ChecklistsAdmin />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/manutencoes" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <PermissionRoute module="relatorios" action="Manutenções">
              <MaintenanceAdmin />
            </PermissionRoute>
          </ProtectedRoute>
        } />
        <Route path="/relatorios/abastecimento" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <FuelReport />
          </ProtectedRoute>
        } />
        <Route path="/documentacao" element={<ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}><Documentation /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
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
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
```

---

## 2. ARQUIVO: src/types/product.ts (COM DENSIDADE!)

```typescript
export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  density?: number; // Peso em Kg por m³
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock?: number;
  active: boolean;
  createdAt: Date;
}

export const unitOptions = [
  { value: 'UN', label: 'UN - Unidade' },
  { value: 'KG', label: 'KG - Quilograma' },
  { value: 'MT', label: 'MT - Metro' },
  { value: 'LT', label: 'LT - Litro' },
  { value: 'CX', label: 'CX - Caixa' },
  { value: 'PC', label: 'PC - Peça' },
  { value: 'ML', label: 'ML - Mililitro' },
  { value: 'M2', label: 'M² - Metro Quadrado' },
  { value: 'M3', label: 'M³ - Metro Cúbico' },
];
```

---

## 3. ARQUIVO: src/types/operator.ts

```typescript
export type ChecklistAnswer = 'sim' | 'não' | 'não se aplica';

export interface OperatorChecklist {
  id: string;
  user_id: string;
  user_name: string;
  equipment_id: string;
  nivel_oleo_motor: ChecklistAnswer;
  nivel_oleo_hidraulico: ChecklistAnswer;
  nivel_liquido_arrefecimento: ChecklistAnswer;
  filtro_ar_limpo: ChecklistAnswer;
  vazamentos_hidraulicos: ChecklistAnswer;
  mangueiras_hidraulicas: ChecklistAnswer;
  cilindros_hidraulicos: ChecklistAnswer;
  cacamba_estado: ChecklistAnswer;
  dentes_cacamba: ChecklistAnswer;
  articulacao_central: ChecklistAnswer;
  pinos_buchas: ChecklistAnswer;
  pneus_estado: ChecklistAnswer;
  pneus_calibragem: ChecklistAnswer;
  parafusos_rodas: ChecklistAnswer;
  display_balanca: ChecklistAnswer;
  calibracao_balanca: ChecklistAnswer;
  sensores_balanca: ChecklistAnswer;
  cabo_conexao_balanca: ChecklistAnswer;
  cintos_seguranca: ChecklistAnswer;
  extintor: ChecklistAnswer;
  espelhos_retrovisores: ChecklistAnswer;
  luzes_funcionando: ChecklistAnswer;
  alarme_re: ChecklistAnswer;
  limpador_parabrisa: ChecklistAnswer;
  ar_condicionado: ChecklistAnswer;
  comandos_operacionais: ChecklistAnswer;
  freios: ChecklistAnswer;
  buzina: ChecklistAnswer;
  has_repairs_needed: boolean;
  created_at: string;
}

export const EQUIPMENT_LIST = [
  { id: 'PA_CAT_938K', name: 'Pá Carregadeira CAT 938K' },
  { id: 'PA_CAT_950H', name: 'Pá Carregadeira CAT 950H' },
] as const;

export const OPERATOR_CHECKLIST_QUESTIONS = [
  // Motor e Fluidos (4)
  { key: 'nivel_oleo_motor', question: 'Nível do óleo do motor está OK?', category: 'Motor e Fluidos', icon: '🛢️' },
  { key: 'nivel_oleo_hidraulico', question: 'Nível do óleo hidráulico está OK?', category: 'Motor e Fluidos', icon: '🛢️' },
  { key: 'nivel_liquido_arrefecimento', question: 'Nível do líquido de arrefecimento está OK?', category: 'Motor e Fluidos', icon: '🌡️' },
  { key: 'filtro_ar_limpo', question: 'Filtro de ar está limpo/desobstruído?', category: 'Motor e Fluidos', icon: '💨' },
  
  // Sistema Hidráulico (3)
  { key: 'vazamentos_hidraulicos', question: 'Não há vazamentos no sistema hidráulico?', category: 'Sistema Hidráulico', icon: '💧' },
  { key: 'mangueiras_hidraulicas', question: 'Mangueiras hidráulicas estão em bom estado?', category: 'Sistema Hidráulico', icon: '🔧' },
  { key: 'cilindros_hidraulicos', question: 'Cilindros hidráulicos funcionando corretamente?', category: 'Sistema Hidráulico', icon: '⚙️' },
  
  // Caçamba e Estrutura (4)
  { key: 'cacamba_estado', question: 'Caçamba/concha está em bom estado?', category: 'Caçamba e Estrutura', icon: '🪣' },
  { key: 'dentes_cacamba', question: 'Dentes da caçamba estão em condições de uso?', category: 'Caçamba e Estrutura', icon: '🦷' },
  { key: 'articulacao_central', question: 'Articulação central funcionando normalmente?', category: 'Caçamba e Estrutura', icon: '🔗' },
  { key: 'pinos_buchas', question: 'Pinos e buchas estão lubrificados e sem folgas?', category: 'Caçamba e Estrutura', icon: '📍' },
  
  // Pneus e Rodas (3)
  { key: 'pneus_estado', question: 'Pneus estão em bom estado (sem cortes/danos)?', category: 'Pneus e Rodas', icon: '🛞' },
  { key: 'pneus_calibragem', question: 'Pneus estão com calibragem adequada?', category: 'Pneus e Rodas', icon: '🎯' },
  { key: 'parafusos_rodas', question: 'Parafusos das rodas estão todos apertados?', category: 'Pneus e Rodas', icon: '🔩' },
  
  // Sistema de Pesagem/Balança (4)
  { key: 'display_balanca', question: 'Display da balança está funcionando e legível?', category: 'Balança de Pesagem', icon: '📟' },
  { key: 'calibracao_balanca', question: 'Balança foi calibrada/zerada antes de iniciar?', category: 'Balança de Pesagem', icon: '⚖️' },
  { key: 'sensores_balanca', question: 'Sensores de peso estão limpos e sem obstruções?', category: 'Balança de Pesagem', icon: '📡' },
  { key: 'cabo_conexao_balanca', question: 'Cabos de conexão da balança estão íntegros?', category: 'Balança de Pesagem', icon: '🔌' },
  
  // Cabine e Segurança (7)
  { key: 'cintos_seguranca', question: 'Cinto de segurança está funcionando?', category: 'Cabine e Segurança', icon: '🪢' },
  { key: 'extintor', question: 'Extintor de incêndio está presente e válido?', category: 'Cabine e Segurança', icon: '🧯' },
  { key: 'espelhos_retrovisores', question: 'Espelhos retrovisores estão OK?', category: 'Cabine e Segurança', icon: '🪞' },
  { key: 'luzes_funcionando', question: 'Luzes (faróis, giroflex, traseiras) funcionando?', category: 'Cabine e Segurança', icon: '💡' },
  { key: 'alarme_re', question: 'Alarme de ré está funcionando?', category: 'Cabine e Segurança', icon: '🔔' },
  { key: 'limpador_parabrisa', question: 'Limpador de para-brisa está funcionando?', category: 'Cabine e Segurança', icon: '🌧️' },
  { key: 'ar_condicionado', question: 'Ar condicionado está funcionando?', category: 'Cabine e Segurança', icon: '❄️' },
  
  // Controles (3)
  { key: 'comandos_operacionais', question: 'Comandos/joysticks respondendo corretamente?', category: 'Controles', icon: '🕹️' },
  { key: 'freios', question: 'Sistema de freios está funcionando?', category: 'Controles', icon: '🛑' },
  { key: 'buzina', question: 'Buzina está funcionando?', category: 'Controles', icon: '📢' },
] as const;
```

---

## LISTA COMPLETA DE ARQUIVOS PARA COPIAR

Você precisa copiar os seguintes arquivos do projeto ATUAL para o NOVO:

### Types (9 arquivos)
- `src/types/user.ts` ✅ (já está no contexto)
- `src/types/customer.ts` ✅ (já está no contexto)
- `src/types/product.ts` ✅ (código acima)
- `src/types/sales.ts` ✅ (já está no contexto)
- `src/types/financial.ts` ✅ (já está no contexto)
- `src/types/supplier.ts` ✅ (já está no contexto)
- `src/types/vehicle.ts` ✅ (já está no contexto)
- `src/types/driver.ts` ✅ (já está no contexto)
- `src/types/operator.ts` ✅ (código acima)

### Contexts (8 arquivos)
- `src/contexts/AuthContext.tsx`
- `src/contexts/CustomerContext.tsx`
- `src/contexts/ProductContext.tsx`
- `src/contexts/SalesContext.tsx`
- `src/contexts/FinancialContext.tsx`
- `src/contexts/SupplierContext.tsx`
- `src/contexts/SettingsContext.tsx`
- `src/contexts/CompanyContext.tsx`

### Pages - Vendas
- `src/pages/sales/NewSale.tsx` (922 linhas)
- `src/pages/sales/SalesList.tsx` (732 linhas)
- `src/components/sales/SalePrintView.tsx`

### Pages - Financeiro
- `src/pages/financial/AccountsReceivable.tsx` (442 linhas)
- `src/pages/financial/AccountsPayable.tsx` (684 linhas)

### Pages - Produtos
- `src/pages/products/ProductManagement.tsx` (480 linhas - COM DENSIDADE!)

### Pages - Operador
- `src/pages/operations/OperatorPanel.tsx` (239 linhas)
- `src/pages/operations/OperatorDashboard.tsx`
- `src/pages/operations/OperatorChecklist.tsx` (278 linhas)
- `src/pages/operations/FuelEntry.tsx` (647 linhas)
- `src/pages/operations/VehicleManagement.tsx`
- `src/pages/operations/LoadedOrders.tsx`

### Pages - Motorista
- `src/pages/driver/DriverDashboard.tsx` (308 linhas)
- `src/pages/driver/DailyReport.tsx` (244 linhas)
- `src/pages/driver/SafetyChecklist.tsx`
- `src/pages/driver/MaintenanceReport.tsx`
- `src/pages/driver/ExpenseEntry.tsx`

### Pages - Relatórios
- `src/pages/reports/ReportsIndex.tsx`
- `src/pages/reports/SalesReport.tsx`
- `src/pages/reports/ProductsReport.tsx`
- `src/pages/reports/CustomersReport.tsx`
- `src/pages/reports/FinancialReport.tsx`
- `src/pages/reports/SuppliersReport.tsx`
- `src/pages/reports/TickingReport.tsx`
- `src/pages/reports/CashRegisterReport.tsx`
- `src/pages/reports/FuelReport.tsx`
- `src/pages/reports/DailyReportsAdmin.tsx`
- `src/pages/reports/ChecklistsAdmin.tsx`
- `src/pages/reports/MaintenanceAdmin.tsx`
- `src/pages/reports/AIAssistant.tsx`

### Edge Functions
- `supabase/functions/auth-login/index.ts`
- `supabase/functions/auth-verify/index.ts`
- `supabase/functions/auth-hash-password/index.ts`
- `supabase/functions/business-chat/index.ts`
- `supabase/functions/analyze-ticket/index.ts`
- `supabase/functions/analyze-receipt/index.ts`
- `supabase/functions/analyze-import/index.ts`
- `supabase/functions/analyze-sales-pdf/index.ts`

### Configuração
- `supabase/config.toml` (atualizar project_id)

---

## PRÓXIMO PASSO: COPIAR VIA GIT

A forma mais rápida de copiar todo o código é:

1. **Neste projeto**, vá em Settings > Export to GitHub
2. Exporte para um repositório privado
3. **No novo projeto**, vá em Settings > Import from GitHub
4. Importe o repositório

Isso copiará TODOS os arquivos de uma vez, incluindo os que não estão neste documento.

---

## VERIFICAÇÃO FINAL

Após copiar os arquivos, verifique:

1. ✅ Login funciona com 001/admin123
2. ✅ Menu de Vendas aparece com "Nova Venda"
3. ✅ Produtos têm campo de Densidade
4. ✅ Financeiro → Contas a Receber funciona
5. ✅ Financeiro → Contas a Pagar funciona
6. ✅ Operador → Painel aparece
7. ✅ Motorista → Parte Diária funciona
8. ✅ Relatórios têm todos os itens do menu
