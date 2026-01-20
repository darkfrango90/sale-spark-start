import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useSales } from "@/contexts/SalesContext";
import { CreditCard } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(142 76% 50%)",
  "hsl(280 60% 55%)",
  "hsl(200 80% 50%)",
];

const PaymentMethodsChart = () => {
  const { sales, loading } = useSales();

  const { chartData, chartConfig } = useMemo(() => {
    const activeSales = sales.filter(s => s.status !== 'cancelado' && s.type === 'pedido');
    
    const methodTotals = activeSales.reduce((acc, sale) => {
      const method = sale.paymentMethodName || 'Não informado';
      if (!acc[method]) {
        acc[method] = { total: 0, count: 0 };
      }
      acc[method].total += sale.total;
      acc[method].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const data = Object.entries(methodTotals)
      .map(([name, { total, count }], index) => ({
        name,
        value: total,
        count,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const config = data.reduce((acc, item) => {
      acc[item.name] = {
        label: item.name,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig);

    return { chartData: data, chartConfig: config };
  }, [sales]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Formas de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CreditCard className="h-5 w-5 text-primary" />
            Formas de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            Nenhuma venda registrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CreditCard className="h-5 w-5 text-primary" />
          Formas de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{item.payload.name}</span>
                        <span className="font-semibold">
                          {Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.payload.count} vendas ({((Number(value) / total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value, entry) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsChart;
