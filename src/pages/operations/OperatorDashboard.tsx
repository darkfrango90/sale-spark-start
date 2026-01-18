import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useSales } from "@/contexts/SalesContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Truck, Package, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { sales, refreshSales, updateSaleStatus } = useSales();

  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter pending orders (pedidos with status pendente)
  const pendingOrders = useMemo(() => {
    return sales.filter(sale => 
      sale.type === 'pedido' && 
      sale.status === 'pendente'
    ).map(sale => {
      // Calculate total M³ from items
      const totalM3 = sale.items.reduce((sum, item) => {
        if (item.unit === 'M3' || item.unit === 'm³' || item.unit === 'M³') {
          return sum + item.quantity;
        }
        return sum;
      }, 0);

      // Get product names
      const products = sale.items.map(item => item.productName).join(', ');

      return {
        id: sale.id,
        number: sale.number,
        customerName: sale.customerName,
        products,
        totalM3,
        createdAt: sale.createdAt
      };
    });
  }, [sales]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOrderClick = (saleId: string) => {
    setSelectedSale(saleId);
  };

  const handleConfirmLoading = async () => {
    if (!selectedSale || !user) return;

    setIsLoading(true);
    try {
      const sale = sales.find(s => s.id === selectedSale);
      if (!sale) {
        toast.error("Pedido não encontrado");
        return;
      }

      // Register loading in database
      const { error } = await supabase.from('order_loadings').insert({
        sale_id: selectedSale,
        sale_number: sale.number,
        customer_name: sale.customerName,
        operator_id: user.id,
        operator_name: user.name,
        loaded_at: new Date().toISOString()
      });

      if (error) {
        console.error("Error registering loading:", error);
        toast.error("Erro ao registrar carregamento");
        return;
      }

      // Update sale status to 'finalizado'
      await updateSaleStatus(selectedSale, 'finalizado');
      
      toast.success(`Pedido ${sale.number} carregado com sucesso!`);
      setSelectedSale(null);
      await refreshSales();
    } catch (error) {
      console.error("Error confirming loading:", error);
      toast.error("Erro ao confirmar carregamento");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSaleData = pendingOrders.find(o => o.id === selectedSale);

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header for Operator */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800 text-white">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Painel do Operador</h1>
              <p className="text-xs text-slate-400">Controle de Carregamento</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-slate-400">Operador</p>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-slate-700">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-20 px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Pedidos Pendentes</h2>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                {pendingOrders.length}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refreshSales()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clique em um pedido para confirmar carregamento</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhum pedido pendente</p>
                  <p className="text-sm">Todos os pedidos foram carregados</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Nº Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right w-[120px]">Qtd M³</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map(order => (
                      <TableRow 
                        key={order.id} 
                        className="cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <TableCell className="font-bold text-primary">{order.number}</TableCell>
                        <TableCell className="font-medium">{order.customerName}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{order.products}</TableCell>
                        <TableCell className="text-right font-bold text-lg">{order.totalM3.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Confirmar Carregamento
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>O pedido foi carregado?</p>
              {selectedSaleData && (
                <div className="bg-muted p-4 rounded-lg mt-4 space-y-1">
                  <p><strong>Pedido:</strong> {selectedSaleData.number}</p>
                  <p><strong>Cliente:</strong> {selectedSaleData.customerName}</p>
                  <p><strong>Material:</strong> {selectedSaleData.products}</p>
                  <p><strong>Quantidade:</strong> {selectedSaleData.totalM3.toFixed(2)} M³</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLoading} disabled={isLoading}>
              {isLoading ? "Registrando..." : "Sim, foi carregado"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OperatorDashboard;
