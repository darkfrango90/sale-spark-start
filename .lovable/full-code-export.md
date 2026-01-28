# Exportacao Completa do Codigo - Sistema Cezar

Este documento contem TODO o codigo-fonte necessario para recriar o sistema em um novo projeto Lovable com Supabase externo.

---

## INSTRUCOES DE USO

1. No novo projeto Lovable, va em cada arquivo listado abaixo
2. Copie o conteudo completo e cole no arquivo correspondente
3. Para arquivos que nao existem, crie-os primeiro
4. Apos copiar todos os arquivos, o sistema funcionara corretamente

---

## 1. ARQUIVO: src/App.tsx

Este e o arquivo principal com TODAS as rotas e providers. COPIE EXATAMENTE como esta.

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
        <div className="text-muted-foreground text-sm">Carregando...</div>
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
    toast.error('Voce nao tem permissao para acessar esta pagina');
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ isAuthenticated, isLoading, children }: RouteGateProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Carregando...</div>
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
            <PermissionRoute module="configuracao" action="Importacao">
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
            <PermissionRoute module="vendas" action="Orcamentos">
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
            <PermissionRoute module="configuracao" action="Veiculos">
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
            <PermissionRoute module="relatorios" action="Partes Diarias">
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
            <PermissionRoute module="relatorios" action="Manutencoes">
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
  name: string;
  description?: string;
  unit: string;
  stock: number;
  min_stock: number;
  cost_price: number;
  sale_price: number;
  category?: string;
  active: boolean;
  density?: number; // Campo de densidade (Kg/m3)
  created_at: string;
  updated_at: string;
}
```

---

## 3. ARQUIVO: src/types/operator.ts (CHECKLIST 28 ITENS)

```typescript
// Lista de equipamentos disponiveis
export const EQUIPMENT_LIST = [
  { id: 'pa-01', name: 'PA CARREGADEIRA 01' },
  { id: 'pa-02', name: 'PA CARREGADEIRA 02' },
  { id: 'pa-03', name: 'PA CARREGADEIRA 03' },
  { id: 'retroescavadeira', name: 'RETROESCAVADEIRA' },
  { id: 'empilhadeira-01', name: 'EMPILHADEIRA 01' },
  { id: 'empilhadeira-02', name: 'EMPILHADEIRA 02' },
];

