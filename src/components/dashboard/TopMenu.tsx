import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
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
    { label: "Operador", path: "/operacao/operador", module: "operacao", action: "Operador" },
    { label: "Carregados", path: "/operacao/carregados", module: "operacao", action: "Carregados" },
    { label: "Abastecimento", path: "/operacao/abastecimento", module: "operacao", action: "Abastecimento" },
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
    { label: "Produtos", path: "/relatorios/produtos", module: "relatorios", action: "Produtos" },
    { label: "Financeiro", path: "/relatorios/financeiro", module: "relatorios", action: "Financeiro" },
    { label: "Clientes", path: "/relatorios/clientes", module: "relatorios", action: "Clientes" },
    { label: "Fornecedores", path: "/relatorios/fornecedores", module: "relatorios", action: "Fornecedores" },
    { label: "Permuta", path: "/relatorios/permuta", module: "relatorios", action: "Permuta" },
    { label: "Ticagem", path: "/relatorios/ticagem", module: "relatorios", action: "Ticagem" },
    { label: "Partes Diárias", path: "/relatorios/partes-diarias", module: "relatorios", action: "Partes Diárias" },
    { label: "Checklists", path: "/relatorios/checklists", module: "relatorios", action: "Checklists" },
    { label: "Manutenções", path: "/relatorios/manutencoes", module: "relatorios", action: "Manutenções" }
  ]},
  { label: "Configuração", module: "configuracao", items: [
    { label: "Empresa", path: "/configuracao/empresa", module: "configuracao", action: "Empresa" },
    { label: "Usuários", path: "/configuracao/usuarios", adminOnly: true },
    { label: "Condições de Pagamento", path: "/configuracao/pagamentos", module: "configuracao", action: "Empresa" },
    { label: "Contas de Recebimento", path: "/configuracao/contas-recebimento", module: "configuracao", action: "Contas de Recebimento" },
    { label: "Sistema", module: "configuracao", action: "Sistema" }
  ]},
];

interface ShortcutItem {
  icon: React.ElementType;
  label: string;
  color: string;
  action?: () => void;
  module?: string;
  actionName?: string;
  adminOnly?: boolean;
}

const TopMenu = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { hasModuleAccess, hasActionAccess, isAdmin } = usePermissions();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const shortcutItems: ShortcutItem[] = [
    { icon: Users, label: "Clientes", color: "text-blue-600", action: () => navigate('/cadastro/clientes'), module: "cadastro", actionName: "Clientes" },
    { icon: Package, label: "Produtos", color: "text-green-600", action: () => navigate('/cadastro/produtos'), module: "cadastro", actionName: "Produtos" },
    { icon: ShoppingCart, label: "Vendas", color: "text-orange-600", action: () => navigate('/vendas/nova'), module: "vendas", actionName: "Nova Venda" },
    { icon: BarChart3, label: "Relatórios", color: "text-indigo-600", module: "relatorios" },
    { icon: Settings, label: "Config.", color: "text-slate-600", action: () => navigate('/configuracao/empresa'), module: "configuracao" },
    { icon: LogOut, label: "Sair", color: "text-rose-600", action: handleLogout },
  ];

  const handleMenuItemClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    // Driver menu only visible for drivers and admins
    if (item.driverOnly) {
      return user?.role === 'motorista' || user?.role === 'admin';
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

  // Filter shortcuts based on permissions
  const filteredShortcuts = shortcutItems.filter(item => {
    if (item.adminOnly) return isAdmin;
    if (!item.module) return true;
    if (item.actionName) {
      return hasActionAccess(item.module, item.actionName);
    }
    return hasModuleAccess(item.module);
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main Menu Bar */}
      <div className="bg-slate-800 text-white">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 mr-8">
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

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Usuário:</span>
              <span className="font-medium">{user.name}</span>
              <span className="text-slate-500">({user.accessCode})</span>
            </div>
          )}
        </div>
      </div>

      {/* Shortcuts Bar */}
      <div className="bg-slate-100 border-b border-slate-300">
        <div className="flex items-center h-14 px-4 gap-1">
          {filteredShortcuts.map((item) => (
            <button
              key={item.label}
              className="flex flex-col items-center justify-center px-3 py-1 hover:bg-slate-200 rounded transition-colors min-w-[60px]"
              title={item.label}
              onClick={item.action}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="text-xs text-slate-600 mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopMenu;