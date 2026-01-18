import { useState, useMemo } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopMenu from "@/components/dashboard/TopMenu";
import { useCustomers } from "@/contexts/CustomerContext";
import { useSales } from "@/contexts/SalesContext";
import { useFinancial } from "@/contexts/FinancialContext";
import { ArrowLeft, Printer, Filter, Users, UserPlus, AlertTriangle, Repeat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomersReport = () => {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { sales } = useSales();
  const { accountsReceivable } = useFinancial();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [barterFilter, setBarterFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");

  // Get unique cities and states
  const { cities, states } = useMemo(() => {
    const citiesSet = new Set(customers.map(c => c.city).filter((c): c is string => !!c));
    const statesSet = new Set(customers.map(c => c.state).filter((s): s is string => !!s));
    return { cities: [...citiesSet].sort(), states: [...statesSet].sort() };
  }, [customers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      if (typeFilter !== "all" && customer.type !== typeFilter) return false;
      if (statusFilter === "active" && !customer.active) return false;
      if (statusFilter === "inactive" && customer.active) return false;
      if (barterFilter === "yes" && !customer.hasBarter) return false;
      if (barterFilter === "no" && customer.hasBarter) return false;
      if (cityFilter !== "all" && customer.city !== cityFilter) return false;
      if (stateFilter !== "all" && customer.state !== stateFilter) return false;
      return true;
    });
  }, [customers, typeFilter, statusFilter, barterFilter, cityFilter, stateFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.active).length;
    const customersWithBarter = customers.filter(c => c.hasBarter).length;
    const totalBarterCredit = customers.reduce((sum, c) => sum + (c.barterCredit || 0), 0);
    
    return { totalCustomers, activeCustomers, customersWithBarter, totalBarterCredit };
  }, [customers]);

  // Customers by location
  const customersByLocation = useMemo(() => {
    const grouped: Record<string, { city: string; state: string; count: number }> = {};
    customers.forEach(customer => {
      const key = `${customer.city || 'Não informado'}-${customer.state || 'N/A'}`;
      if (!grouped[key]) {
        grouped[key] = { city: customer.city || 'Não informado', state: customer.state || 'N/A', count: 0 };
      }
      grouped[key].count += 1;
    });
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [customers]);

  // Customers ranking by purchases
  const customersRanking = useMemo(() => {
    const salesData: Record<string, { name: string; total: number; count: number }> = {};
    
    sales
      .filter(s => s.status !== 'excluido' && s.status !== 'cancelado')
      .forEach(sale => {
        if (!salesData[sale.customerId]) {
          salesData[sale.customerId] = { name: sale.customerName, total: 0, count: 0 };
        }
        salesData[sale.customerId].total += sale.total;
        salesData[sale.customerId].count += 1;
      });
    
    return Object.values(salesData).sort((a, b) => b.total - a.total);
  }, [sales]);

  // Customers with overdue accounts (older than 30 days)
  const customersOverdue = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const overdueMap: Record<string, { name: string; overdueAmount: number; overdueCount: number }> = {};
    
    accountsReceivable
      .filter(ar => ar.status === 'pendente' && new Date(ar.createdAt) < thirtyDaysAgo)
      .forEach(ar => {
        const sale = sales.find(s => s.id === ar.saleId);
        if (sale) {
          if (!overdueMap[sale.customerId]) {
            overdueMap[sale.customerId] = { name: sale.customerName, overdueAmount: 0, overdueCount: 0 };
          }
          overdueMap[sale.customerId].overdueAmount += ar.finalAmount;
          overdueMap[sale.customerId].overdueCount += 1;
        }
      });
    
    return Object.values(overdueMap).sort((a, b) => b.overdueAmount - a.overdueAmount);
  }, [accountsReceivable, sales]);

  // Customers with barter
  const customersWithBarter = useMemo(() => {
    return customers
      .filter(c => c.hasBarter)
      .map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        credit: c.barterCredit || 0,
        limit: c.barterLimit || 0,
        available: (c.barterLimit || 0) - (c.barterCredit || 0)
      }))
      .sort((a, b) => b.credit - a.credit);
  }, [customers]);

  // Customers by type
  const customersByType = useMemo(() => {
    const pf = customers.filter(c => c.type === 'fisica').length;
    const pj = customers.filter(c => c.type === 'juridica').length;
    return [
      { name: 'Pessoa Física', value: pf },
      { name: 'Pessoa Jurídica', value: pj }
    ];
  }, [customers]);

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setBarterFilter("all");
    setCityFilter("all");
    setStateFilter("all");
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
      <div className="pt-28 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Relatório de Clientes</h1>
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
                  <Label>Tipo</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="fisica">Pessoa Física</SelectItem>
                      <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Situação</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Permuta</Label>
                  <Select value={barterFilter} onValueChange={setBarterFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="yes">Com Permuta</SelectItem>
                      <SelectItem value="no">Sem Permuta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {cities.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {states.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
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
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clientes</p>
                    <p className="text-xl font-bold text-foreground">{metrics.totalCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserPlus className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                    <p className="text-xl font-bold text-foreground">{metrics.activeCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Repeat className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Com Permuta</p>
                    <p className="text-xl font-bold text-foreground">{metrics.customersWithBarter}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Permuta</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(metrics.totalBarterCredit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Lista Geral</TabsTrigger>
              <TabsTrigger value="ranking">Ranking Compras</TabsTrigger>
              <TabsTrigger value="location">Por Localização</TabsTrigger>
              <TabsTrigger value="overdue">Inadimplentes</TabsTrigger>
              <TabsTrigger value="barter">Com Permuta</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>CPF/CNPJ</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map(customer => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.code}</TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.type === 'fisica' ? 'PF' : 'PJ'}</TableCell>
                          <TableCell>{customer.cpfCnpj}</TableCell>
                          <TableCell>{customer.phone || customer.cellphone || '-'}</TableCell>
                          <TableCell>{customer.city ? `${customer.city}/${customer.state}` : '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${customer.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {customer.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ranking">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ranking de Clientes por Compras</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="text-center">Pedidos</TableHead>
                          <TableHead className="text-right">Total Comprado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customersRanking.slice(0, 15).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-bold">{index + 1}º</TableCell>
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
                    <CardTitle>Top 5 Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={customersRanking.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="total" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="location">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Clientes por Localização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cidade</TableHead>
                          <TableHead>UF</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customersByLocation.slice(0, 15).map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.city}</TableCell>
                            <TableCell>{item.state}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={customersByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#10b981" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="overdue">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Inadimplentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {customersOverdue.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum cliente inadimplente encontrado.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="text-center">Títulos Vencidos</TableHead>
                          <TableHead className="text-right">Valor em Atraso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customersOverdue.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.overdueCount}</TableCell>
                            <TableCell className="text-right text-red-600 font-medium">{formatCurrency(item.overdueAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="barter">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes com Permuta</CardTitle>
                </CardHeader>
                <CardContent>
                  {customersWithBarter.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum cliente com permuta encontrado.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="text-right">Crédito</TableHead>
                          <TableHead className="text-right">Limite</TableHead>
                          <TableHead className="text-right">Disponível</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customersWithBarter.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(item.credit)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.limit)}</TableCell>
                            <TableCell className={`text-right font-medium ${item.available < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {formatCurrency(item.available)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomersReport;