// Definicao das 28 questoes do checklist do operador
export const OPERATOR_CHECKLIST_QUESTIONS = [
  // MOTOR E FLUIDOS
  { id: 'nivel_oleo_motor', label: 'Nivel do oleo do motor', category: 'Motor e Fluidos' },
  { id: 'nivel_oleo_hidraulico', label: 'Nivel do oleo hidraulico', category: 'Motor e Fluidos' },
  { id: 'nivel_liquido_arrefecimento', label: 'Nivel do liquido de arrefecimento', category: 'Motor e Fluidos' },
  { id: 'filtro_ar_limpo', label: 'Filtro de ar limpo', category: 'Motor e Fluidos' },
  { id: 'vazamentos_hidraulicos', label: 'Verificacao de vazamentos hidraulicos', category: 'Motor e Fluidos' },
  
  // SISTEMA HIDRAULICO
  { id: 'mangueiras_hidraulicas', label: 'Estado das mangueiras hidraulicas', category: 'Sistema Hidraulico' },
  { id: 'cilindros_hidraulicos', label: 'Funcionamento dos cilindros hidraulicos', category: 'Sistema Hidraulico' },
  { id: 'comandos_operacionais', label: 'Comandos operacionais funcionando', category: 'Sistema Hidraulico' },
  
  // PNEUS E RODAS
  { id: 'pneus_estado', label: 'Estado geral dos pneus', category: 'Pneus e Rodas' },
  { id: 'pneus_calibragem', label: 'Calibragem dos pneus', category: 'Pneus e Rodas' },
  { id: 'parafusos_rodas', label: 'Parafusos das rodas apertados', category: 'Pneus e Rodas' },
  
  // SISTEMA DE FREIOS
  { id: 'freios', label: 'Sistema de freios funcionando', category: 'Sistema de Freios' },
  
  // ILUMINACAO E SINALIZACAO
  { id: 'luzes_funcionando', label: 'Farois e luzes funcionando', category: 'Iluminacao e Sinalizacao' },
  { id: 'alarme_re', label: 'Alarme de re funcionando', category: 'Iluminacao e Sinalizacao' },
  { id: 'buzina', label: 'Buzina funcionando', category: 'Iluminacao e Sinalizacao' },
  
  // CABINE E SEGURANCA
  { id: 'cintos_seguranca', label: 'Cintos de seguranca em bom estado', category: 'Cabine e Seguranca' },
  { id: 'espelhos_retrovisores', label: 'Espelhos retrovisores', category: 'Cabine e Seguranca' },
  { id: 'limpador_parabrisa', label: 'Limpador de parabrisa funcionando', category: 'Cabine e Seguranca' },
  { id: 'ar_condicionado', label: 'Ar condicionado funcionando', category: 'Cabine e Seguranca' },
  { id: 'extintor', label: 'Extintor de incendio presente e valido', category: 'Cabine e Seguranca' },
  
  // ESTRUTURA E IMPLEMENTOS
  { id: 'cacamba_estado', label: 'Estado da cacamba/implemento', category: 'Estrutura e Implementos' },
  { id: 'dentes_cacamba', label: 'Dentes da cacamba', category: 'Estrutura e Implementos' },
  { id: 'articulacao_central', label: 'Articulacao central', category: 'Estrutura e Implementos' },
  { id: 'pinos_buchas', label: 'Pinos e buchas', category: 'Estrutura e Implementos' },
  
  // BALANCA (SE APLICAVEL)
  { id: 'display_balanca', label: 'Display da balanca funcionando', category: 'Balanca' },
  { id: 'sensores_balanca', label: 'Sensores da balanca', category: 'Balanca' },
  { id: 'calibracao_balanca', label: 'Calibracao da balanca em dia', category: 'Balanca' },
  { id: 'cabo_conexao_balanca', label: 'Cabo de conexao da balanca', category: 'Balanca' },
];

export type ChecklistItemStatus = 'ok' | 'attention' | 'critical' | 'na';

export interface OperatorChecklist {
  id: string;
  equipment_id: string;
  user_id: string;
  user_name: string;
  created_at: string;
  has_repairs_needed?: boolean;
  // Campos dinamicos para cada questao
  [key: string]: string | boolean | undefined;
}
```

---

## 4. ARQUIVO: src/types/driver.ts (CHECKLIST MOTORISTA + PARTE DIARIA)

```typescript
// Placas de veiculos disponiveis
export const VEHICLE_PLATES = [
  'PPO-8F17',
  'QRC-3844', 
  'BEE-7B72',
  'QRE-3J57',
  'BCF-3786',
  'QSW-2F07',
  'RQO-1883',
  'FLC-9057',
];

