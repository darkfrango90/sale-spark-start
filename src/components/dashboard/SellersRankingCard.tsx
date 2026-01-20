import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/contexts/SalesContext";
import { Users } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface SellerData {
  name: string;
  total: number;
  count: number;
  percentage: number;
}

const SellersRankingCard = () => {
  const { sales, loading } = useSales();

  const sellersData = useMemo((): SellerData[] => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthSales = sales.filter(s => 
      s.status !== 'cancelado' && 
      s.type === 'pedido' &&
      s.sellerName &&
      isWithinInterval(s.createdAt, { start: monthStart, end: monthEnd })
    );

    const sellerTotals = monthSales.reduce((acc, sale) => {
      const seller = sale.sellerName!;
      if (!acc[seller]) {
        acc[seller] = { total: 0, count: 0 };
      }
      acc[seller].total += sale.total;
      acc[seller].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const grandTotal = Object.values(sellerTotals)
      .reduce((sum, { total }) => sum + total, 0);

    return Object.entries(sellerTotals)
      .map(([name, { total, count }]) => ({
        name,
        total,
        count,
        percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [sales]);

  const getMedal = (position: number) => {
    if (position === 0) return "🥇";
    if (position === 1) return "🥈";
    if (position === 2) return "🥉";
    return `${position + 1}.`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vendedores do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (sellersData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vendedores do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma venda registrada este mês
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Vendedores do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sellersData.slice(0, 5).map((seller, index) => (
          <div key={seller.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium w-8">
                  {getMedal(index)}
                </span>
                <span className="font-medium truncate max-w-[120px]">
                  {seller.name}
                </span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {seller.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {seller.count} {seller.count === 1 ? 'venda' : 'vendas'}
                </p>
              </div>
            </div>
            <Progress value={seller.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SellersRankingCard;
