import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconClassName?: string;
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  iconClassName 
}: StatCardProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-card border border-border animate-fade-in hover:shadow-elevated transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={cn(
              "text-sm font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          iconClassName || "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            iconClassName ? "text-primary-foreground" : "text-primary"
          )} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
