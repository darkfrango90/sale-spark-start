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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Eye, RefreshCw, FileText, ShoppingBag, Printer, Ban } from "lucide-react";
import { useSales } from "@/contexts/SalesContext";
import { Sale } from "@/types/sales";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SalePrintView from "@/components/sales/SalePrintView";

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

  const filteredSales = sales.filter(sale => {
    const matchesType = !filterType || sale.type === filterType;
    const matchesSearch = 
      sale.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerCpfCnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    
    return matchesType && matchesSearch && matchesStatus;
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
      
      <main className="pt-28 px-6 pb-6">
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
                            <Button variant="ghost" size="icon" title="Visualizar">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Reimprimir"
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
    </div>
  );
};

export default SalesList;
