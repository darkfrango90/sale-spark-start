import { 
  Users, 
  Package, 
  ShoppingCart, 
  Wallet, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  label: string;
  items?: { label: string; path?: string }[];
}

const menuItems: MenuItem[] = [
  { label: "Cadastro", items: [
    { label: "Clientes", path: "/cadastro/clientes" },
    { label: "Produtos", path: "/cadastro/produtos" },
    { label: "Fornecedores", path: "/cadastro/fornecedores" },
    { label: "Funcionários" }
  ]},
  { label: "Vendas", items: [
    { label: "Nova Venda", path: "/vendas/nova" },
    { label: "Orçamentos", path: "/vendas/orcamentos" },
    { label: "Pedidos", path: "/vendas/pedidos" }
  ]},
  { label: "Movimentação", items: [
    { label: "Entrada" },
    { label: "Saída" },
    { label: "Transferência" }
  ]},
  { label: "Financeiro", items: [
    { label: "Contas a Pagar", path: "/financeiro/contas-a-pagar" },
    { label: "Contas a Receber", path: "/financeiro/contas-a-receber" },
    { label: "Caixa" },
    { label: "Bancos" }
  ]},
  { label: "Relatórios", items: [
    { label: "Vendas" },
    { label: "Estoque" },
    { label: "Financeiro" },
    { label: "Clientes" }
  ]},
  { label: "Configuração", items: [
    { label: "Empresa", path: "/configuracao/empresa" },
    { label: "Usuários", path: "/configuracao/usuarios" },
    { label: "Condições de Pagamento", path: "/configuracao/pagamentos" },
    { label: "Contas de Recebimento", path: "/configuracao/contas-recebimento" },
    { label: "Sistema" }
  ]},
];

interface ShortcutItem {
  icon: React.ElementType;
  label: string;
  color: string;
  action?: () => void;
}

const TopMenu = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const shortcutItems: ShortcutItem[] = [
    { icon: Users, label: "Clientes", color: "text-blue-600", action: () => navigate('/cadastro/clientes') },
    { icon: Package, label: "Produtos", color: "text-green-600", action: () => navigate('/cadastro/produtos') },
    { icon: ShoppingCart, label: "Vendas", color: "text-orange-600", action: () => navigate('/vendas/nova') },
    { icon: Wallet, label: "Caixa", color: "text-emerald-600" },
    { icon: BarChart3, label: "Relatórios", color: "text-indigo-600" },
    { icon: Settings, label: "Config.", color: "text-slate-600", action: () => navigate('/configuracao/usuarios') },
    { icon: LogOut, label: "Sair", color: "text-rose-600", action: handleLogout },
  ];

  const handleMenuItemClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

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
              {menuItems.map((item) => (
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
          {shortcutItems.map((item) => (
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
