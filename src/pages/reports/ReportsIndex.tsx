import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TopMenu from "@/components/dashboard/TopMenu";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  Wallet, 
  Truck,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useSales } from "@/contexts/SalesContext";
import { useProducts } from "@/contexts/ProductContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useFinancial } from "@/contexts/FinancialContext";
import { useSuppliers } from "@/contexts/SupplierContext";
import { useMemo } from "react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const ReportsIndex = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { accountsReceivable, accountsPayable } = useFinancial();
  const { suppliers } = useSuppliers();

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Quick stats
  const stats = useMemo(() => {
    // Sales this month
    const monthlySales = sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return s.status !== 'excluido' && s.status !== 'cancelado' &&
             isWithinInterval(saleDate, { start: monthStart, end: monthEnd });
    });
    const monthlySalesTotal = monthlySales.reduce((sum, s) => sum + s.total, 0);
    
    // Critical stock
    const criticalStock = products.filter(p => p.stock < (p.minStock || 0)).length;
    
    // Active customers
    const activeCustomers = customers.filter(c => c.active).length;
    
    // Financial
    const totalReceivable = accountsReceivable
      .filter(ar => ar.status === 'pendente')
      .reduce((sum, ar) => sum + ar.finalAmount, 0);
    const totalPayable = accountsPayable
      .filter(ap => ap.status === 'pendente')
      .reduce((sum, ap) => sum + ap.finalAmount, 0);
    
    // Active suppliers
    const activeSuppliers = suppliers.filter(s => s.active).length;
    
    return {
      monthlySalesTotal,
      monthlySalesCount: monthlySales.length,
      criticalStock,
      activeCustomers,
      totalReceivable,
      totalPayable,
      activeSuppliers
    };
  }, [sales, products, customers, accountsReceivable, accountsPayable, suppliers, monthStart, monthEnd]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const reportCards = [
    {
      title: "Relatório de Vendas",
      description: "Análise completa de vendas por período, cliente, produto, condição e forma de pagamento",
      icon: ShoppingCart,
      path: "/relatorios/vendas",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      stats: [
        { label: "Vendas no Mês", value: formatCurrency(stats.monthlySalesTotal) },
        { label: "Qtd. Pedidos", value: stats.monthlySalesCount.toString() }
      ]
    },
    {
      title: "Relatório de Estoque",
      description: "Posição de estoque, produtos críticos, margem de lucro e curva ABC",
      icon: Package,
      path: "/relatorios/estoque",
      color: "text-green-600",
      bgColor: "bg-green-100",
      stats: [
        { label: "Produtos", value: products.length.toString() },
        { label: "Estoque Crítico", value: stats.criticalStock.toString(), alert: stats.criticalStock > 0 }
      ]
    },
    {
      title: "Relatório de Clientes",
      description: "Lista de clientes, ranking de compras, inadimplentes e clientes com permuta",
      icon: Users,
      path: "/relatorios/clientes",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      stats: [
        { label: "Clientes Ativos", value: stats.activeCustomers.toString() },
        { label: "Total", value: customers.length.toString() }
      ]
    },
    {
      title: "Relatório Financeiro",
      description: "Fluxo de caixa, contas a receber, contas a pagar, vencidos e a vencer",
      icon: Wallet,
      path: "/relatorios/financeiro",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      stats: [
        { label: "A Receber", value: formatCurrency(stats.totalReceivable) },
        { label: "A Pagar", value: formatCurrency(stats.totalPayable) }
      ]
    },
    {
      title: "Relatório de Fornecedores",
      description: "Lista de fornecedores, ranking de pagamentos e contas a pagar por fornecedor",
      icon: Truck,
      path: "/relatorios/fornecedores",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      stats: [
        { label: "Fornecedores Ativos", value: stats.activeSuppliers.toString() },
        { label: "Total", value: suppliers.length.toString() }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <div className="pt-16 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-2">
              Acesse os relatórios completos do sistema com filtros avançados e gráficos
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendas do Mês</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(stats.monthlySalesTotal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Previsto</p>
                    <p className={`text-lg font-bold ${stats.totalReceivable - stats.totalPayable >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.totalReceivable - stats.totalPayable)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                    <p className="text-lg font-bold text-foreground">{stats.activeCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stats.criticalStock > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                    <AlertTriangle className={`h-5 w-5 ${stats.criticalStock > 0 ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estoque Crítico</p>
                    <p className={`text-lg font-bold ${stats.criticalStock > 0 ? 'text-red-600' : 'text-foreground'}`}>
                      {stats.criticalStock} produtos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportCards.map((report) => (
              <Card 
                key={report.path} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(report.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 ${report.bgColor} rounded-lg`}>
                      <report.icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <CardTitle className="mt-4">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {report.stats.map((stat, index) => (
                      <div key={index} className="flex-1">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`text-lg font-semibold ${stat.alert ? 'text-red-600' : 'text-foreground'}`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsIndex;
