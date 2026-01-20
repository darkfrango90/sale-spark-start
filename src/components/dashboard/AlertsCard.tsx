import { useMemo } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { useFinancial } from "@/contexts/FinancialContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, DollarSign, Clock, CheckCircle } from "lucide-react";
import { isAfter, isBefore, addDays } from "date-fns";

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  icon: React.ElementType;
  title: string;
  description: string;
}

const AlertsCard = () => {
  const { products } = useProducts();
  const { accountsReceivable, accountsPayable } = useFinancial();

  const alerts = useMemo(() => {
    const alertsList: Alert[] = [];
    const today = new Date();
    const nextWeek = addDays(today, 7);

    // Low stock products
    const lowStockProducts = products.filter(p => p.active && p.stock < p.minStock);
    if (lowStockProducts.length > 0) {
      alertsList.push({
        id: 'low-stock',
        type: 'warning',
        icon: Package,
        title: `${lowStockProducts.length} produto${lowStockProducts.length > 1 ? 's' : ''} com estoque baixo`,
        description: lowStockProducts.slice(0, 3).map(p => p.name).join(', '),
      });
    }

    // Overdue receivables (using createdAt as reference)
    const overdueReceivables = accountsReceivable.filter(ar => {
      if (ar.status === 'recebido') return false;
      return isBefore(ar.createdAt, today);
    });
    if (overdueReceivables.length > 0) {
      const total = overdueReceivables.reduce((sum, ar) => sum + ar.finalAmount, 0);
      alertsList.push({
        id: 'overdue-receivables',
        type: 'error',
        icon: DollarSign,
        title: `${overdueReceivables.length} recebível${overdueReceivables.length > 1 ? 'eis' : ''} pendente${overdueReceivables.length > 1 ? 's' : ''}`,
        description: `Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      });
    }

    // Upcoming payables
    const upcomingPayables = accountsPayable.filter(ap => {
      if (ap.status === 'pago') return false;
      return isAfter(ap.dueDate, today) && isBefore(ap.dueDate, nextWeek);
    });
    if (upcomingPayables.length > 0) {
      const total = upcomingPayables.reduce((sum, ap) => sum + ap.finalAmount, 0);
      alertsList.push({
        id: 'upcoming-payables',
        type: 'info',
        icon: Clock,
        title: `${upcomingPayables.length} conta${upcomingPayables.length > 1 ? 's' : ''} a pagar esta semana`,
        description: `Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      });
    }

    // Overdue payables
    const overduePayables = accountsPayable.filter(ap => {
      if (ap.status === 'pago') return false;
      return isBefore(ap.dueDate, today);
    });
    if (overduePayables.length > 0) {
      const total = overduePayables.reduce((sum, ap) => sum + ap.finalAmount, 0);
      alertsList.push({
        id: 'overdue-payables',
        type: 'error',
        icon: AlertTriangle,
        title: `${overduePayables.length} conta${overduePayables.length > 1 ? 's' : ''} vencida${overduePayables.length > 1 ? 's' : ''}`,
        description: `Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      });
    }

    return alertsList;
  }, [products, accountsReceivable, accountsPayable]);

  const getTypeStyles = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'warning':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'info':
        return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertas
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mb-2 text-success" />
            <p className="text-sm">Tudo em ordem!</p>
            <p className="text-xs">Nenhum alerta no momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getTypeStyles(alert.type)}`}
              >
                <alert.icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsCard;
