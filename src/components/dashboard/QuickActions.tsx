import { Plus, FileText, UserPlus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const actions = [
  { icon: Plus, label: "Nova Venda", variant: "default" as const, path: "/vendas/nova" },
  { icon: UserPlus, label: "Novo Cliente", variant: "outline" as const, path: "/clientes" },
  { icon: FileText, label: "Relatórios", variant: "outline" as const, path: "/relatorios" },
  { icon: Truck, label: "Operação", variant: "outline" as const, path: "/operacao/operador" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button 
              key={action.label} 
              variant={action.variant}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
