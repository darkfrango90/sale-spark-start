import { useState } from 'react';
import { 
  LogOut,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface SubMenuItem {
  label: string;
  path?: string;
  module?: string;
  action?: string;
  adminOnly?: boolean;
}

interface MenuItem {
  label: string;
  module?: string;
  items?: SubMenuItem[];
  driverOnly?: boolean;
  operatorOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { label: "Cadastro", module: "cadastro", items: [
    { label: "Clientes", path: "/cadastro/clientes", module: "cadastro", action: "Clientes" },
    { label: "Produtos", path: "/cadastro/produtos", module: "cadastro", action: "Produtos" },
    { label: "Fornecedores", path: "/cadastro/fornecedores", module: "cadastro", action: "Fornecedores" },
  ]},
  { label: "Vendas", module: "vendas", items: [
    { label: "Nova Venda", path: "/vendas/nova", module: "vendas", action: "Nova Venda" },
    { label: "Orçamentos", path: "/vendas/orcamentos", module: "vendas", action: "Orçamentos" },
    { label: "Pedidos", path: "/vendas/pedidos", module: "vendas", action: "Pedidos" }
  ]},
  { label: "Operação", module: "operacao", items: [
    { label: "Painel Operador", path: "/operador", module: "operacao", action: "Operador" },
    { label: "Carregados", path: "/operacao/carregados", module: "operacao", action: "Carregados" },
    { label: "Abastecimento", path: "/operacao/abastecimento" },
    { label: "Veículos", path: "/operacao/veiculos", module: "operacao", action: "Veículos" }
  ]},
  { label: "Motorista", module: "motorista", driverOnly: true, items: [
    { label: "Painel", path: "/motorista", module: "motorista" },
    { label: "Parte Diária", path: "/motorista/parte-diaria", module: "motorista", action: "Parte Diária" },
    { label: "CheckList", path: "/motorista/checklist", module: "motorista", action: "CheckList" },
    { label: "Manutenção", path: "/motorista/manutencao", module: "motorista", action: "Manutenção" }
  ]},
  { label: "Financeiro", module: "financeiro", items: [
    { label: "Contas a Pagar", path: "/financeiro/contas-a-pagar", module: "financeiro", action: "Contas a Pagar" },
    { label: "Contas a Receber", path: "/financeiro/contas-a-receber", module: "financeiro", action: "Contas a Receber" },
  ]},
  { label: "Relatórios", module: "relatorios", items: [
    { label: "Vendas", path: "/relatorios/vendas", module: "relatorios", action: "Vendas" },
    { label: "Caixa", path: "/relatorios/caixa", module: "relatorios", action: "Caixa" },
    { label: "Produtos", path: "/relatorios/produtos", module: "relatorios", action: "Produtos" },
    { label: "Financeiro", path: "/relatorios/financeiro", module: "relatorios", action: "Financeiro" },
    { label: "Clientes", path: "/relatorios/clientes", module: "relatorios", action: "Clientes" },
    { label: "Fornecedores", path: "/relatorios/fornecedores", module: "relatorios", action: "Fornecedores" },
    { label: "Permuta", path: "/relatorios/permuta", module: "relatorios", action: "Permuta" },
    { label: "Ticagem", path: "/relatorios/ticagem", module: "relatorios", action: "Ticagem" },
    { label: "Partes Diárias", path: "/relatorios/partes-diarias", module: "relatorios", action: "Partes Diárias" },
    { label: "Checklists", path: "/relatorios/checklists", module: "relatorios", action: "Checklists" },
    { label: "Manutenções", path: "/relatorios/manutencoes", module: "relatorios", action: "Manutenções" },
    { label: "Assistente IA", path: "/relatorios/assistente", module: "relatorios" }
  ]},
  { label: "Configuração", module: "configuracao", items: [
    { label: "Empresa", path: "/configuracao/empresa", module: "configuracao", action: "Empresa" },
    { label: "Usuários", path: "/configuracao/usuarios", adminOnly: true },
    { label: "Condições de Pagamento", path: "/configuracao/pagamentos", module: "configuracao", action: "Empresa" },
    { label: "Contas de Recebimento", path: "/configuracao/contas-recebimento", module: "configuracao", action: "Contas de Recebimento" },
    { label: "Sistema", module: "configuracao", action: "Sistema" }
  ]},
];

const TopMenu = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { hasModuleAccess, hasActionAccess, isAdmin } = usePermissions();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuItemClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    // Driver menu only visible for drivers and directors
    if (item.driverOnly) {
      return user?.role === 'motorista' || user?.role === 'diretor';
    }
    // Operator menu visible for operators and directors
    if (item.operatorOnly) {
      return user?.role === 'operador' || user?.role === 'diretor';
    }
    if (!item.module) return true;
    return hasModuleAccess(item.module);
  }).map(item => ({
    ...item,
    items: item.items?.filter(subItem => {
      if (subItem.adminOnly) return isAdmin;
      if (!subItem.module || !subItem.action) return true;
      return hasActionAccess(subItem.module, subItem.action);
    })
  })).filter(item => !item.items || item.items.length > 0);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Main Menu Bar */}
        <div className="bg-slate-800 text-white">
          <div className="flex items-center justify-between h-12 px-4">
            <div className="flex items-center">
              {/* Logo */}
              <div 
                className="flex items-center gap-2 mr-8 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/')}
              >
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">C</span>
                </div>
                <span className="font-bold text-lg tracking-wide">CEZAR</span>
              </div>

              {/* Menu Items */}
              <nav className="flex items-center gap-1">
                {filteredMenuItems.map((item) => (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-medium hover:bg-slate-700 rounded transition-colors">
                      {item.label}
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border shadow-lg">
                      {item.items?.map((subItem) => (
                        <DropdownMenuItem 
                          key={subItem.label} 
                          className="cursor-pointer"
                          onClick={() => handleMenuItemClick(subItem.path)}
                        >
                          {subItem.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </nav>
            </div>

            {/* Right side: User Info + Logout Button */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">Usuário:</span>
                  <span className="font-medium">{user.name}</span>
                  <span className="text-slate-500">({user.accessCode})</span>
                </div>
              )}
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowLogoutDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja realmente sair?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado do sistema e redirecionado para a tela de login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TopMenu;
