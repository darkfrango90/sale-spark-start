import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, FileText, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import TopMenu from "@/components/dashboard/TopMenu";
import { useCustomers } from "@/contexts/CustomerContext";
import { useSales } from "@/contexts/SalesContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const BarterDashboard = () => {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { sales } = useSales();
  const [showStatementDialog, setShowStatementDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Filter customers with barter enabled
  const barterCustomers = useMemo(() => {
    return customers.filter(c => c.hasBarter);
  }, [customers]);

  // Calculate barter balances for each customer
  const customerBalances = useMemo(() => {
    return barterCustomers.map(customer => {
      // Get all sales for this customer with "Permuta" payment method
      const customerSales = sales.filter(
        sale => sale.customerId === customer.id && 
        sale.paymentMethodName?.toLowerCase() === 'permuta' &&
        sale.status !== 'cancelado'
      );
      
      const totalSalesAmount = customerSales.reduce((sum, sale) => sum + sale.total, 0);
      const balance = (customer.barterCredit || 0) - totalSalesAmount;
      
      return {
        ...customer,
        totalSales: totalSalesAmount,
        currentBalance: balance,
        isNegative: balance < 0
      };
    });
  }, [barterCustomers, sales]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalCredit = customerBalances.reduce((sum, c) => sum + (c.barterCredit || 0), 0);
    const totalPositive = customerBalances
      .filter(c => c.currentBalance >= 0)
      .reduce((sum, c) => sum + c.currentBalance, 0);
    const totalNegative = customerBalances
      .filter(c => c.currentBalance < 0)
      .reduce((sum, c) => sum + Math.abs(c.currentBalance), 0);
    
    return { totalCredit, totalPositive, totalNegative };
  }, [customerBalances]);

  // Get selected customer for statement
  const selectedCustomer = useMemo(() => {
    return customerBalances.find(c => c.id === selectedCustomerId);
  }, [selectedCustomerId, customerBalances]);

  // Get sales for selected customer
  const selectedCustomerSales = useMemo(() => {
    if (!selectedCustomerId) return [];
    return sales
      .filter(
        sale => sale.customerId === selectedCustomerId && 
        sale.paymentMethodName?.toLowerCase() === 'permuta' &&
        sale.status !== 'cancelado'
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [selectedCustomerId, sales]);

  // Calculate running balance for statement
  const statementData = useMemo(() => {
    if (!selectedCustomer) return [];
    
    let runningBalance = selectedCustomer.barterCredit || 0;
    
    return selectedCustomerSales.map(sale => {
      runningBalance -= sale.total;
      return {
        ...sale,
        debit: sale.total,
        balance: runningBalance
      };
    });
  }, [selectedCustomer, selectedCustomerSales]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintStatement = () => {
    const printContent = document.getElementById('statement-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Permita pop-ups para imprimir');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Extrato de Permuta - ${selectedCustomer?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .header { margin-bottom: 20px; }
            .totals { margin-top: 20px; font-weight: bold; }
            .negative { color: red; }
            .positive { color: green; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <div className="print:hidden">
        <TopMenu />
      </div>
      
      <main className="pt-28 px-6 pb-6 print:pt-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 print:mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground print:text-black">Dashboard de Permuta</h1>
              <p className="text-muted-foreground print:text-gray-600">Controle de permutas com clientes</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={() => setShowStatementDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Extrato Permuta
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Crédito</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totals.totalCredit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {barterCustomers.length} clientes com permuta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totals.totalPositive)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Clientes com saldo positivo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totals.totalNegative)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Clientes devendo à empresa
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Clientes com Permuta</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Crédito Inicial</TableHead>
                    <TableHead className="text-right">Limite Negativo</TableHead>
                    <TableHead className="text-right">Total Utilizado</TableHead>
                    <TableHead className="text-right">Saldo Atual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerBalances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum cliente com permuta cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerBalances.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.code}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.barterCredit || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.barterLimit || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.totalSales)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          customer.isNegative ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(customer.currentBalance)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Statement Dialog */}
      <Dialog open={showStatementDialog} onOpenChange={setShowStatementDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Extrato de Permuta</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecionar Cliente</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente com permuta" />
                </SelectTrigger>
                <SelectContent>
                  {barterCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.code} - {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && (
              <div id="statement-content" className="space-y-4">
                {/* Customer Info */}
                <div className="header bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{selectedCustomer.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Código:</span> {selectedCustomer.code}</div>
                    <div><span className="text-muted-foreground">CPF/CNPJ:</span> {selectedCustomer.cpfCnpj}</div>
                    <div><span className="text-muted-foreground">Telefone:</span> {selectedCustomer.phone}</div>
                    <div><span className="text-muted-foreground">Crédito Inicial:</span> {formatCurrency(selectedCustomer.barterCredit || 0)}</div>
                    <div><span className="text-muted-foreground">Limite Negativo:</span> {formatCurrency(selectedCustomer.barterLimit || 0)}</div>
                  </div>
                  {selectedCustomer.barterNotes && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <span className="font-medium">Observação da Permuta:</span> {selectedCustomer.barterNotes}
                    </div>
                  )}
                </div>

                {/* Statement Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Nº Pedido</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Débito</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Initial Balance Row */}
                    <TableRow className="bg-blue-50">
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="font-medium">Crédito Inicial</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        {formatCurrency(selectedCustomer.barterCredit || 0)}
                      </TableCell>
                    </TableRow>
                    {statementData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                          Nenhum pedido com permuta encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      statementData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="font-medium">{item.number}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.type === 'pedido' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.type === 'pedido' ? 'Pedido' : 'Orçamento'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            -{formatCurrency(item.debit)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${
                            item.balance < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(item.balance)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Totals */}
                <div className="totals bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total de Pedidos:</span>
                      <div className="font-semibold">{statementData.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Utilizado:</span>
                      <div className="font-semibold text-red-600">
                        {formatCurrency(selectedCustomer.totalSales)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Saldo Disponível:</span>
                      <div className={`font-semibold ${
                        selectedCustomer.currentBalance < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(selectedCustomer.currentBalance)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCustomer && (
              <div className="flex justify-end">
                <Button onClick={handlePrintStatement}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Extrato
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarterDashboard;
