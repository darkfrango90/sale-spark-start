import { Plus, FileText, UserPlus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "Nova Venda", variant: "default" as const },
  { icon: UserPlus, label: "Novo Cliente", variant: "outline" as const },
  { icon: Package, label: "Novo Produto", variant: "outline" as const },
  { icon: FileText, label: "Gerar Relatório", variant: "outline" as const },
];

const QuickActions = () => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 animate-fade-in">
      <h3 className="font-semibold text-foreground mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button 
            key={action.label} 
            variant={action.variant}
            className="h-auto py-4 flex flex-col gap-2"
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
