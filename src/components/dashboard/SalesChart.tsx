import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useSales } from "@/contexts/SalesContext";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  total: {
    label: "Vendas",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const SalesChart = () => {
  const { sales, loading } = useSales();

  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthSales = sales.filter(sale => {
        if (sale.status === 'cancelado' || sale.type !== 'pedido') return false;
        const saleDate = new Date(sale.createdAt);
        return isWithinInterval(saleDate, { start: monthStart, end: monthEnd });
      });
      
      const total = monthSales.reduce((sum, sale) => sum + sale.total, 0);
      const count = monthSales.length;
      
      months.push({
        month: format(monthDate, "MMM", { locale: ptBR }),
        fullMonth: format(monthDate, "MMMM 'de' yyyy", { locale: ptBR }),
        total,
        count,
      });
    }
    
    return months;
  }, [sales]);

  const totalPeriod = chartData.reduce((sum, m) => sum + m.total, 0);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Vendas Mensais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Vendas Mensais
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">
              {totalPeriod.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent 
                    formatter={(value, name, item) => (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground capitalize">{item.payload.fullMonth}</span>
                        <span className="font-semibold">
                          {Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.payload.count} vendas</span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
