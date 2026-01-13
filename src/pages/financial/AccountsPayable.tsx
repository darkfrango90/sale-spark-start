import { useState, useMemo } from "react";
import { Plus, Check, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { useSuppliers } from "@/contexts/SupplierContext";
import { useFinancial } from "@/contexts/FinancialContext";
import { Supplier } from "@/types/supplier";
import { AccountPayable } from "@/types/financial";
import TopMenu from "@/components/dashboard/TopMenu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface InstallmentPreview {
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: Date;
}

const generateInstallments = (
  totalAmount: number,
  installments: number,
  firstDueDate: Date,
  daysBetween: number
): InstallmentPreview[] => {
  if (installments <= 0 || !firstDueDate) return [];
  
  const baseAmount = Math.floor((totalAmount / installments) * 100) / 100;
  const remainder = Math.round((totalAmount - (baseAmount * (installments - 1))) * 100) / 100;
  
  const result: InstallmentPreview[] = [];
  let currentDate = new Date(firstDueDate);
  
  for (let i = 1; i <= installments; i++) {
    result.push({
      installmentNumber: i,
      totalInstallments: installments,
      amount: i === installments ? remainder : baseAmount,
      dueDate: new Date(currentDate),
    });
    currentDate.setDate(currentDate.getDate() + daysBetween);
  }
  
  return result;
};

