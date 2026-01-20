import { useSales } from "@/contexts/SalesContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusStyles: Record<string, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  confirmado: "bg-primary/10 text-primary border-primary/20",
  entregue: "bg-success/10 text-success border-success/20",
  cancelado: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const RecentSales = () => {
  const { sales, loading } = useSales();
  const navigate = useNavigate();

  const recentSales = sales
    .filter(s => s.type === 'pedido')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Vendas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Vendas Recentes
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => navigate('/vendas/lista')}
          >
            Ver todas
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ShoppingCart className="h-10 w-10 mb-2" />
            <p className="text-sm">Nenhuma venda registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate('/vendas/lista')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {sale.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{sale.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      Pedido #{sale.number} • {format(new Date(sale.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="outline" className={statusStyles[sale.status] || ''}>
                    {statusLabels[sale.status] || sale.status}
                  </Badge>
                  <span className="font-semibold text-sm">
                    {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;
