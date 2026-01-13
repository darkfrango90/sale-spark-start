import { useState, useEffect } from "react";
import TopMenu from "@/components/dashboard/TopMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wallet, Eye, Check, CalendarIcon, FileImage, X } from "lucide-react";
import { useFinancial } from "@/contexts/FinancialContext";
import { useToast } from "@/hooks/use-toast";
import { AccountReceivable } from "@/types/financial";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const AccountsReceivablePage = () => {
  const { 
    accountsReceivable, 
    loadingReceivables, 
    getActiveReceivingAccounts, 
    confirmReceipt,
    cancelReceipt,
    refreshAccountsReceivable
  } = useFinancial();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAR, setSelectedAR] = useState<AccountReceivable | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false);
  
  // Confirm receipt form
  const [receivingAccountId, setReceivingAccountId] = useState('');
  const [interestPenalty, setInterestPenalty] = useState(0);
  const [receiptDate, setReceiptDate] = useState<Date>(new Date());

  const receivingAccounts = getActiveReceivingAccounts();

  // Refresh data when page loads
  useEffect(() => {
    refreshAccountsReceivable();
  }, []);

  const filteredReceivables = accountsReceivable.filter(ar => {
    if (statusFilter === 'all') return true;
    return ar.status === statusFilter;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleOpenConfirmDialog = (ar: AccountReceivable) => {
    setSelectedAR(ar);
    setReceivingAccountId('');
    setInterestPenalty(0);
    setReceiptDate(new Date());
    setConfirmDialogOpen(true);
  };

  const handleViewReceipt = (ar: AccountReceivable) => {
    setSelectedAR(ar);
    setReceiptPreviewOpen(true);
  };

  const handleConfirmReceipt = async () => {
    if (!selectedAR) return;

    if (!receivingAccountId) {
      toast({
        title: "Erro",
        description: "Selecione a conta de recebimento.",
        variant: "destructive",
      });
      return;
    }

    try {
      await confirmReceipt(selectedAR.id, {
        receivingAccountId,
        interestPenalty,
        receiptDate,
      });
      setConfirmDialogOpen(false);
      setSelectedAR(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao confirmar recebimento.",
        variant: "destructive",
      });
    }
  };

  const handleCancelReceipt = async (ar: AccountReceivable) => {
    try {
      await cancelReceipt(ar.id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao cancelar baixa.",
        variant: "destructive",
      });
    }
  };

  const pendingTotal = accountsReceivable
    .filter(ar => ar.status === 'pendente')
    .reduce((acc, ar) => acc + ar.originalAmount, 0);

  const receivedTotal = accountsReceivable
    .filter(ar => ar.status === 'recebido')
    .reduce((acc, ar) => acc + ar.finalAmount, 0);

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <main className="pt-28 px-6 pb-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Pendente</div>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingTotal)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Recebido</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(receivedTotal)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Registros</div>
              <div className="text-2xl font-bold">{accountsReceivable.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Contas a Receber
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="recebido">Recebido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loadingReceivables ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : filteredReceivables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum registro encontrado.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Cond. Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-40">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceivables.map((ar) => (
                    <TableRow key={ar.id}>
                      <TableCell className="font-mono font-medium">{ar.saleNumber}</TableCell>
                      <TableCell>{ar.customerName}</TableCell>
                      <TableCell>{ar.paymentMethodName}</TableCell>
                      <TableCell className="text-right">
                        {ar.status === 'recebido' && ar.interestPenalty > 0 ? (
                          <div>
                            <div>{formatCurrency(ar.finalAmount)}</div>
                            <div className="text-xs text-muted-foreground">
                              (+ {formatCurrency(ar.interestPenalty)} juros)
                            </div>
                          </div>
                        ) : (
                          formatCurrency(ar.originalAmount)
                        )}
                      </TableCell>
                      <TableCell>{formatDate(ar.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={ar.status === 'pendente' ? 'secondary' : 'default'}>
                          {ar.status === 'pendente' ? 'Pendente' : 'Recebido'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {ar.receiptUrl && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Ver Comprovante"
                              onClick={() => handleViewReceipt(ar)}
                            >
                              <FileImage className="h-4 w-4" />
                            </Button>
                          )}
                          {ar.status === 'pendente' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenConfirmDialog(ar)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Dar Baixa
                            </Button>
                          )}
                          {ar.status === 'recebido' && (
                            <div className="flex items-center gap-2">
                              {ar.receivingAccountName && (
                                <span className="text-sm text-muted-foreground">
                                  {ar.receivingAccountName}
                                </span>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => handleCancelReceipt(ar)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar Baixa
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Confirm Receipt Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento</DialogTitle>
          </DialogHeader>
          
          {selectedAR && (
            <div className="space-y-4 py-4">
              {/* Sale Info */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pedido:</span>
                  <span className="font-medium">{selectedAR.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{selectedAR.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valor:</span>
                  <span className="font-medium">{formatCurrency(selectedAR.originalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Condição:</span>
                  <span className="font-medium">{selectedAR.paymentMethodName}</span>
                </div>
              </div>

              {/* Receipt Preview Button */}
              {selectedAR.receiptUrl && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(selectedAR.receiptUrl, '_blank')}
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Ver Comprovante Anexado
                </Button>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Conta de Recebimento *</Label>
                  <Select value={receivingAccountId} onValueChange={setReceivingAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {receivingAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Juros/Multa (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={interestPenalty}
                    onChange={(e) => setInterestPenalty(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Recebimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !receiptDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {receiptDate ? formatDate(receiptDate) : "Selecione..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={receiptDate}
                        onSelect={(date) => date && setReceiptDate(date)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Total with interest */}
                {interestPenalty > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm">Total com Juros:</span>
                      <span className="font-bold text-green-700">
                        {formatCurrency(selectedAR.originalAmount + interestPenalty)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmReceipt}>
              Confirmar Recebimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog open={receiptPreviewOpen} onOpenChange={setReceiptPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comprovante - Pedido {selectedAR?.saleNumber}</DialogTitle>
          </DialogHeader>
          {selectedAR?.receiptUrl && (
            <div className="flex justify-center">
              <img 
                src={selectedAR.receiptUrl} 
                alt="Comprovante" 
                className="max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountsReceivablePage;