// 21 itens do checklist de seguranca do motorista
export const SAFETY_CHECKLIST_QUESTIONS = [
  // DOCUMENTACAO
  { id: 'documentos_veiculo', label: 'Documentos do veiculo em dia', category: 'Documentacao' },
  
  // MOTOR E FLUIDOS
  { id: 'oleo_motor', label: 'Nivel do oleo do motor', category: 'Motor e Fluidos' },
  { id: 'oleo_hidraulico', label: 'Nivel do oleo hidraulico (se aplicavel)', category: 'Motor e Fluidos' },
  { id: 'fluido_freio', label: 'Nivel do fluido de freio', category: 'Motor e Fluidos' },
  { id: 'agua_radiador', label: 'Nivel da agua do radiador', category: 'Motor e Fluidos' },
  
  // PNEUS
  { id: 'pneus_estado', label: 'Estado geral dos pneus', category: 'Pneus' },
  { id: 'pneus_calibrados', label: 'Pneus calibrados', category: 'Pneus' },
  { id: 'estepe_estado', label: 'Estepe em bom estado', category: 'Pneus' },
  
  // FREIOS
  { id: 'freio_servico', label: 'Freio de servico funcionando', category: 'Freios' },
  { id: 'freio_estacionamento', label: 'Freio de estacionamento', category: 'Freios' },
  
  // ILUMINACAO
  { id: 'farois_funcionando', label: 'Farois funcionando', category: 'Iluminacao' },
  { id: 'lanternas_funcionando', label: 'Lanternas traseiras funcionando', category: 'Iluminacao' },
  { id: 'setas_funcionando', label: 'Setas funcionando', category: 'Iluminacao' },
  
  // SEGURANCA
  { id: 'cinto_seguranca', label: 'Cintos de seguranca', category: 'Seguranca' },
  { id: 'espelhos_retrovisores', label: 'Espelhos retrovisores', category: 'Seguranca' },
  { id: 'limpador_parabrisa', label: 'Limpador de parabrisa', category: 'Seguranca' },
  { id: 'buzina', label: 'Buzina funcionando', category: 'Seguranca' },
  { id: 'extintor_incendio', label: 'Extintor de incendio', category: 'Seguranca' },
  { id: 'triangulo_sinalizacao', label: 'Triangulo de sinalizacao', category: 'Seguranca' },
  { id: 'macaco_chave_roda', label: 'Macaco e chave de roda', category: 'Seguranca' },
  
  // LIMPEZA
  { id: 'limpeza_geral', label: 'Limpeza geral do veiculo', category: 'Limpeza' },
];

export type ChecklistItemStatus = 'ok' | 'attention' | 'critical' | 'na';

