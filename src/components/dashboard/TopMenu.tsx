import { 
  Users, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  FileText, 
  Receipt, 
  Wallet, 
  BarChart3, 
  HardDrive,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  label: string;
  items?: string[];
}

const menuItems: MenuItem[] = [
  { label: "Cadastro", items: ["Clientes", "Produtos", "Fornecedores", "Funcionários"] },
  { label: "Vendas", items: ["Nova Venda", "Orçamentos", "Pedidos"] },
  { label: "O.S.", items: ["Nova O.S.", "Consultar O.S."] },
  { label: "Movimentação", items: ["Entrada", "Saída", "Transferência"] },
  { label: "Financeiro", items: ["Contas a Pagar", "Contas a Receber", "Caixa", "Bancos"] },
  { label: "Relatórios", items: ["Vendas", "Estoque", "Financeiro", "Clientes"] },
  { label: "Configuração", items: ["Empresa", "Usuários", "Sistema", "Backup"] },
];

interface ShortcutItem {
  icon: React.ElementType;
  label: string;
  color: string;
}

const shortcutItems: ShortcutItem[] = [
  { icon: Users, label: "Clientes", color: "text-blue-600" },
  { icon: Package, label: "Produtos", color: "text-green-600" },
  { icon: ShoppingCart, label: "Vendas", color: "text-orange-600" },
  { icon: ClipboardList, label: "O.S.", color: "text-purple-600" },
  { icon: FileText, label: "NF-e", color: "text-red-600" },
  { icon: Receipt, label: "Boletos", color: "text-cyan-600" },
  { icon: Wallet, label: "Caixa", color: "text-emerald-600" },
  { icon: BarChart3, label: "Relatórios", color: "text-indigo-600" },
  { icon: HardDrive, label: "Backup", color: "text-gray-600" },
  { icon: Settings, label: "Config.", color: "text-slate-600" },
  { icon: HelpCircle, label: "Ajuda", color: "text-sky-600" },
  { icon: LogOut, label: "Sair", color: "text-rose-600" },
];

const TopMenu = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main Menu Bar */}
      <div className="bg-slate-800 text-white">
        <div className="flex items-center h-12 px-4">
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
                    <DropdownMenuItem key={subItem} className="cursor-pointer">
                      {subItem}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>
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
