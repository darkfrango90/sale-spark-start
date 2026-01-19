import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TopMenu from "@/components/dashboard/TopMenu";
import { supabase } from "@/integrations/supabase/client";
import { useSales } from "@/contexts/SalesContext";
import { useProducts } from "@/contexts/ProductContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { ArrowLeft, Printer, Filter, ClipboardCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface OrderLoading {
  id: string;
  sale_id: string;
  sale_number: string;
  customer_name: string;
  operator_id: string;
  operator_name: string;
  loaded_at: string;
}

const COLORS = ['#10b981', '#f59e0b'];

const TickingReport = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { products } = useProducts();
  const { customers } = useCustomers();

  const [loadings, setLoadings] = useState<OrderLoading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchLoadings();
  }, []);

  const fetchLoadings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_loadings')
        .select('*');

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

  // Get all orders (pedidos) in the period
  const ordersInPeriod = useMemo(() => {
    return sales.filter(sale => {
      if (sale.type !== 'pedido') return false;
      const saleDate = new Date(sale.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      return saleDate >= start && saleDate <= end;
    });
  }, [sales, startDate, endDate]);

  // Combine with loading info
  const ordersWithStatus = useMemo(() => {
    return ordersInPeriod.map(sale => {
      const loading = loadings.find(l => l.sale_id === sale.id);
      const isLoaded = !!loading;
      
      const totalM3 = sale.items.reduce((sum, item) => {
        if (item.unit === 'M3' || item.unit === 'm³' || item.unit === 'M³') {
          return sum + item.quantity;
        }
        return sum;
      }, 0);

      const productNames = sale.items.map(item => item.productName).join(', ');
      const productIds = sale.items.map(item => item.productId);

      return {
        id: sale.id,
        number: sale.number,
        customerName: sale.customerName,
        customerId: sale.customerId,
        products: productNames,
        productIds,
        totalM3,
        createdAt: sale.createdAt,
        isLoaded,
        loadedAt: loading?.loaded_at,
        operatorName: loading?.operator_name
      };
    });
  }, [ordersInPeriod, loadings]);

  // Apply filters
  const filteredOrders = useMemo(() => {
    return ordersWithStatus.filter(order => {
      // Customer filter
      if (customerFilter !== "all" && order.customerId !== customerFilter) return false;
      
      // Product filter
      if (productFilter !== "all" && !order.productIds.includes(productFilter)) return false;
      
      // Status filter
      if (statusFilter === "loaded" && !order.isLoaded) return false;
      if (statusFilter === "pending" && order.isLoaded) return false;
      
      return true;
    });
  }, [ordersWithStatus, customerFilter, productFilter, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = ordersWithStatus.length;
    const loaded = ordersWithStatus.filter(o => o.isLoaded).length;
    const pending = total - loaded;
    const percentage = total > 0 ? (loaded / total) * 100 : 0;

    return { total, loaded, pending, percentage };
  }, [ordersWithStatus]);

  // Chart data
  const chartData = useMemo(() => [
    { name: 'Carregados', value: metrics.loaded, color: '#10b981' },
    { name: 'Pendentes', value: metrics.pending, color: '#f59e0b' }
  ], [metrics]);

  // Unique customers with orders in period
  const customersWithOrders = useMemo(() => {
    const customerIds = [...new Set(ordersInPeriod.map(o => o.customerId))];
    return customers.filter(c => customerIds.includes(c.id));
  }, [ordersInPeriod, customers]);

  // Unique products in orders
  const productsInOrders = useMemo(() => {
    const productIds = new Set<string>();
    ordersInPeriod.forEach(sale => {
      sale.items.forEach(item => productIds.add(item.productId));
    });
    return products.filter(p => productIds.has(p.id));
  }, [ordersInPeriod, products]);

  const clearFilters = () => {
    setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    setCustomerFilter("all");
    setProductFilter("all");
    setStatusFilter("all");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <div className="pt-16 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Relatório de Ticagem</h1>
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
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <div>
                  <Label>Cliente</Label>
                  <Select value={customerFilter} onValueChange={setCustomerFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {customersWithOrders.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Material</Label>
                  <Select value={productFilter} onValueChange={setProductFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {productsInOrders.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="loaded">Carregados</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pedidos</p>
                    <p className="text-xl font-bold text-foreground">{metrics.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carregados</p>
                    <p className="text-xl font-bold text-green-600">{metrics.loaded}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-xl font-bold text-orange-600">{metrics.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ClipboardCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">% Ticagem</p>
                    <p className="text-xl font-bold text-purple-600">{metrics.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Lista de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nº</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Material</TableHead>
                          <TableHead className="text-right">M³</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.slice(0, 10).map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-bold">{order.number}</TableCell>
                            <TableCell className="max-w-[120px] truncate">{order.customerName}</TableCell>
                            <TableCell className="max-w-[120px] truncate">{order.products}</TableCell>
                            <TableCell className="text-right">{order.totalM3.toFixed(2)}</TableCell>
                            <TableCell>
                              {order.isLoaded ? (
                                <Badge className="bg-green-500">Carregado</Badge>
                              ) : (
                                <Badge className="bg-orange-500">Pendente</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Qtd M³</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Pedido</TableHead>
                    <TableHead>Data Carreg.</TableHead>
                    <TableHead>Operador</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-bold text-primary">{order.number}</TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.products}</TableCell>
                      <TableCell className="text-right font-medium">{order.totalM3.toFixed(2)}</TableCell>
                      <TableCell>
                        {order.isLoaded ? (
                          <Badge className="bg-green-500">Carregado</Badge>
                        ) : (
                          <Badge className="bg-orange-500">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {order.loadedAt 
                          ? format(parseISO(order.loadedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{order.operatorName || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TickingReport;