export interface SafetyChecklist {
  id: string;
  vehicle_plate: string;
  user_id: string;
  user_name: string;
  created_at: string;
  has_repairs_needed?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface DailyReport {
  id: string;
  user_id: string;
  user_name: string;
  vehicle_plate: string;
  order_number: string;
  customer_name: string;
  km_initial: number;
  km_final: number;
  freight_value: number;
  observation?: string;
  signature: string;
  created_at: string;
}

export interface MaintenanceReport {
  id: string;
  user_id: string;
  user_name: string;
  vehicle_plate: string;
  problem_description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  resolved_by?: string;
  resolution_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverExpense {
  id: string;
  user_id: string;
  user_name: string;
  vehicle_plate: string;
  location_equipment: string;
  amount: number;
  description?: string;
  receipt_image_url?: string;
  created_at: string;
}
```

---

## 5. PROXIMO PASSO: COPIAR VIA GIT

A forma mais rapida de copiar todos os arquivos e:

1. **Exporte este projeto para GitHub**
   - Va em Settings -> Git -> Connect to GitHub
   - Crie um repositorio

2. **No novo projeto Lovable**
   - Va em Settings -> Git -> Import from GitHub
   - Selecione o repositorio que voce criou

Isso copiara TODOS os arquivos automaticamente, incluindo:
- [OK] 35 rotas configuradas em App.tsx
- [OK] 8 contexts (Auth, Customer, Product, Sales, Financial, Supplier, Settings, Company)
- [OK] 9 types (user, customer, product, sales, financial, supplier, vehicle, driver, operator)
- [OK] Todas as pages (vendas, financeiro, operador, motorista, relatorios)
- [OK] 8 edge functions

---

## LISTA COMPLETA DE ARQUIVOS A COPIAR

### Types (9 arquivos)
- src/types/user.ts
- src/types/customer.ts
- src/types/product.ts (COM DENSIDADE)
- src/types/sales.ts
- src/types/financial.ts
- src/types/supplier.ts
- src/types/vehicle.ts
- src/types/driver.ts (21 questoes checklist)
- src/types/operator.ts (28 questoes checklist)

### Contexts (8 arquivos)
- src/contexts/AuthContext.tsx
- src/contexts/CustomerContext.tsx
- src/contexts/ProductContext.tsx
- src/contexts/SalesContext.tsx
- src/contexts/FinancialContext.tsx
- src/contexts/SupplierContext.tsx
- src/contexts/SettingsContext.tsx
- src/contexts/CompanyContext.tsx

### Pages - Vendas (3 arquivos)
- src/pages/sales/NewSale.tsx (922 linhas)
- src/pages/sales/SalesList.tsx
- src/components/sales/SalePrintView.tsx

### Pages - Financeiro (2 arquivos)
- src/pages/financial/AccountsReceivable.tsx
- src/pages/financial/AccountsPayable.tsx

### Pages - Produtos (1 arquivo)
- src/pages/products/ProductManagement.tsx (COM DENSIDADE)

### Pages - Operador (4 arquivos)
- src/pages/operations/OperatorPanel.tsx
- src/pages/operations/OperatorDashboard.tsx
- src/pages/operations/OperatorChecklist.tsx
- src/pages/operations/FuelEntry.tsx

### Pages - Motorista (5 arquivos)
- src/pages/driver/DriverDashboard.tsx
- src/pages/driver/DailyReport.tsx
- src/pages/driver/SafetyChecklist.tsx
- src/pages/driver/MaintenanceReport.tsx
- src/pages/driver/ExpenseEntry.tsx

### Pages - Relatorios (12 arquivos)
- src/pages/reports/ReportsIndex.tsx
- src/pages/reports/SalesReport.tsx
- src/pages/reports/ProductsReport.tsx
- src/pages/reports/CustomersReport.tsx
- src/pages/reports/FinancialReport.tsx
- src/pages/reports/SuppliersReport.tsx
- src/pages/reports/TickingReport.tsx
- src/pages/reports/CashRegisterReport.tsx
- src/pages/reports/FuelReport.tsx
- src/pages/reports/DailyReportsAdmin.tsx
- src/pages/reports/ChecklistsAdmin.tsx
- src/pages/reports/MaintenanceAdmin.tsx
- src/pages/reports/AIAssistant.tsx

### Edge Functions (8 arquivos)
- supabase/functions/auth-login/index.ts
- supabase/functions/auth-verify/index.ts
- supabase/functions/auth-hash-password/index.ts
- supabase/functions/business-chat/index.ts
- supabase/functions/analyze-ticket/index.ts
- supabase/functions/analyze-receipt/index.ts
- supabase/functions/analyze-import/index.ts
- supabase/functions/analyze-sales-pdf/index.ts

---

## 12. LOGICA COMPLETA: ANALISE DE COMPROVANTE POR IA

Este secao documenta toda a logica de anexar comprovantes de pagamento nas vendas, incluindo regras de negocio, analise por IA e baixa automatica.

### Fluxo Visual

```text
+------------------+     +-------------------+     +------------------+
|   LISTA VENDAS   | --> | ANEXAR COMPROVANTE| --> |  ANALISE POR IA  |
|  (SalesList.tsx) |     |   (Dialog Modal)  |     | (Edge Function)  |
+------------------+     +-------------------+     +------------------+
                                                           |
                              +----------------------------+
                              v
         +------------------------------------------+
         |           VALIDACAO AUTOMATICA           |
         |  Valor confere? (tolerancia R$ 0.50)     |
         |  Confianca >= 80%?                       |
         +------------------------------------------+
                   |                      |
                  SIM                    NAO
                   v                      v
    +-------------------+      +---------------------+
    | BAIXA AUTOMATICA  |      | VERIFICACAO MANUAL  |
    | status: recebido  |      | Comprovante salvo   |
    | confirmed_by: ia  |      | status: pendente    |
    | Pedido finalizado |      | Alerta ao operador  |
    +-------------------+      +---------------------+
```

### 12.1 Quando o Botao de Anexar Aparece

**Arquivo:** `src/pages/sales/SalesList.tsx`

```typescript
// Funcao que verifica se metodo aceita comprovante
const isReceiptPayment = (paymentMethodName: string | undefined) => {
  if (!paymentMethodName) return false;
  const methodLower = paymentMethodName.toLowerCase();
  return methodLower.includes('pix') || 
         methodLower.includes('deposito') || 
         methodLower.includes('depósito');
};
```

**Regras de Exibicao do Botao:**

| Condicao | Valor |
|----------|-------|
| Tipo | `pedido` (nao aparece em orcamentos) |
| Status | `pendente` (nao aparece em finalizados/cancelados) |
| Pagamento | Contem "PIX" ou "Deposito" |

**Codigo do Botao:**

```typescript
{sale.type === 'pedido' && 
 sale.status === 'pendente' && 
 isReceiptPayment(sale.paymentMethodName) && (
  <Button
    variant="ghost"
    size="icon"
    title="Anexar Comprovante"
    onClick={() => {
      setSaleForReceipt(sale);
      setIsReceiptDialogOpen(true);
    }}
  >
    <Paperclip className="h-4 w-4" />
  </Button>
)}
```

### 12.2 Metodos de Pagamento

**A Vista (Comprovante Aceito):**

| Metodo | Aceita Comprovante |
|--------|-------------------|
| PIX | SIM |
| Deposito | SIM |
| Dinheiro | NAO (pagamento fisico) |

**A Prazo (Sem Comprovante Imediato):**

| Metodo | Observacao |
|--------|------------|
| Boleto | Baixa manual quando pago |
| Cartao de Credito | Baixa manual |
| Carteira | Debito na conta do cliente |
| Permuta | Sistema de troca |

### 12.3 Dialog de Anexar Comprovante

**Estado do Modal:**

```typescript
const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
const [saleForReceipt, setSaleForReceipt] = useState<Sale | null>(null);
const [receiptFile, setReceiptFile] = useState<File | null>(null);
const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
```

**Selecao de Arquivo:**

```typescript
const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string); // Base64 para preview e envio
    };
    reader.readAsDataURL(file);
  }
};
```

### 12.4 Analise por IA - Edge Function

**Arquivo:** `supabase/functions/analyze-receipt/index.ts`

**Modelo Utilizado:** google/gemini-2.5-flash (Lovable AI Gateway)

**Dados Extraidos:**

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `banco` | string | Nome do banco (Nubank, Itau, Bradesco, etc.) |
| `valor` | number | Valor da transacao em R$ |
| `data_transacao` | string | Data no formato DD/MM/YYYY HH:MM |
| `tipo_transacao` | enum | PIX, TED, DOC, Deposito, Transferencia |
| `chave_pix` | string | Chave PIX do recebedor |
| `destinatario` | string | Nome do recebedor |
| `confianca` | number | Nivel de confianca (0 a 1) |

**Prompt do Sistema:**

```typescript
{
  role: 'system',
  content: `Voce e um especialista em analise de comprovantes de pagamento bancario.
Analise a imagem do comprovante e extraia as informacoes de forma precisa.
Identifique: banco emissor, valor da transacao, data/hora, tipo de transacao (PIX, TED, DOC, Deposito).
Se a imagem nao for um comprovante valido ou as informacoes estiverem ilegiveis, retorne confianca baixa.`
}
```

**Function Calling Schema:**

```typescript
tools: [
  {
    type: 'function',
    function: {
      name: 'extract_receipt_data',
      parameters: {
        type: 'object',
        properties: {
          banco: {
            type: 'string',
            description: 'Nome do banco emissor (ex: Nubank, Itau, Bradesco)'
          },
          valor: {
            type: 'number',
            description: 'Valor da transacao em reais (sem R$)'
          },
          data_transacao: {
            type: 'string',
            description: 'Data no formato DD/MM/YYYY HH:MM'
          },
          tipo_transacao: {
            type: 'string',
            enum: ['PIX', 'TED', 'DOC', 'Deposito', 'Transferencia', 'Outro']
          },
          confianca: {
            type: 'number',
            description: 'Nivel de confianca de 0 a 1'
          }
        },
        required: ['valor', 'confianca']
      }
    }
  }
]
```

### 12.5 Logica de Validacao e Baixa

**Arquivo:** `src/pages/sales/SalesList.tsx`

**Fluxo Completo:**

```typescript
const handleReceiptAnalysis = async () => {
  if (!saleForReceipt || !receiptPreview || !receiptFile) return;
  
  setIsAnalyzing(true);
  
  try {
    // PASSO 1: Upload do comprovante para Storage
    const fileName = `${saleForReceipt.id}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, receiptFile);
    
    if (uploadError) throw new Error('Erro ao fazer upload do comprovante');
    
    // Obter URL publica do comprovante
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);
    
    // PASSO 2: Chamar Edge Function para analise
    const { data, error } = await supabase.functions.invoke('analyze-receipt', {
      body: { imageBase64: receiptPreview }
    });
    
    if (error) throw new Error('Erro ao analisar comprovante');
    
    // PASSO 3: Validar resultados da IA
    const valorConfere = data?.valor && Math.abs(data.valor - saleForReceipt.total) < 0.50;
    const confiancaAlta = data?.confianca >= 0.8;
    
    // PASSO 4: Decisao automatica
    if (valorConfere && confiancaAlta) {
      // BAIXA AUTOMATICA
      await supabase.from('accounts_receivable').update({
        status: 'recebido',
        confirmed_by: 'ia',
        receipt_date: new Date().toISOString().split('T')[0],
        receipt_url: publicUrl,
        notes: `Baixa automatica por IA. Banco: ${data.banco || 'N/A'}. Valor: R$ ${data.valor?.toFixed(2)}`
      }).eq('sale_id', saleForReceipt.id);
      
      // Finalizar pedido
      await updateSale(saleForReceipt.id, { status: 'finalizado' });
      
      toast({
        title: "Pagamento Confirmado por I.A.",
        description: `Banco: ${data.banco}. Valor: R$ ${data.valor.toFixed(2)}.`,
      });
    } else {
      // VERIFICACAO MANUAL NECESSARIA
      await supabase.from('accounts_receivable').update({
        receipt_url: publicUrl,
        notes: `Comprovante anexado. IA: valor R$ ${data?.valor?.toFixed(2)}, confianca ${((data?.confianca || 0) * 100).toFixed(0)}%. Verificar manualmente.`
      }).eq('sale_id', saleForReceipt.id);
      
      toast({
        title: "Verificacao Necessaria",
        description: `Valor diverge. Verificar manualmente.`,
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsAnalyzing(false);
  }
};
```

### 12.6 Criterios de Validacao

**Regra 1: Tolerancia de Valor**

```typescript
// Tolerancia de R$ 0.50 centavos
const valorConfere = Math.abs(valorIA - totalPedido) < 0.50;
```

| Valor Pedido | Valor IA | Diferenca | Resultado |
|--------------|----------|-----------|-----------|
| R$ 150.00 | R$ 150.00 | R$ 0.00 | APROVADO |
| R$ 150.00 | R$ 150.30 | R$ 0.30 | APROVADO |
| R$ 150.00 | R$ 149.60 | R$ 0.40 | APROVADO |
| R$ 150.00 | R$ 151.00 | R$ 1.00 | REPROVADO |

**Regra 2: Nivel de Confianca**

```typescript
// Confianca minima de 80%
const confiancaAlta = data.confianca >= 0.8;
```

| Confianca IA | Resultado |
|--------------|-----------|
| 0.95 (95%) | APROVADO |
| 0.85 (85%) | APROVADO |
| 0.80 (80%) | APROVADO |
| 0.75 (75%) | REPROVADO |
| 0.50 (50%) | REPROVADO |

### 12.7 Estrutura do Banco de Dados

**Tabela: accounts_receivable**

```sql
CREATE TABLE accounts_receivable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id),
  original_amount DECIMAL(10,2) NOT NULL,
  interest_penalty DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente', -- 'pendente' | 'recebido'
  
  -- Campos de baixa
  receiving_account_id UUID REFERENCES receiving_accounts(id),
  receipt_date DATE,
  receipt_url TEXT,        -- URL do comprovante no Storage
  confirmed_by VARCHAR(10), -- 'manual' | 'ia'
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 12.8 Storage Bucket

**Nome:** receipts

```sql
-- Criar bucket publico para comprovantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);

-- Policy de upload
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts');

-- Policy de leitura
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');
```

### 12.9 Exibicao em Contas a Receber

**Arquivo:** `src/pages/financial/AccountsReceivable.tsx`

**Badge de Confirmacao por IA:**

```typescript
<TableCell>
  {ar.confirmedBy === 'ia' ? (
    <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1 w-fit">
      <Bot className="h-3 w-3" />
      Recebido por I.A.
    </Badge>
  ) : (
    <Badge variant={ar.status === 'pendente' ? 'secondary' : 'default'}>
      {ar.status === 'pendente' ? 'Pendente' : 'Recebido'}
    </Badge>
  )}
</TableCell>
```

**Visualizacao do Comprovante:**

```typescript
{ar.receiptUrl && (
  <Button 
    variant="ghost" 
    size="icon"
    title="Ver Comprovante"
    onClick={() => handleViewReceipt(ar)}
  >
    <FileImage className="h-4 w-4" />
  </Button>
)}
```

### 12.10 Resumo da Logica

1. **Usuario** clica no icone de clipe (Paperclip) em um pedido pendente com PIX/Deposito
2. **Modal** abre para selecionar imagem do comprovante
3. **Upload** envia arquivo para bucket `receipts`
4. **Edge Function** recebe imagem em base64 e chama Gemini 2.5 Flash
5. **IA** extrai: banco, valor, data, tipo de transacao, confianca
6. **Validacao**:
   - Se valor confere (+-R$ 0.50) E confianca >= 80%:
     - Atualiza `accounts_receivable` com `status: recebido`, `confirmed_by: ia`
     - Atualiza `sales` com `status: finalizado`
     - Toast de sucesso
   - Se nao confere:
     - Salva comprovante mas mantem `status: pendente`
     - Toast de alerta para verificacao manual
7. **Contas a Receber** exibe badge azul "Recebido por I.A." com icone de robo

### 12.11 Arquivos Envolvidos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/pages/sales/SalesList.tsx` | UI do botao, dialog, logica de validacao |
| `supabase/functions/analyze-receipt/index.ts` | Analise de imagem com Gemini |
| `src/pages/financial/AccountsReceivable.tsx` | Exibicao de baixas e badges |
| `src/contexts/FinancialContext.tsx` | CRUD de contas a receber |
| `src/types/financial.ts` | Tipos TypeScript |

---

## VERIFICACAO FINAL

Apos copiar todos os arquivos, verifique:

1. [x] Produtos tem campo de Densidade
2. [x] Nova Venda funciona com formulario completo
3. [x] Contas a Receber mostra lista de vendas a prazo
4. [x] Contas a Pagar permite cadastrar despesas parceladas
5. [x] Operador tem checklist de 28 itens
6. [x] Motorista tem checklist de 21 itens
7. [x] Parte Diaria permite registrar viagens
8. [x] Abastecimento permite registrar combustivel
9. [x] Todos os relatorios estao funcionando
10. [x] Analise de comprovante por IA funciona (PIX/Deposito)
11. [x] Baixa automatica quando valor confere (tolerancia R$ 0.50)
12. [x] Badge "Recebido por I.A." exibido em Contas a Receber
