import { DollarSign, ShoppingCart, Users, AlertCircle } from "lucide-react";
import TopMenu from "@/components/dashboard/TopMenu";
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import RecentSales from "@/components/dashboard/RecentSales";
import QuickActions from "@/components/dashboard/QuickActions";
import AlertsCard from "@/components/dashboard/AlertsCard";
import SalesChart from "@/components/dashboard/SalesChart";
import SellersRankingCard from "@/components/dashboard/SellersRankingCard";
import TopProductsChart from "@/components/dashboard/TopProductsChart";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const stats = useDashboardStats();

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <div className="pt-14">
        <Header />
        
        <main className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta! 👋</h2>
            <p className="text-muted-foreground">Aqui está o resumo das suas vendas de hoje.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </>
            ) : (
              <>
                <StatCard
                  title="Receita do Mês"
                  value={stats.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  change={`${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}% em relação ao mês passado`}
                  changeType={stats.revenueChangeType}
                  icon={DollarSign}
                  iconClassName="gradient-primary"
                />
                <StatCard
                  title="Vendas do Mês"
                  value={stats.salesCount.toString()}
                  change={`${stats.salesChange > 0 ? '+' : ''}${stats.salesChange.toFixed(1)}% em relação ao mês passado`}
                  changeType={stats.salesChangeType}
                  icon={ShoppingCart}
                  iconClassName="gradient-success"
                />
                <StatCard
                  title="Clientes Ativos"
                  value={stats.activeCustomers.toString()}
                  change={`+${stats.newCustomers} novos este mês`}
                  changeType="positive"
                  icon={Users}
                />
                <StatCard
                  title="A Receber"
                  value={stats.pendingReceivables.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  change={`${stats.pendingReceivablesCount} ${stats.pendingReceivablesCount === 1 ? 'pendência' : 'pendências'}`}
                  changeType={stats.pendingReceivablesCount > 0 ? "negative" : "positive"}
                  icon={AlertCircle}
                />
              </>
            )}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart />
            <SellersRankingCard />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProductsChart />
            <CashFlowChart />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentSales />
            </div>
            <div className="space-y-6">
              <AlertsCard />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