const AccountsPayablePage = () => {
  const { toast } = useToast();
  const { suppliers } = useSuppliers();
  const { 
    accountsPayable, 
    loadingPayables, 
    addAccountPayable, 
    confirmPayment, 
    cancelPayment,
    getActiveReceivingAccounts 
  } = useFinancial();

  // Form state
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [competenceDate, setCompetenceDate] = useState('');
  const [paymentType, setPaymentType] = useState<'boleto' | 'cheque_pre' | 'cartao_credito'>('boleto');
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [daysBetween, setDaysBetween] = useState('30');
  const [installments, setInstallments] = useState('1');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'pago'>('all');
  const [filterSupplier, setFilterSupplier] = useState('');

  // Dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<AccountPayable | null>(null);
  const [paymentAccountId, setPaymentAccountId] = useState('');
  const [interestPenalty, setInterestPenalty] = useState('0');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Cancel dialog state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [payableToCancel, setPayableToCancel] = useState<AccountPayable | null>(null);

  const activeAccounts = getActiveReceivingAccounts();

  // Supplier search results
  const supplierResults = useMemo(() => {
    if (!supplierSearch.trim()) return [];
    const search = supplierSearch.toLowerCase();
    return suppliers
      .filter(s => s.active && (
        s.name.toLowerCase().includes(search) ||
        s.code.includes(search) ||
        s.cpfCnpj.includes(search)
      ))
      .slice(0, 5);
  }, [supplierSearch, suppliers]);

  // Installment preview
  const installmentPreview = useMemo(() => {
    const amountNum = parseFloat(amount.replace(/\D/g, '')) / 100 || 0;
    const installmentsNum = parseInt(installments, 10) || 1;
    const daysBetweenNum = parseInt(daysBetween, 10) || 30;
    
    if (!dueDate || amountNum <= 0) return [];
    
    return generateInstallments(amountNum, installmentsNum, new Date(dueDate + 'T00:00:00'), daysBetweenNum);
  }, [amount, installments, dueDate, daysBetween]);

  // Filtered payables
  const filteredPayables = useMemo(() => {
    return accountsPayable.filter(ap => {
      if (filterStatus !== 'all' && ap.status !== filterStatus) return false;
      if (filterSupplier && !ap.supplierName.toLowerCase().includes(filterSupplier.toLowerCase())) return false;
      return true;
    });
  }, [accountsPayable, filterStatus, filterSupplier]);

  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSupplierSearch(supplier.name);
  };

  const handleAmountChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = (parseInt(numbers, 10) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    setAmount(formatted);
  };

  const handleSubmit = async () => {
    if (!selectedSupplier) {
      toast({
        title: "Erro",
        description: "Selecione um fornecedor.",
        variant: "destructive"
      });
      return;
    }

    if (!competenceDate) {
      toast({
        title: "Erro",
        description: "Informe a data de competência.",
        variant: "destructive"
      });
      return;
    }

    const amountNum = parseFloat(amount.replace(/\D/g, '')) / 100;
    if (amountNum <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor válido.",
        variant: "destructive"
      });
      return;
    }

    if (!dueDate) {
      toast({
        title: "Erro",
        description: "Informe a data de vencimento.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addAccountPayable({
        supplierId: selectedSupplier.id,
        supplierCode: selectedSupplier.code,
        supplierName: selectedSupplier.name,
        competenceDate: new Date(competenceDate + 'T00:00:00'),
        paymentType,
        invoiceNumber: invoiceNumber || undefined,
        amount: amountNum,
        dueDate: new Date(dueDate + 'T00:00:00'),
        daysBetween: parseInt(daysBetween, 10) || 30,
        installments: parseInt(installments, 10) || 1
      });

      toast({
        title: "Sucesso",
        description: `${installments} parcela(s) adicionada(s) com sucesso!`
      });

      // Reset form
      setSelectedSupplier(null);
      setSupplierSearch('');
      setCompetenceDate('');
      setPaymentType('boleto');
      setAmount('');
      setInvoiceNumber('');
      setDueDate('');
      setDaysBetween('30');
      setInstallments('1');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar conta a pagar.",
        variant: "destructive"
      });
    }
  };

  const handleOpenPaymentDialog = (payable: AccountPayable) => {
    setSelectedPayable(payable);
    setPaymentAccountId('');
    setInterestPenalty('0');
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayable || !paymentAccountId) {
      toast({
        title: "Erro",
        description: "Selecione uma conta de pagamento.",
        variant: "destructive"
      });
      return;
    }

    try {
      await confirmPayment(selectedPayable.id, {
        payingAccountId: paymentAccountId,
        interestPenalty: parseFloat(interestPenalty.replace(/\D/g, '')) / 100 || 0,
        paymentDate: new Date(paymentDate + 'T00:00:00')
      });

      setIsPaymentDialogOpen(false);
      setSelectedPayable(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao confirmar pagamento.",
        variant: "destructive"
      });
    }
  };

  const handleCancelPayment = (payable: AccountPayable) => {
    setPayableToCancel(payable);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!payableToCancel) return;

    try {
      await cancelPayment(payableToCancel.id);
      setIsCancelDialogOpen(false);
      setPayableToCancel(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao cancelar pagamento.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <main className="pt-28 px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contas a Pagar</h1>
            <p className="text-muted-foreground">Gerencie as contas a pagar do sistema</p>
          </div>

          {/* Add New Payable Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nova Conta a Pagar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supplier Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fornecedor *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código, nome ou CNPJ..."
                      value={supplierSearch}
                      onChange={(e) => {
                        setSupplierSearch(e.target.value);
                        if (selectedSupplier && e.target.value !== selectedSupplier.name) {
                          setSelectedSupplier(null);
                        }
                      }}
                      className="pl-10"
                    />
                    {supplierResults.length > 0 && !selectedSupplier && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                        {supplierResults.map(supplier => (
                          <button
                            key={supplier.id}
                            className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                            onClick={() => handleSelectSupplier(supplier)}
                          >
                            <span className="font-medium">{supplier.code}</span> - {supplier.name}
                            <span className="text-muted-foreground ml-2">({supplier.cpfCnpj})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedSupplier && (
                    <p className="text-sm text-muted-foreground">
                      Selecionado: {selectedSupplier.code} - {selectedSupplier.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Data de Competência *</Label>
                  <Input
                    type="date"
                    value={competenceDate}
                    onChange={(e) => setCompetenceDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Pagamento</Label>
                  <Select value={paymentType} onValueChange={(v) => setPaymentType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="cheque_pre">Cheque Pré</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>N° NF/Documento</Label>
                  <Input
                    placeholder="Número da NF"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Vencimento *</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Installment Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Qtd. de Dias (entre parcelas)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={daysBetween}
                    onChange={(e) => setDaysBetween(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade de Parcelas</Label>
                  <Input
                    type="number"
                    min="1"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSubmit} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Conta a Pagar
                  </Button>
                </div>
              </div>

              {/* Installment Preview */}
              {installmentPreview.length > 1 && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Preview das Parcelas</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium text-muted-foreground">Parcela</div>
                    <div className="font-medium text-muted-foreground">Valor</div>
                    <div className="font-medium text-muted-foreground">Vencimento</div>
                    {installmentPreview.map((inst) => (
                      <>
                        <div key={`num-${inst.installmentNumber}`}>
                          {inst.installmentNumber}/{inst.totalInstallments}
                        </div>
                        <div key={`amount-${inst.installmentNumber}`}>
                          {formatCurrency(inst.amount)}
                        </div>
                        <div key={`date-${inst.installmentNumber}`}>
                          {format(inst.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Fornecedor:</Label>
              <Input
                placeholder="Filtrar por fornecedor..."
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                className="w-48"
              />
            </div>
          </div>

          {/* Payables List */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>NF/Doc</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingPayables ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Nenhuma conta a pagar encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayables.map((payable) => (
                      <TableRow key={payable.id}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{payable.supplierCode}</span>
                            <span className="text-muted-foreground ml-1">- {payable.supplierName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{payable.invoiceNumber || '-'}</TableCell>
                        <TableCell>
                          <span className="capitalize">
                            {payable.paymentType === 'boleto' ? 'Boleto' : 
                             payable.paymentType === 'cheque_pre' ? 'Cheque Pré' : 
                             'Cartão Créd.'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payable.installmentNumber}/{payable.totalInstallments}
                        </TableCell>
                        <TableCell>
                          {format(payable.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payable.finalAmount)}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            payable.status === 'pago' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {payable.status === 'pago' ? 'Pago' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {payable.status === 'pendente' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenPaymentDialog(payable)}
                              title="Dar Baixa"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelPayment(payable)}
                              title="Cancelar Baixa"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
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

      {/* Payment Confirmation Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPayable && (
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Fornecedor:</span> {selectedPayable.supplierName}</p>
                <p><span className="text-muted-foreground">Valor Original:</span> {formatCurrency(selectedPayable.originalAmount)}</p>
                <p><span className="text-muted-foreground">Vencimento:</span> {format(selectedPayable.dueDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Conta de Pagamento *</Label>
              <Select value={paymentAccountId} onValueChange={setPaymentAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Juros/Multa</Label>
              <Input
                placeholder="0,00"
                value={interestPenalty}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, '');
                  const formatted = (parseInt(numbers, 10) / 100).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                  setInterestPenalty(formatted);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Data do Pagamento *</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            {selectedPayable && (
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">
                  Valor Final: {formatCurrency(
                    selectedPayable.originalAmount + (parseFloat(interestPenalty.replace(/\D/g, '')) / 100 || 0)
                  )}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPayment}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Payment Confirmation */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o pagamento desta conta? O status voltará para "Pendente".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Sim, Cancelar Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountsPayablePage;
