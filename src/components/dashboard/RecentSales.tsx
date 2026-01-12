import { ArrowUpRight } from "lucide-react";

interface Sale {
  id: string;
  customer: string;
  email: string;
  amount: string;
  status: "completed" | "pending" | "processing";
}

const recentSales: Sale[] = [
  { id: "1", customer: "Maria Silva", email: "maria@email.com", amount: "R$ 1.250,00", status: "completed" },
  { id: "2", customer: "João Santos", email: "joao@email.com", amount: "R$ 890,00", status: "processing" },
  { id: "3", customer: "Ana Costa", email: "ana@email.com", amount: "R$ 2.100,00", status: "completed" },
  { id: "4", customer: "Pedro Oliveira", email: "pedro@email.com", amount: "R$ 560,00", status: "pending" },
  { id: "5", customer: "Carla Ferreira", email: "carla@email.com", amount: "R$ 1.780,00", status: "completed" },
];

const statusStyles = {
  completed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  processing: "bg-primary/10 text-primary",
};

const statusLabels = {
  completed: "Concluída",
  pending: "Pendente",
  processing: "Processando",
};

const RecentSales = () => {
  return (
    <div className="bg-card rounded-lg border border-border animate-fade-in">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Vendas Recentes</h3>
          <p className="text-sm text-muted-foreground">Últimas transações realizadas</p>
        </div>
        <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
          Ver todas
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="divide-y divide-border">
        {recentSales.map((sale) => (
          <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {sale.customer.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{sale.customer}</p>
                <p className="text-sm text-muted-foreground">{sale.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[sale.status]}`}>
                {statusLabels[sale.status]}
              </span>
              <span className="font-semibold text-foreground">{sale.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSales;
