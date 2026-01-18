import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TopMenu from "@/components/dashboard/TopMenu";
import { supabase } from "@/integrations/supabase/client";
import { useSales } from "@/contexts/SalesContext";
import { ArrowLeft, Printer, Filter, Truck, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderLoading {
  id: string;
  sale_id: string;
  sale_number: string;
  customer_name: string;
  operator_id: string;
  operator_name: string;
  loaded_at: string;
  created_at: string;
}

const LoadedOrders = () => {
  const navigate = useNavigate();
  const { sales } = useSales();

  const [loadings, setLoadings] = useState<OrderLoading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchLoadings();
  }, [startDate, endDate]);

  const fetchLoadings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_loadings')
        .select('*')
        .gte('loaded_at', `${startDate}T00:00:00`)
        .lte('loaded_at', `${endDate}T23:59:59`)
        .order('loaded_at', { ascending: false });

      if (error) {
        console.error("Error fetching loadings:", error);
        return;
      }

      setLoadings(data || []);
    } catch (error) {
      console.error("Error fetching loadings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enrich loadings with sale details
  const enrichedLoadings = useMemo(() => {
    return loadings.map(loading => {
      const sale = sales.find(s => s.id === loading.sale_id);
      const totalM3 = sale?.items.reduce((sum, item) => {
        if (item.unit === 'M3' || item.unit === 'm³' || item.unit === 'M³') {
          return sum + item.quantity;
        }
        return sum;
      }, 0) || 0;
      const products = sale?.items.map(item => item.productName).join(', ') || '-';

      return {
        ...loading,
        totalM3,
        products
      };
    });
  }, [loadings, sales]);

  const clearFilters = () => {
    setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <div className="pt-28 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Pedidos Carregados</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Data Inicial</Label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                  />
                </div>
                <div>
                  <Label>Data Final</Label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Carregados</p>
                    <p className="text-2xl font-bold text-foreground">{enrichedLoadings.length}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total M³</p>
                  <p className="text-2xl font-bold text-primary">
                    {enrichedLoadings.reduce((sum, l) => sum + l.totalM3, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Carregamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : enrichedLoadings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhum carregamento no período</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Qtd M³</TableHead>
                      <TableHead>Data Carreg.</TableHead>
                      <TableHead>Operador</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedLoadings.map(loading => (
                      <TableRow key={loading.id}>
                        <TableCell className="font-bold text-primary">{loading.sale_number}</TableCell>
                        <TableCell className="font-medium">{loading.customer_name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{loading.products}</TableCell>
                        <TableCell className="text-right font-medium">{loading.totalM3.toFixed(2)}</TableCell>
                        <TableCell>
                          {format(parseISO(loading.loaded_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{loading.operator_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoadedOrders;
