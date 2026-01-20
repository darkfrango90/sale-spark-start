import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TopMenu from "@/components/dashboard/TopMenu";
import { useSales } from "@/contexts/SalesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  ShoppingCart, 
  Banknote, 
  CreditCard, 
  Receipt,
  Clock
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const CashRegisterReport = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { user } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [sellerFilter, setSellerFilter] = useState<string>("all");

  // Get unique sellers from sales
  const sellers = useMemo(() => {
    const sellerSet = new Set<string>();
    sales.forEach(sale => {
      if (sale.sellerName) {
        sellerSet.add(sale.sellerName);
      }
    });
    return Array.from(sellerSet).sort();
  }, [sales]);

  // Filter sales for selected date
  const filteredSales = useMemo(() => {
    const dateToFilter = parseISO(selectedDate);
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      const isSameDayResult = isSameDay(saleDate, dateToFilter);
      const isValidStatus = sale.status !== 'cancelado' && sale.status !== 'excluido';
      const isOrder = sale.type === 'pedido';
      const matchesSeller = sellerFilter === 'all' || sale.sellerName === sellerFilter;
      
      return isSameDayResult && isValidStatus && isOrder && matchesSeller;
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [sales, selectedDate, sellerFilter]);

  // Group by payment method for summary
  const summaryByPaymentMethod = useMemo(() => {
    const grouped: Record<string, { name: string; count: number; total: number }> = {};
    
    filteredSales.forEach(sale => {
      const method = sale.paymentMethodName || 'Não informado';
      if (!grouped[method]) {
        grouped[method] = { name: method, count: 0, total: 0 };
      }
      grouped[method].count += 1;
      grouped[method].total += sale.total;
    });
    
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // Totals
  const totals = useMemo(() => ({
    count: filteredSales.length,
    total: filteredSales.reduce((sum, s) => sum + s.total, 0),
    discounts: filteredSales.reduce((sum, s) => sum + s.discount, 0),
    average: filteredSales.length > 0 
      ? filteredSales.reduce((sum, s) => sum + s.total, 0) / filteredSales.length 
      : 0
  }), [filteredSales]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), "HH:mm", { locale: ptBR });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir o relatório.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Caixa - ${format(parseISO(selectedDate), "dd/MM/yyyy")}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .header p { font-size: 12px; color: #666; }
            .filters {
              margin-bottom: 15px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px 8px; 
              text-align: left;
            }
            th { 
              background: #f0f0f0; 
              font-weight: bold;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary-section {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 2px solid #000;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 15px;
            }
            .summary-card {
              padding: 10px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            .summary-card h4 { font-size: 11px; color: #666; margin-bottom: 5px; }
            .summary-card p { font-size: 16px; font-weight: bold; }
            .payment-summary {
              margin-top: 15px;
            }
            .payment-summary h3 {
              font-size: 14px;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
            }
            .footer {
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 10px;
              color: #666;
              text-align: center;
            }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RELATÓRIO DE CAIXA</h1>
            <p>Data: ${format(parseISO(selectedDate), "dd/MM/yyyy")} ${sellerFilter !== 'all' ? `| Vendedor: ${sellerFilter}` : ''}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Nº Venda</th>
                <th>Cliente</th>
                <th>Forma Pgto</th>
                <th>Tipo</th>
                <th class="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSales.map(sale => `
                <tr>
                  <td>${formatTime(sale.createdAt)}</td>
                  <td>${sale.number}</td>
                  <td>${sale.customerName}</td>
                  <td>${sale.paymentMethodName || '-'}</td>
                  <td>${sale.paymentType === 'vista' ? 'À Vista' : sale.paymentType === 'prazo' ? 'A Prazo' : '-'}</td>
                  <td class="text-right">${formatCurrency(sale.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-grid">
              <div class="summary-card">
                <h4>TOTAL DE VENDAS</h4>
                <p>${totals.count} vendas</p>
              </div>
              <div class="summary-card">
                <h4>VALOR TOTAL</h4>
                <p>${formatCurrency(totals.total)}</p>
              </div>
              <div class="summary-card">
                <h4>TICKET MÉDIO</h4>
                <p>${formatCurrency(totals.average)}</p>
              </div>
              <div class="summary-card">
                <h4>DESCONTOS</h4>
                <p>${formatCurrency(totals.discounts)}</p>
              </div>
            </div>

            <div class="payment-summary">
              <h3>RESUMO POR FORMA DE PAGAMENTO</h3>
              <table>
                <thead>
                  <tr>
                    <th>Forma de Pagamento</th>
                    <th class="text-center">Qtd.</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${summaryByPaymentMethod.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td class="text-center">${item.count}</td>
                      <td class="text-right">${formatCurrency(item.total)}</td>
                    </tr>
                  `).join('')}
                  <tr style="font-weight: bold; background: #f0f0f0;">
                    <td>TOTAL</td>
                    <td class="text-center">${totals.count}</td>
                    <td class="text-right">${formatCurrency(totals.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="footer">
            Impresso em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} por ${user?.name || 'Sistema'}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <div className="pt-16 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/relatorios")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Relatório de Caixa</h1>
                <p className="text-sm text-muted-foreground">Conferência de vendas do dia</p>
              </div>
            </div>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-[180px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vendedor</Label>
                  <Select value={sellerFilter} onValueChange={setSellerFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Todos os vendedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os vendedores</SelectItem>
                      {sellers.map(seller => (
                        <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vendas</p>
                    <p className="text-xl font-bold text-foreground">{totals.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Banknote className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(totals.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket Médio</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(totals.average)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Receipt className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descontos</p>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(totals.discounts)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Vendas do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma venda encontrada para a data selecionada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Hora
                          </div>
                        </TableHead>
                        <TableHead>Nº Venda</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Forma Pagamento</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono text-sm">
                            {formatTime(sale.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">{sale.number}</TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{sale.paymentMethodName || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              sale.paymentType === 'vista' 
                                ? 'bg-green-100 text-green-700' 
                                : sale.paymentType === 'prazo'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {sale.paymentType === 'vista' ? 'À Vista' : sale.paymentType === 'prazo' ? 'A Prazo' : '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(sale.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Summary */}
          {filteredSales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryByPaymentMethod.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-center">{item.count}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>TOTAL GERAL</TableCell>
                      <TableCell className="text-center">{totals.count}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(totals.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashRegisterReport;
