import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopMenu from "@/components/dashboard/TopMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, RefreshCw, FileText, ShoppingBag, Printer, Ban, Calendar, Paperclip, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useSales } from "@/contexts/SalesContext";
import { Sale } from "@/types/sales";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SalePrintView from "@/components/sales/SalePrintView";
import { supabase } from "@/integrations/supabase/client";

interface SalesListProps {
  type?: 'pedido' | 'orcamento';
}

const SalesList = ({ type }: SalesListProps) => {
  const navigate = useNavigate();
  const filterType = type;
  
  const { sales, convertQuoteToSale, updateSale } = useSales();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Novos filtros
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  
  // Cancel dialog
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  // Convert dialog
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [saleToConvert, setSaleToConvert] = useState<Sale | null>(null);
  
  // Print modal
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [saleToPrint, setSaleToPrint] = useState<Sale | null>(null);

  // Receipt dialog
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [saleForReceipt, setSaleForReceipt] = useState<Sale | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Obter lista única de condições de pagamento para o filtro
  const paymentMethods = [...new Set(sales.filter(s => s.paymentMethodName).map(s => s.paymentMethodName))];

  // Verificar se é método que aceita comprovante (PIX ou Depósito)
  const isReceiptPayment = (paymentMethodName: string | undefined) => {
    if (!paymentMethodName) return false;
    const methodLower = paymentMethodName.toLowerCase();
    return methodLower.includes('pix') || methodLower.includes('depósito') || methodLower.includes('deposito');
  };

  // Handle file selection for receipt
  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze receipt with AI
  const handleReceiptAnalysis = async () => {
    if (!saleForReceipt || !receiptPreview || !receiptFile) return;
    
    setIsAnalyzing(true);
    
    try {
      // 1. Upload receipt to storage
      const fileName = `${saleForReceipt.id}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile);
      
      if (uploadError) {
        throw new Error('Erro ao fazer upload do comprovante');
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);
      
      // 2. Call Edge Function to analyze receipt
      const { data, error } = await supabase.functions.invoke('analyze-receipt', {
        body: { imageBase64: receiptPreview }
      });
      
      if (error) {
        throw new Error('Erro ao analisar comprovante');
      }
      
      // 3. Check if value matches (tolerance R$ 0.50)
      const valorConfere = data?.valor && Math.abs(data.valor - saleForReceipt.total) < 0.50;
      const confiancaAlta = data?.confianca >= 0.8;
      
      if (valorConfere && confiancaAlta) {
        // Auto-settle: update accounts_receivable
        await supabase.from('accounts_receivable').update({
          status: 'recebido',
          confirmed_by: 'ia',
          receipt_date: new Date().toISOString().split('T')[0],
          receipt_url: publicUrl,
          notes: `Baixa automática por IA. Banco: ${data.banco || 'N/A'}. Valor: R$ ${data.valor?.toFixed(2) || '0.00'}`
        }).eq('sale_id', saleForReceipt.id);
        
        // Finalize sale
        await updateSale(saleForReceipt.id, { status: 'finalizado' });
        
        toast({
          title: "✅ Pagamento Confirmado por I.A.",
          description: `Banco: ${data.banco || 'Identificado'}. Valor: R$ ${data.valor?.toFixed(2)}. Pedido finalizado automaticamente.`,
        });
      } else {
        // Save receipt but keep pending for manual review
        await supabase.from('accounts_receivable').update({
          receipt_url: publicUrl,
          notes: `Comprovante anexado. IA: valor R$ ${data?.valor?.toFixed(2) || '0.00'}, confiança ${((data?.confianca || 0) * 100).toFixed(0)}%. Verificar manualmente.`
        }).eq('sale_id', saleForReceipt.id);
        
        toast({
          title: "⚠️ Verificação Necessária",
          description: `Valor no comprovante (R$ ${data?.valor?.toFixed(2) || '?'}) diverge do pedido (R$ ${saleForReceipt.total.toFixed(2)}). Verificar manualmente.`,
          variant: "destructive",
        });
      }
      
      // Close dialog and reset state
      setIsReceiptDialogOpen(false);
      setSaleForReceipt(null);
      setReceiptFile(null);
      setReceiptPreview(null);
      
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao analisar comprovante",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesType = !filterType || sale.type === filterType;
    const matchesSearch = 
      sale.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerCpfCnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    
    // Novos filtros
    const saleDate = new Date(sale.createdAt);
    saleDate.setHours(0, 0, 0, 0);
    
    const matchesDateFrom = !dateFrom || saleDate >= dateFrom;
    const matchesDateTo = !dateTo || saleDate <= dateTo;
    const matchesPayment = paymentFilter === 'all' || sale.paymentMethodName === paymentFilter;
    const matchesMinValue = !minValue || sale.total >= parseFloat(minValue);
    const matchesMaxValue = !maxValue || sale.total <= parseFloat(maxValue);
    
    return matchesType && matchesSearch && matchesStatus && 
           matchesDateFrom && matchesDateTo && matchesPayment && 
           matchesMinValue && matchesMaxValue;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  const handleCancel = (sale: Sale) => {
    setSaleToCancel(sale);
    setCancelReason('');
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (saleToCancel && cancelReason.trim()) {
      try {
        const currentNotes = saleToCancel.notes || '';
        const newNotes = currentNotes 
          ? `${currentNotes}\n\n[MOTIVO DO CANCELAMENTO]: ${cancelReason.trim()}` 
          : `[MOTIVO DO CANCELAMENTO]: ${cancelReason.trim()}`;
        
        await updateSale(saleToCancel.id, { 
          status: 'cancelado',
          notes: newNotes
        });
        toast({
          title: "Cancelado",
          description: `${saleToCancel.type === 'pedido' ? 'Pedido' : 'Orçamento'} ${saleToCancel.number} cancelado.`,
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao cancelar.",
          variant: "destructive",
        });
      }
      setIsCancelDialogOpen(false);
      setSaleToCancel(null);
      setCancelReason('');
    }
  };

  const handleConvert = (sale: Sale) => {
    setSaleToConvert(sale);
    setIsConvertDialogOpen(true);
  };

  const confirmConvert = async () => {
    if (saleToConvert) {
      try {
        const newSale = await convertQuoteToSale(saleToConvert.id);
        if (newSale) {
          toast({
            title: "Orçamento convertido",
            description: `Orçamento ${saleToConvert.number} convertido para Pedido ${newSale.number}.`,
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao converter orçamento.",
          variant: "destructive",
        });
      }
      setIsConvertDialogOpen(false);
      setSaleToConvert(null);
    }
  };

  const handleFinalize = (sale: Sale) => {
    updateSale(sale.id, { status: 'finalizado' });
    toast({
      title: "Finalizado",
      description: `${sale.type === 'pedido' ? 'Pedido' : 'Orçamento'} ${sale.number} finalizado.`,
    });
  };

  const handlePrint = (sale: Sale) => {
    setSaleToPrint(sale);
    setPrintModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Extrai o motivo do cancelamento das notas
  const extractReason = (notes: string | undefined): string | null => {
    if (!notes) return null;
    const prefix = '[MOTIVO DO CANCELAMENTO]:';
    const index = notes.indexOf(prefix);
    if (index === -1) return null;
    return notes.substring(index + prefix.length).trim();
  };

  const getStatusBadge = (sale: Sale) => {
    const styles: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-700',
      finalizado: 'bg-green-100 text-green-700',
      cancelado: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
    };

    const badge = (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[sale.status]}`}>
        {labels[sale.status]}
      </span>
    );

    // Para cancelados, mostrar tooltip com motivo
    if (sale.status === 'cancelado') {
      const reason = extractReason(sale.notes);
      
      if (reason) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{badge}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-1">Motivo do Cancelamento:</p>
                <p>{reason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    }

    return badge;
  };

  const getTypeBadge = (saleType: string) => {
    const styles = {
      pedido: 'bg-blue-100 text-blue-700',
      orcamento: 'bg-purple-100 text-purple-700',
    };
    const labels = {
      pedido: 'Pedido',
      orcamento: 'Orçamento',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[saleType as keyof typeof styles]}`}>
        {labels[saleType as keyof typeof labels]}
      </span>
    );
  };

  const pageTitle = filterType === 'pedido' ? 'Pedidos' : filterType === 'orcamento' ? 'Orçamentos' : 'Vendas';
  const PageIcon = filterType === 'pedido' ? ShoppingBag : filterType === 'orcamento' ? FileText : ShoppingBag;

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      
      <main className="pt-16 px-6 pb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PageIcon className="h-5 w-5" />
              {pageTitle}
            </CardTitle>
            <Button onClick={() => navigate('/vendas/nova')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </CardHeader>
          <CardContent>
            {/* Linha 1: Busca e Status */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Linha 2: Filtros avançados */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* Data De */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Data De"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={ptBR}
                    initialFocus
                  />
                  {dateFrom && (
                    <div className="p-2 border-t">
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setDateFrom(undefined)}>
                        Limpar
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Data Até */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Data Até"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    locale={ptBR}
                    initialFocus
                  />
                  {dateTo && (
                    <div className="p-2 border-t">
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setDateTo(undefined)}>
                        Limpar
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Condição de Pagamento */}
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Pagamentos</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Valor Mínimo */}
              <Input
                type="number"
                placeholder="Valor Mín"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="w-[120px]"
              />

              {/* Valor Máximo */}
              <Input
                type="number"
                placeholder="Valor Máx"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                className="w-[120px]"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Número</TableHead>
                    {!filterType && <TableHead className="w-24">Tipo</TableHead>}
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Data</TableHead>
                    <TableHead className="w-48">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={filterType ? 7 : 8} className="text-center py-8 text-muted-foreground">
                        Nenhum {filterType === 'pedido' ? 'pedido' : filterType === 'orcamento' ? 'orçamento' : 'registro'} encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id} className={sale.status === 'cancelado' ? 'opacity-60' : ''}>
                        <TableCell className="font-mono font-medium">{sale.number}</TableCell>
                        {!filterType && <TableCell>{getTypeBadge(sale.type)}</TableCell>}
                        <TableCell>
                          <div>
                            <p className="font-medium">{sale.customerName}</p>
                            <p className="text-sm text-muted-foreground">{sale.customerCpfCnpj}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(sale.total)}</TableCell>
                        <TableCell>{sale.paymentMethodName || '-'}</TableCell>
                        <TableCell>{getStatusBadge(sale)}</TableCell>
                        <TableCell>{format(new Date(sale.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Visualizar/Imprimir"
                              onClick={() => handlePrint(sale)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            {sale.type === 'orcamento' && sale.status === 'pendente' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Converter em Pedido"
                                onClick={() => handleConvert(sale)}
                              >
                                <RefreshCw className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                            {sale.type === 'pedido' && sale.status === 'pendente' && isReceiptPayment(sale.paymentMethodName) && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Anexar Comprovante"
                                onClick={() => {
                                  setSaleForReceipt(sale);
                                  setReceiptFile(null);
                                  setReceiptPreview(null);
                                  setIsReceiptDialogOpen(true);
                                }}
                              >
                                <Paperclip className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {sale.status === 'pendente' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Cancelar"
                                onClick={() => handleCancel(sale)}
                              >
                                <Ban className="h-4 w-4 text-orange-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Cancel Dialog with Reason */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Justificar Cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Para cancelar o {saleToCancel?.type === 'pedido' ? 'pedido' : 'orçamento'} "{saleToCancel?.number}", 
              informe o motivo do cancelamento:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Digite o motivo do cancelamento..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="min-h-[80px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setCancelReason('');
              setSaleToCancel(null);
            }}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancel} 
              disabled={!cancelReason.trim()}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Cancelar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert Dialog */}
      <AlertDialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converter em Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja converter o orçamento "{saleToConvert?.number}" em pedido?
              Um novo pedido será criado e o orçamento será marcado como finalizado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConvert}>
              Converter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Modal */}
      <SalePrintView 
        sale={saleToPrint} 
        open={printModalOpen} 
        onClose={() => {
          setPrintModalOpen(false);
          setSaleToPrint(null);
        }} 
      />

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Anexar Comprovante de Pagamento</DialogTitle>
            <DialogDescription>
              Pedido #{saleForReceipt?.number} - Valor: {formatCurrency(saleForReceipt?.total || 0)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleReceiptFileChange}
                disabled={isAnalyzing}
              />
            </div>
            
            {receiptPreview && (
              <div className="border rounded-md p-2">
                <img 
                  src={receiptPreview} 
                  alt="Preview do comprovante" 
                  className="max-h-48 mx-auto rounded" 
                />
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              A IA irá analisar o comprovante e, se o valor conferir, fará a baixa automática.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsReceiptDialogOpen(false);
                setSaleForReceipt(null);
                setReceiptFile(null);
                setReceiptPreview(null);
              }}
              disabled={isAnalyzing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleReceiptAnalysis} 
              disabled={!receiptFile || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                'Enviar para Análise'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesList;
