import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import TopMenu from "@/components/dashboard/TopMenu";
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import RecentSales from "@/components/dashboard/RecentSales";
import QuickActions from "@/components/dashboard/QuickActions";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <div className="pt-[104px]">
        <Header />
        
        <main className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta! 👋</h2>
            <p className="text-muted-foreground">Aqui está o resumo das suas vendas de hoje.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Receita Total"
              value="R$ 45.231,89"
              change="+20.1% em relação ao mês passado"
              changeType="positive"
              icon={DollarSign}
              iconClassName="gradient-primary"
            />
            <StatCard
              title="Vendas"
              value="573"
              change="+15% em relação ao mês passado"
              changeType="positive"
              icon={ShoppingCart}
              iconClassName="gradient-success"
            />
            <StatCard
              title="Clientes Ativos"
              value="2.350"
              change="+180 novos clientes"
              changeType="positive"
              icon={Users}
            />
            <StatCard
              title="Taxa de Conversão"
              value="3.2%"
              change="-0.4% em relação ao mês passado"
              changeType="negative"
              icon={TrendingUp}
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentSales />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
