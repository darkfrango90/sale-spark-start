import { useState, useMemo } from "react";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopMenu from "@/components/dashboard/TopMenu";
import { useSales } from "@/contexts/SalesContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useProducts } from "@/contexts/ProductContext";
import { useSettings } from "@/contexts/SettingsContext";
import { ArrowLeft, Printer, FileText, Filter, TrendingUp, ShoppingCart, Users, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const SalesReport = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { paymentMethods } = useSettings();

  const today = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(today), 'yyyy-MM-dd'));
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("all");

  // Get unique sellers
  const uniqueSellers = useMemo(() => {
    const sellers = sales
      .map(s => s.sellerName)
      .filter((s): s is string => !!s);
    return [...new Set(sellers)];
  }, [sales]);

  // Filter sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Date filter
      const saleDate = new Date(sale.createdAt);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      end.setHours(23, 59, 59, 999);
      
      if (!isWithinInterval(saleDate, { start, end })) return false;
      
      // Other filters
      if (customerFilter !== "all" && sale.customerId !== customerFilter) return false;
      if (paymentMethodFilter !== "all" && sale.paymentMethodId !== paymentMethodFilter) return false;
      if (paymentTypeFilter !== "all" && sale.paymentType !== paymentTypeFilter) return false;
      if (statusFilter !== "all" && sale.status !== statusFilter) return false;
      if (typeFilter !== "all" && sale.type !== typeFilter) return false;
      if (sellerFilter !== "all" && sale.sellerName !== sellerFilter) return false;
      
      return true;
    });
  }, [sales, startDate, endDate, customerFilter, paymentMethodFilter, paymentTypeFilter, statusFilter, typeFilter, sellerFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeSales = filteredSales.filter(s => s.status !== 'excluido' && s.status !== 'cancelado');
    const totalSales = activeSales.reduce((sum, s) => sum + s.total, 0);
    const totalOrders = activeSales.length;
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalProducts = activeSales.reduce((sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    return { totalSales, totalOrders, avgTicket, totalProducts };
  }, [filteredSales]);

  // Sales by customer
  const salesByCustomer = useMemo(() => {
    const grouped: Record<string, { name: string; total: number; count: number }> = {};
    filteredSales
      .filter(s => s.status !== 'excluido' && s.status !== 'cancelado')
      .forEach(sale => {
        if (!grouped[sale.customerId]) {
          grouped[sale.customerId] = { name: sale.customerName, total: 0, count: 0 };
        }
        grouped[sale.customerId].total += sale.total;
        grouped[sale.customerId].count += 1;
      });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // Sales by product
  const salesByProduct = useMemo(() => {
    const grouped: Record<string, { name: string; quantity: number; total: number }> = {};
    filteredSales
      .filter(s => s.status !== 'excluido' && s.status !== 'cancelado')
      .forEach(sale => {
        sale.items.forEach(item => {
          if (!grouped[item.productId]) {
            grouped[item.productId] = { name: item.productName, quantity: 0, total: 0 };
          }
          grouped[item.productId].quantity += item.quantity;
          grouped[item.productId].total += item.total;
        });
      });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // Sales by payment method
  const salesByPaymentMethod = useMemo(() => {
    const grouped: Record<string, { name: string; total: number; count: number }> = {};
    filteredSales
      .filter(s => s.status !== 'excluido' && s.status !== 'cancelado')
      .forEach(sale => {
        const methodName = sale.paymentMethodName || 'Não informado';
        if (!grouped[methodName]) {
          grouped[methodName] = { name: methodName, total: 0, count: 0 };
        }
        grouped[methodName].total += sale.total;
        grouped[methodName].count += 1;
      });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // Sales by payment type
  const salesByPaymentType = useMemo(() => {
    const grouped: Record<string, { name: string; total: number; count: number }> = {};
    filteredSales
      .filter(s => s.status !== 'excluido' && s.status !== 'cancelado')
      .forEach(sale => {
        const typeName = sale.paymentType === 'vista' ? 'À Vista' : sale.paymentType === 'prazo' ? 'A Prazo' : 'Não informado';
        if (!grouped[typeName]) {
          grouped[typeName] = { name: typeName, total: 0, count: 0 };
        }
        grouped[typeName].total += sale.total;
        grouped[typeName].count += 1;
      });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // Sales by seller
  const salesBySeller = useMemo(() => {
    const grouped: Record<string, { name: string; total: number; count: number }> = {};
    filteredSales
      .filter(s => s.status !== 'excluido' && s.status !== 'cancelado')
      .forEach(sale => {
        const sellerName = sale.sellerName || 'Não informado';
        if (!grouped[sellerName]) {
          grouped[sellerName] = { name: sellerName, total: 0, count: 0 };
        }
        grouped[sellerName].total += sale.total;
        grouped[sellerName].count += 1;
      });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const clearFilters = () => {
    setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
    setCustomerFilter("all");
    setPaymentMethodFilter("all");
    setPaymentTypeFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setSellerFilter("all");
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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
              <h1 className="text-2xl font-bold text-foreground">Relatório de Vendas</h1>
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div>
                  <Label>Data Inicial</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>Data Final</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div>
                  <Label>Cliente</Label>
                  <Select value={customerFilter} onValueChange={setCustomerFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Condição Pagto</Label>
                  <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {paymentMethods.filter(p => p.active).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Forma Pagto</Label>
                  <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="vista">À Vista</SelectItem>
                      <SelectItem value="prazo">A Prazo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pedido">Pedido</SelectItem>
                      <SelectItem value="orcamento">Orçamento</SelectItem>
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
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vendas</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(metrics.totalSales)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Qtd. Pedidos</p>
                    <p className="text-xl font-bold text-foreground">{metrics.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket Médio</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(metrics.avgTicket)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Produtos Vendidos</p>
                    <p className="text-xl font-bold text-foreground">{metrics.totalProducts.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Detalhado</TabsTrigger>
              <TabsTrigger value="byCustomer">Por Cliente</TabsTrigger>
              <TabsTrigger value="byProduct">Por Produto</TabsTrigger>
              <TabsTrigger value="byPayment">Por Condição</TabsTrigger>
              <TabsTrigger value="byType">Por Forma</TabsTrigger>
              <TabsTrigger value="bySeller">Por Vendedor</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas Detalhadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Condição</TableHead>
                          <TableHead>Forma</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSales.map(sale => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.number}</TableCell>
                            <TableCell>{format(new Date(sale.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                            <TableCell>{sale.type === 'pedido' ? 'Pedido' : 'Orçamento'}</TableCell>
                            <TableCell>{sale.customerName}</TableCell>
                            <TableCell>{sale.paymentMethodName || '-'}</TableCell>
                            <TableCell>{sale.paymentType === 'vista' ? 'À Vista' : sale.paymentType === 'prazo' ? 'A Prazo' : '-'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                sale.status === 'finalizado' ? 'bg-green-100 text-green-700' :
                                sale.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                                sale.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(sale.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <div className="text-right">
                      <span className="text-muted-foreground mr-4">Total:</span>
                      <span className="text-xl font-bold">{formatCurrency(metrics.totalSales)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="byCustomer">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ranking de Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="text-center">Pedidos</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesByCustomer.slice(0, 10).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.count}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Gráfico de Vendas por Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesByCustomer.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="total" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="byProduct">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Produtos Mais Vendidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-center">Quantidade</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesByProduct.slice(0, 10).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.quantity.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Gráfico de Vendas por Produto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesByProduct.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="total" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="byPayment">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas por Condição de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Condição</TableHead>
                          <TableHead className="text-center">Pedidos</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesByPaymentMethod.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.count}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Condição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={salesByPaymentMethod}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="total"
                        >
                          {salesByPaymentMethod.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="byType">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas por Forma de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Forma</TableHead>
                          <TableHead className="text-center">Pedidos</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesByPaymentType.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.count}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Forma</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={salesByPaymentType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="total"
                        >
                          {salesByPaymentType.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bySeller">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas por Vendedor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendedor</TableHead>
                          <TableHead className="text-center">Pedidos</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesBySeller.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.count}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Gráfico de Vendas por Vendedor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesBySeller.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="total" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
