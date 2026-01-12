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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Eye, Trash2, RefreshCw, FileText, ShoppingBag, Printer } from "lucide-react";
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
  
  const { sales, deleteSale, convertQuoteToSale, updateSale } = useSales();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  
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

  const handleDelete = (sale: Sale) => {
    setSaleToDelete(sale);
    setDeleteReason('');
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (saleToDelete && deleteReason.trim()) {
      try {
        await deleteSale(saleToDelete.id, deleteReason.trim());
        toast({
          title: "Excluído",
          description: `${saleToDelete.type === 'pedido' ? 'Pedido' : 'Orçamento'} ${saleToDelete.number} excluído com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao excluir.",
          variant: "destructive",
        });
      }
      setIsDeleteDialogOpen(false);
      setSaleToDelete(null);
      setDeleteReason('');
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

  const handleCancel = (sale: Sale) => {
    updateSale(sale.id, { status: 'cancelado' });
    toast({
      title: "Cancelado",
      description: `${sale.type === 'pedido' ? 'Pedido' : 'Orçamento'} ${sale.number} cancelado.`,
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

  const getStatusBadge = (status: string) => {
    const styles = {
      pendente: 'bg-yellow-100 text-yellow-700',
      finalizado: 'bg-green-100 text-green-700',
      cancelado: 'bg-red-100 text-red-700',
    };
    const labels = {
      pendente: 'Pendente',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
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
                      <TableRow key={sale.id}>
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
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
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
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Cancelar"
                                  onClick={() => handleCancel(sale)}
                                >
                                  <Trash2 className="h-4 w-4 text-orange-500" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Excluir"
                                  onClick={() => handleDelete(sale)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
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

      {/* Delete Dialog with Reason */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Justificar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Para excluir o {saleToDelete?.type === 'pedido' ? 'pedido' : 'orçamento'} "{saleToDelete?.number}", 
              informe o motivo da exclusão:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Digite o motivo da exclusão..."
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            className="min-h-[80px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteReason('');
              setSaleToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={!deleteReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
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
