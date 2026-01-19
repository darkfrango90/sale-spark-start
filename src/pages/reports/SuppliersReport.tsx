import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopMenu from "@/components/dashboard/TopMenu";
import { useSuppliers } from "@/contexts/SupplierContext";
import { useFinancial } from "@/contexts/FinancialContext";
import { ArrowLeft, Printer, Filter, Truck, TrendingDown, DollarSign, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const SuppliersReport = () => {
  const navigate = useNavigate();
  const { suppliers } = useSuppliers();
  const { accountsPayable } = useFinancial();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");

  // Get unique cities and states
  const { cities, states } = useMemo(() => {
    const citiesSet = new Set(suppliers.map(s => s.city).filter((c): c is string => !!c));
    const statesSet = new Set(suppliers.map(s => s.state).filter((s): s is string => !!s));
    return { cities: [...citiesSet].sort(), states: [...statesSet].sort() };
  }, [suppliers]);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      if (typeFilter !== "all" && supplier.type !== typeFilter) return false;
      if (statusFilter === "active" && !supplier.active) return false;
      if (statusFilter === "inactive" && supplier.active) return false;
      if (cityFilter !== "all" && supplier.city !== cityFilter) return false;
      if (stateFilter !== "all" && supplier.state !== stateFilter) return false;
      return true;
    });
  }, [suppliers, typeFilter, statusFilter, cityFilter, stateFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.active).length;
    const totalPayable = accountsPayable
      .filter(ap => ap.status === 'pendente')
      .reduce((sum, ap) => sum + ap.finalAmount, 0);
    const totalPaid = accountsPayable
      .filter(ap => ap.status === 'pago')
      .reduce((sum, ap) => sum + ap.finalAmount, 0);
    
    return { totalSuppliers, activeSuppliers, totalPayable, totalPaid };
  }, [suppliers, accountsPayable]);

  // Suppliers by location
  const suppliersByLocation = useMemo(() => {
    const grouped: Record<string, { city: string; state: string; count: number }> = {};
    suppliers.forEach(supplier => {
      const key = `${supplier.city || 'Não informado'}-${supplier.state || 'N/A'}`;
      if (!grouped[key]) {
        grouped[key] = { city: supplier.city || 'Não informado', state: supplier.state || 'N/A', count: 0 };
      }
      grouped[key].count += 1;
    });
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [suppliers]);

  // Suppliers ranking by payments
  const suppliersRanking = useMemo(() => {
    const paymentsData: Record<string, { name: string; total: number; count: number }> = {};
    
    accountsPayable.forEach(ap => {
      if (!paymentsData[ap.supplierId]) {
        paymentsData[ap.supplierId] = { name: ap.supplierName, total: 0, count: 0 };
      }
      paymentsData[ap.supplierId].total += ap.finalAmount;
      paymentsData[ap.supplierId].count += 1;
    });
    
    return Object.values(paymentsData).sort((a, b) => b.total - a.total);
  }, [accountsPayable]);

  // Suppliers with pending payments
  const suppliersWithDebt = useMemo(() => {
    const debtData: Record<string, { name: string; pendingAmount: number; pendingCount: number }> = {};
    
    accountsPayable
      .filter(ap => ap.status === 'pendente')
      .forEach(ap => {
        if (!debtData[ap.supplierId]) {
          debtData[ap.supplierId] = { name: ap.supplierName, pendingAmount: 0, pendingCount: 0 };
        }
        debtData[ap.supplierId].pendingAmount += ap.finalAmount;
        debtData[ap.supplierId].pendingCount += 1;
      });
    
    return Object.values(debtData).sort((a, b) => b.pendingAmount - a.pendingAmount);
  }, [accountsPayable]);

  // Suppliers by type
  const suppliersByType = useMemo(() => {
    const pf = suppliers.filter(s => s.type === 'fisica').length;
    const pj = suppliers.filter(s => s.type === 'juridica').length;
    return [
      { name: 'Pessoa Física', value: pf },
      { name: 'Pessoa Jurídica', value: pj }
    ];
  }, [suppliers]);

  const clearFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
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
      <div className="pt-16 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Relatório de Fornecedores</h1>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Fornecedores</p>
                    <p className="text-xl font-bold text-foreground">{metrics.totalSuppliers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fornecedores Ativos</p>
                    <p className="text-xl font-bold text-foreground">{metrics.activeSuppliers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">A Pagar</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(metrics.totalPayable)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pago</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(metrics.totalPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Lista Geral</TabsTrigger>
              <TabsTrigger value="ranking">Ranking Pagamentos</TabsTrigger>
              <TabsTrigger value="location">Por Localização</TabsTrigger>
              <TabsTrigger value="debts">Contas a Pagar</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Fornecedores</CardTitle>
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
                      {filteredSuppliers.map(supplier => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.code}</TableCell>
                          <TableCell>{supplier.name}</TableCell>
                          <TableCell>{supplier.type === 'fisica' ? 'PF' : 'PJ'}</TableCell>
                          <TableCell>{supplier.cpfCnpj}</TableCell>
                          <TableCell>{supplier.phone || supplier.cellphone || '-'}</TableCell>
                          <TableCell>{supplier.city ? `${supplier.city}/${supplier.state}` : '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${supplier.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {supplier.active ? 'Ativo' : 'Inativo'}
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
                    <CardTitle>Ranking de Fornecedores por Pagamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead className="text-center">Lançamentos</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suppliersRanking.slice(0, 15).map((item, index) => (
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
                    <CardTitle>Top 5 Fornecedores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={suppliersRanking.slice(0, 5)}>
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
                    <CardTitle>Fornecedores por Localização</CardTitle>
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
                        {suppliersByLocation.slice(0, 15).map((item, index) => (
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
                          data={suppliersByType}
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

            <TabsContent value="debts">
              <Card>
                <CardHeader>
                  <CardTitle>Contas a Pagar por Fornecedor</CardTitle>
                </CardHeader>
                <CardContent>
                  {suppliersWithDebt.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma conta a pagar encontrada.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead className="text-center">Títulos Pendentes</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suppliersWithDebt.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-center">{item.pendingCount}</TableCell>
                            <TableCell className="text-right text-red-600 font-medium">{formatCurrency(item.pendingAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <div className="text-right">
                      <span className="text-muted-foreground mr-4">Total a Pagar:</span>
                      <span className="text-xl font-bold text-red-600">{formatCurrency(metrics.totalPayable)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SuppliersReport;
