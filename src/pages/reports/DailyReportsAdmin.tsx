import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopMenu from '@/components/dashboard/TopMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DailyReport, getPlateMultiplier, VEHICLE_PLATES } from '@/types/driver';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, FileDown, Pencil, Eye, DollarSign, MapPin } from 'lucide-react';

const DailyReportsAdmin = () => {
  const navigate = useNavigate();
  const { users } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [editReport, setEditReport] = useState<DailyReport | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<DailyReport>>({});

  // Filters
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedDriver, setSelectedDriver] = useState('all');

  useEffect(() => {
    loadReports();
  }, [startDate, endDate, selectedDriver]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('daily_reports')
        .select('*')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false });

      if (selectedDriver !== 'all') {
        query = query.eq('user_id', selectedDriver);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editReport) return;

    try {
      const { error } = await supabase
        .from('daily_reports')
        .update({
          customer_name: editFormData.customer_name,
          order_number: editFormData.order_number,
          km_initial: editFormData.km_initial,
          km_final: editFormData.km_final,
          freight_value: editFormData.freight_value,
          observation: editFormData.observation,
        })
        .eq('id', editReport.id);

      if (error) throw error;

      toast.success('Relatório atualizado com sucesso');
      setEditReport(null);
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Erro ao atualizar relatório');
    }
  };

  // Calculate totals
  const totalFreight = reports.reduce((sum, r) => sum + Number(r.freight_value), 0);
  const totalDistance = reports.reduce((sum, r) => sum + (Number(r.km_final) - Number(r.km_initial)), 0);

  // Get unique drivers from reports
  const uniqueDrivers = Array.from(new Set(reports.map(r => r.user_id)))
    .map(userId => {
      const report = reports.find(r => r.user_id === userId);
      return { id: userId, name: report?.user_name || userId };
    });

  const exportToPDF = () => {
    // Group reports by driver
    const byDriver: Record<string, DailyReport[]> = {};
    reports.forEach(r => {
      if (!byDriver[r.user_name]) byDriver[r.user_name] = [];
      byDriver[r.user_name].push(r);
    });

    let content = `
RELATÓRIO DE PARTES DIÁRIAS
Período: ${format(new Date(startDate), 'dd/MM/yyyy')} a ${format(new Date(endDate), 'dd/MM/yyyy')}

=== RESUMO GERAL ===
Valor Total de Frete: R$ ${totalFreight.toFixed(2)}
Distância Total: ${totalDistance.toFixed(0)} km

=== RESUMO POR MOTORISTA ===
`;

    Object.entries(byDriver).forEach(([driverName, driverReports]) => {
      const driverFreight = driverReports.reduce((sum, r) => sum + Number(r.freight_value), 0);
      const driverDistance = driverReports.reduce((sum, r) => sum + (Number(r.km_final) - Number(r.km_initial)), 0);
      
      // Calculate difference based on plate multiplier
      const driverDifference = driverReports.reduce((sum, r) => {
        const distance = Number(r.km_final) - Number(r.km_initial);
        const multiplier = getPlateMultiplier(r.vehicle_plate);
        return sum + (Number(r.freight_value) - (distance * multiplier));
      }, 0);

      content += `
${driverName}:
  Frete: R$ ${driverFreight.toFixed(2)}
  Distância: ${driverDistance.toFixed(0)} km
  Diferença: R$ ${driverDifference.toFixed(2)}
`;
    });

    content += `
=== DETALHAMENTO POR MOTORISTA ===
`;

    Object.entries(byDriver).forEach(([driverName, driverReports]) => {
      content += `
--- ${driverName.toUpperCase()} ---
`;
      driverReports.forEach(r => {
        const distance = Number(r.km_final) - Number(r.km_initial);
        content += `
Data: ${format(new Date(r.created_at), 'dd/MM/yyyy HH:mm')}
Placa: ${r.vehicle_plate} | Cliente: ${r.customer_name} | Pedido: ${r.order_number}
KM: ${r.km_initial} → ${r.km_final} (${distance} km)
Frete: R$ ${Number(r.freight_value).toFixed(2)}
${r.observation ? `Obs: ${r.observation}` : ''}
---
`;
      });
    });

    // Create and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partes-diarias-${startDate}-${endDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado com sucesso');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <main className="pt-16 pb-8 px-4 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/relatorios')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Relatório de Partes Diárias</h1>
          <Button onClick={exportToPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Motorista</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {users.filter(u => u.role === 'motorista').map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total do Frete</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalFreight.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Distância Total Percorrida</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalDistance.toLocaleString('pt-BR')} km
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registros ({reports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Nº Pedido</TableHead>
                    <TableHead className="text-right">Distância</TableHead>
                    <TableHead className="text-right">Frete</TableHead>
                    <TableHead>Obs</TableHead>
                    <TableHead className="text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {format(new Date(report.created_at), 'dd/MM/yy HH:mm')}
                        </TableCell>
                        <TableCell>{report.user_name}</TableCell>
                        <TableCell className="font-mono">{report.vehicle_plate}</TableCell>
                        <TableCell>{report.customer_name}</TableCell>
                        <TableCell>{report.order_number}</TableCell>
                        <TableCell className="text-right">
                          {Number(report.km_final) - Number(report.km_initial)} km
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {Number(report.freight_value).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {report.observation && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                {report.observation}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditReport(report);
                              setEditFormData(report);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editReport} onOpenChange={() => setEditReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Parte Diária</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input
                  value={editFormData.customer_name || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Nº Pedido</Label>
                <Input
                  value={editFormData.order_number || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, order_number: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>KM Inicial</Label>
                  <Input
                    type="number"
                    value={editFormData.km_initial || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, km_initial: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KM Final</Label>
                  <Input
                    type="number"
                    value={editFormData.km_final || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, km_final: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Valor do Frete</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editFormData.freight_value || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, freight_value: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Observação</Label>
                <Textarea
                  value={editFormData.observation || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, observation: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditReport(null)}>
                Cancelar
              </Button>
              <Button onClick={handleEditSave}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default DailyReportsAdmin;
