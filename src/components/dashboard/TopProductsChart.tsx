import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useSales } from "@/contexts/SalesContext";
import { Package } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(217 91% 60%)",
  "hsl(217 91% 70%)",
  "hsl(217 91% 80%)",
  "hsl(217 91% 85%)",
];

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const TopProductsChart = () => {
  const { sales, loading } = useSales();

  const chartData = useMemo(() => {
    const activeSales = sales.filter(s => s.status !== 'cancelado' && s.type === 'pedido');
    
    const productTotals: Record<string, { name: string; total: number; quantity: number }> = {};
    
    activeSales.forEach(sale => {
      sale.items?.forEach(item => {
        const key = item.productId;
        if (!productTotals[key]) {
          productTotals[key] = { name: item.productName, total: 0, quantity: 0 };
        }
        productTotals[key].total += item.total;
        productTotals[key].quantity += item.quantity;
      });
    });

    return Object.values(productTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        shortName: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
        fill: COLORS[index],
      }));
  }, [sales]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top 5 Produtos
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
            <Package className="h-5 w-5 text-primary" />
            Top 5 Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            Nenhum produto vendido
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Package className="h-5 w-5 text-primary" />
          Top 5 Produtos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis 
                type="number" 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                type="category" 
                dataKey="shortName" 
                tickLine={false} 
                axisLine={false}
                width={80}
                className="text-xs fill-muted-foreground"
              />
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
                          {item.payload.quantity.toFixed(2)} unidades
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopProductsChart;
