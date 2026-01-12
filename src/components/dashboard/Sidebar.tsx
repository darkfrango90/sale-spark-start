import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  Receipt,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ShoppingCart, label: "Vendas" },
  { icon: Users, label: "Clientes" },
  { icon: Package, label: "Produtos" },
  { icon: Receipt, label: "Pedidos" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: TrendingUp, label: "Análises" },
  { icon: Settings, label: "Configurações" },
];

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col animate-slide-in-left">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">VendaMax</h1>
            <p className="text-xs text-muted-foreground">Sistema de Vendas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              item.active 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="bg-accent/50 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground">Precisa de ajuda?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Acesse nossa documentação
          </p>
          <button className="mt-3 text-sm font-medium text-primary hover:underline">
            Ver tutoriais →
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
