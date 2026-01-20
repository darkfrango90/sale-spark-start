import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useFinancial } from "@/contexts/FinancialContext";
import { format, addDays, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wallet } from "lucide-react";

const chartConfig = {
  receivable: {
    label: "A Receber",
    color: "hsl(var(--success))",
  },
  payable: {
    label: "A Pagar",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

const CashFlowChart = () => {
  const { accountsReceivable, accountsPayable, loadingReceivables, loadingPayables } = useFinancial();

  const chartData = useMemo(() => {
    const today = new Date();
    const days = [];
    
    for (let i = -7; i <= 7; i++) {
      const date = i < 0 ? subDays(today, Math.abs(i)) : addDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      // Use createdAt for receivables
      const receivable = accountsReceivable
        .filter(ar => {
          if (ar.status === 'recebido') return false;
          return isWithinInterval(ar.createdAt, { start: dayStart, end: dayEnd });
        })
        .reduce((sum, ar) => sum + ar.finalAmount, 0);
      
      // Use dueDate for payables
      const payable = accountsPayable
        .filter(ap => {
          if (ap.status === 'pago') return false;
          return isWithinInterval(ap.dueDate, { start: dayStart, end: dayEnd });
        })
        .reduce((sum, ap) => sum + ap.finalAmount, 0);
      
      days.push({
        date: format(date, "dd/MM", { locale: ptBR }),
        fullDate: format(date, "dd 'de' MMMM", { locale: ptBR }),
        receivable,
        payable: -payable,
        isToday: i === 0,
      });
    }
    
    return days;
  }, [accountsReceivable, accountsPayable]);

  const loading = loadingReceivables || loadingPayables;

  const totalReceivable = chartData.reduce((sum, d) => sum + d.receivable, 0);
  const totalPayable = Math.abs(chartData.reduce((sum, d) => sum + d.payable, 0));

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Fluxo de Caixa
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Wallet className="h-5 w-5 text-primary" />
            Fluxo de Caixa (15 dias)
          </CardTitle>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-success" />
              Receber: {totalReceivable.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-destructive" />
              Pagar: {totalPayable.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => {
                  const absValue = Math.abs(value);
                  return absValue >= 1000 ? `${(absValue / 1000).toFixed(0)}k` : absValue.toString();
                }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => {
                      const absValue = Math.abs(Number(value));
                      const isReceivable = name === 'receivable';
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">{item.payload.fullDate}</span>
                          <span className={`font-semibold ${isReceivable ? 'text-success' : 'text-destructive'}`}>
                            {isReceivable ? '+' : '-'}{absValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {isReceivable ? 'A receber' : 'A pagar'}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar dataKey="receivable" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="payable" fill="hsl(var(--destructive))" radius={[0, 0, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
