import { useState, useMemo } from "react";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addDays, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopMenu from "@/components/dashboard/TopMenu";
import { useFinancial } from "@/contexts/FinancialContext";
import { useSales } from "@/contexts/SalesContext";
import { ArrowLeft, Printer, Filter, TrendingUp, TrendingDown, AlertTriangle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

const FinancialReport = () => {
  const navigate = useNavigate();
  const { accountsReceivable, accountsPayable, receivingAccounts } = useFinancial();
  const { sales } = useSales();

  const today = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(today), 'yyyy-MM-dd'));
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");

  // Filter receivables (using createdAt since AccountReceivable doesn't have dueDate)
  const filteredReceivables = useMemo(() => {
    return accountsReceivable.filter(ar => {
      const arDate = new Date(ar.createdAt);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      end.setHours(23, 59, 59, 999);
      
      if (!isWithinInterval(arDate, { start, end })) return false;
      if (statusFilter !== "all" && ar.status !== statusFilter) return false;
      if (accountFilter !== "all" && ar.receivingAccountId !== accountFilter) return false;
      
      return true;
    });
  }, [accountsReceivable, startDate, endDate, statusFilter, accountFilter]);

  // Filter payables
  const filteredPayables = useMemo(() => {
    return accountsPayable.filter(ap => {
      const dueDate = new Date(ap.dueDate);
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      end.setHours(23, 59, 59, 999);
      
      if (!isWithinInterval(dueDate, { start, end })) return false;
      if (statusFilter !== "all" && ap.status !== statusFilter) return false;
      
      return true;
    });
  }, [accountsPayable, startDate, endDate, statusFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalReceivable = accountsReceivable
      .filter(ar => ar.status === 'pendente')
      .reduce((sum, ar) => sum + ar.finalAmount, 0);
    
    const totalPayable = accountsPayable
      .filter(ap => ap.status === 'pendente')
      .reduce((sum, ap) => sum + ap.finalAmount, 0);
    
    // For receivables, we consider items older than 30 days as overdue
    const thirtyDaysAgo = addDays(today, -30);
    const overdueReceivable = accountsReceivable
      .filter(ar => ar.status === 'pendente' && isBefore(new Date(ar.createdAt), thirtyDaysAgo))
      .reduce((sum, ar) => sum + ar.finalAmount, 0);
    
    const overduePayable = accountsPayable
      .filter(ap => ap.status === 'pendente' && isBefore(new Date(ap.dueDate), today))
      .reduce((sum, ap) => sum + ap.finalAmount, 0);
    
    const projectedBalance = totalReceivable - totalPayable;
    
    return { totalReceivable, totalPayable, overdueReceivable, overduePayable, projectedBalance };
  }, [accountsReceivable, accountsPayable]);

  // Overdue receivables (older than 30 days)
  const overdueReceivables = useMemo(() => {
    const thirtyDaysAgo = addDays(today, -30);
    return accountsReceivable
      .filter(ar => ar.status === 'pendente' && isBefore(new Date(ar.createdAt), thirtyDaysAgo))
      .map(ar => {
        const sale = sales.find(s => s.id === ar.saleId);
        return {
          ...ar,
          customerName: sale?.customerName || ar.customerName || 'N/A',
          saleNumber: sale?.number || ar.saleNumber || 'N/A'
        };
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [accountsReceivable, sales]);

  // Overdue payables
  const overduePayables = useMemo(() => {
    return accountsPayable
      .filter(ap => ap.status === 'pendente' && isBefore(new Date(ap.dueDate), today))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [accountsPayable]);

  // Upcoming receivables (created in the last 30 days, still pending)
  const upcomingReceivables = useMemo(() => {
    const thirtyDaysAgo = addDays(today, -30);
    return accountsReceivable
      .filter(ar => {
        const arDate = new Date(ar.createdAt);
        return ar.status === 'pendente' && !isBefore(arDate, thirtyDaysAgo);
      })
      .map(ar => {
        const sale = sales.find(s => s.id === ar.saleId);
        return {
          ...ar,
          customerName: sale?.customerName || ar.customerName || 'N/A',
          saleNumber: sale?.number || ar.saleNumber || 'N/A'
        };
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [accountsReceivable, sales]);

  // Upcoming payables (next 30 days)
  const upcomingPayables = useMemo(() => {
    const thirtyDaysFromNow = addDays(today, 30);
    return accountsPayable
      .filter(ap => {
        const dueDate = new Date(ap.dueDate);
        return ap.status === 'pendente' && 
               !isBefore(dueDate, today) && 
               isBefore(dueDate, thirtyDaysFromNow);
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [accountsPayable]);

  // Cash flow data (monthly)
  const cashFlowData = useMemo(() => {
    const months: Record<string, { month: string; receivables: number; payables: number }> = {};
    
    accountsReceivable.forEach(ar => {
      const monthKey = format(new Date(ar.createdAt), 'yyyy-MM');
      const monthLabel = format(new Date(ar.createdAt), 'MMM/yy', { locale: ptBR });
      if (!months[monthKey]) {
        months[monthKey] = { month: monthLabel, receivables: 0, payables: 0 };
      }
      months[monthKey].receivables += ar.finalAmount;
    });
    
    accountsPayable.forEach(ap => {
      const monthKey = format(new Date(ap.dueDate), 'yyyy-MM');
      const monthLabel = format(new Date(ap.dueDate), 'MMM/yy', { locale: ptBR });
      if (!months[monthKey]) {
        months[monthKey] = { month: monthLabel, receivables: 0, payables: 0 };
      }
      months[monthKey].payables += ap.finalAmount;
    });
    
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([_, data]) => data);
  }, [accountsReceivable, accountsPayable]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const receivedAmount = accountsReceivable.filter(ar => ar.status === 'recebido').reduce((sum, ar) => sum + ar.finalAmount, 0);
    const pendingReceivable = accountsReceivable.filter(ar => ar.status === 'pendente').reduce((sum, ar) => sum + ar.finalAmount, 0);
    const paidAmount = accountsPayable.filter(ap => ap.status === 'pago').reduce((sum, ap) => sum + ap.finalAmount, 0);
    const pendingPayable = accountsPayable.filter(ap => ap.status === 'pendente').reduce((sum, ap) => sum + ap.finalAmount, 0);
    
    return [
      { name: 'Recebido', value: receivedAmount },
      { name: 'A Receber', value: pendingReceivable },
      { name: 'Pago', value: paidAmount },
      { name: 'A Pagar', value: pendingPayable }
    ];
  }, [accountsReceivable, accountsPayable]);

  const clearFilters = () => {
    setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
    setTypeFilter("all");
    setStatusFilter("all");
    setAccountFilter("all");
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
              <h1 className="text-2xl font-bold text-foreground">Relatório Financeiro</h1>
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
                  <Label>Data Inicial</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>Data Final</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="recebido">Recebido</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Conta</Label>
                  <Select value={accountFilter} onValueChange={setAccountFilter}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {receivingAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">A Receber</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(metrics.totalReceivable)}</p>
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
                    <p className="text-lg font-bold text-red-600">{formatCurrency(metrics.totalPayable)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Previsto</p>
                    <p className={`text-lg font-bold ${metrics.projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(metrics.projectedBalance)}
                    </p>
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
                    <p className="text-sm text-muted-foreground">Atrasado (Rec.)</p>
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(metrics.overdueReceivable)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vencido (Pag.)</p>
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(metrics.overduePayable)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="cashflow" className="space-y-4">
            <TabsList>
              <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
              <TabsTrigger value="payables">Contas a Pagar</TabsTrigger>
              <TabsTrigger value="overdue">Atrasados</TabsTrigger>
              <TabsTrigger value="upcoming">Pendentes</TabsTrigger>
            </TabsList>

            <TabsContent value="cashflow">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fluxo de Caixa Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="receivables" name="Recebimentos" fill="#10b981" />
                        <Bar dataKey="payables" name="Pagamentos" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusDistribution.map((_, index) => (
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

            <TabsContent value="receivables">
              <Card>
                <CardHeader>
                  <CardTitle>Contas a Receber no Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Venda</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReceivables.map(ar => {
                        const sale = sales.find(s => s.id === ar.saleId);
                        return (
                          <TableRow key={ar.id}>
                            <TableCell>{format(new Date(ar.createdAt), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="font-medium">{sale?.number || ar.saleNumber || '-'}</TableCell>
                            <TableCell>{sale?.customerName || ar.customerName || '-'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                ar.status === 'recebido' ? 'bg-green-100 text-green-700' :
                                ar.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {ar.status === 'recebido' ? 'Recebido' : 'Pendente'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(ar.finalAmount)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <div className="text-right">
                      <span className="text-muted-foreground mr-4">Total:</span>
                      <span className="text-xl font-bold">{formatCurrency(filteredReceivables.reduce((sum, ar) => sum + ar.finalAmount, 0))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payables">
              <Card>
                <CardHeader>
                  <CardTitle>Contas a Pagar no Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>NF</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayables.map(ap => (
                        <TableRow key={ap.id}>
                          <TableCell>{format(new Date(ap.dueDate), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="font-medium">{ap.supplierName}</TableCell>
                          <TableCell>{ap.invoiceNumber || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              ap.status === 'pago' ? 'bg-green-100 text-green-700' :
                              ap.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {ap.status === 'pago' ? 'Pago' : 'Pendente'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(ap.finalAmount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <div className="text-right">
                      <span className="text-muted-foreground mr-4">Total:</span>
                      <span className="text-xl font-bold">{formatCurrency(filteredPayables.reduce((sum, ap) => sum + ap.finalAmount, 0))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overdue">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Recebimentos Atrasados (+30 dias)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overdueReceivables.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Nenhum título atrasado</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overdueReceivables.map(ar => (
                            <TableRow key={ar.id}>
                              <TableCell className="text-red-600">{format(new Date(ar.createdAt), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{ar.customerName}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(ar.finalAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Pagamentos Vencidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overduePayables.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Nenhum título vencido</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overduePayables.map(ap => (
                            <TableRow key={ap.id}>
                              <TableCell className="text-red-600">{format(new Date(ap.dueDate), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{ap.supplierName}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(ap.finalAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="upcoming">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">A Receber (Pendentes Recentes)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingReceivables.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Nenhum título pendente</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingReceivables.map(ar => (
                            <TableRow key={ar.id}>
                              <TableCell>{format(new Date(ar.createdAt), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{ar.customerName}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(ar.finalAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">A Pagar (Próximos 30 dias)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingPayables.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Nenhum título a vencer</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingPayables.map(ap => (
                            <TableRow key={ap.id}>
                              <TableCell>{format(new Date(ap.dueDate), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{ap.supplierName}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(ap.finalAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
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

export default FinancialReport;
