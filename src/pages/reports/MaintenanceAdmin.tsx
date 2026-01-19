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
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceReport, VEHICLE_PLATES } from '@/types/driver';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowLeft, FileDown, Check, RotateCcw, Calendar } from 'lucide-react';

const MaintenanceAdmin = () => {
  const navigate = useNavigate();
  const { users, user: currentUser } = useAuth();
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [completeDialog, setCompleteDialog] = useState<MaintenanceReport | null>(null);
  const [resolutionDate, setResolutionDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Filters
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedPlate, setSelectedPlate] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadReports();
  }, [startDate, endDate, selectedDriver, selectedPlate, selectedStatus]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('maintenance_reports')
        .select('*')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false });

      if (selectedDriver !== 'all') {
        query = query.eq('user_id', selectedDriver);
      }

      if (selectedPlate !== 'all') {
        query = query.eq('vehicle_plate', selectedPlate);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports((data || []) as MaintenanceReport[]);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!completeDialog || !currentUser) return;

    try {
      const { error } = await supabase
        .from('maintenance_reports')
        .update({
          status: 'concluído',
          resolution_date: resolutionDate,
          resolved_by: currentUser.name,
        })
        .eq('id', completeDialog.id);

      if (error) throw error;

      toast.success('Manutenção concluída com sucesso');
      setCompleteDialog(null);
      loadReports();
    } catch (error) {
      console.error('Error completing maintenance:', error);
      toast.error('Erro ao concluir manutenção');
    }
  };

  const handleReopen = async (report: MaintenanceReport) => {
    try {
      const { error } = await supabase
        .from('maintenance_reports')
        .update({
          status: 'pendente',
          resolution_date: null,
          resolved_by: null,
        })
        .eq('id', report.id);

      if (error) throw error;

      toast.success('Manutenção reaberta com sucesso');
      loadReports();
    } catch (error) {
      console.error('Error reopening maintenance:', error);
      toast.error('Erro ao reabrir manutenção');
    }
  };

  const exportToPDF = () => {
    let content = `
RELATÓRIO DE MANUTENÇÕES
Período: ${format(new Date(startDate), 'dd/MM/yyyy')} a ${format(new Date(endDate), 'dd/MM/yyyy')}

`;

    const pendingCount = reports.filter(r => r.status === 'pendente').length;
    const completedCount = reports.filter(r => r.status === 'concluído').length;

    content += `
RESUMO:
- Total: ${reports.length}
- Pendentes: ${pendingCount}
- Concluídos: ${completedCount}

=== DETALHAMENTO ===
`;

    reports.forEach((report) => {
      content += `
---
Data: ${format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}
Placa: ${report.vehicle_plate}
Colaborador: ${report.user_name}
Status: ${report.status.toUpperCase()}
${report.resolution_date ? `Concluído em: ${format(new Date(report.resolution_date), 'dd/MM/yyyy')}` : ''}
${report.resolved_by ? `Resolvido por: ${report.resolved_by}` : ''}

Descrição do Problema:
${report.problem_description}
`;
    });

    // Create and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manutencoes-${startDate}-${endDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado com sucesso');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <main className="pt-28 pb-8 px-4 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/relatorios')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestão de Manutenções</h1>
          <Button onClick={exportToPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <Label>Colaborador</Label>
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
              <div className="space-y-2">
                <Label>Placa</Label>
                <Select value={selectedPlate} onValueChange={setSelectedPlate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {VEHICLE_PLATES.map((v) => (
                      <SelectItem key={v.plate} value={v.plate}>
                        {v.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="concluído">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios ({reports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead className="max-w-xs">Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conclusão</TableHead>
                    <TableHead className="text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum relatório encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {format(new Date(report.created_at), 'dd/MM/yy')}
                        </TableCell>
                        <TableCell className="font-mono">{report.vehicle_plate}</TableCell>
                        <TableCell>{report.user_name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {report.problem_description}
                        </TableCell>
                        <TableCell>
                          {report.status === 'pendente' ? (
                            <Badge variant="destructive">Pendente</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Concluído
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {report.resolution_date
                            ? format(new Date(report.resolution_date), 'dd/MM/yy')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {report.status === 'pendente' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setCompleteDialog(report);
                                setResolutionDate(format(new Date(), 'yyyy-MM-dd'));
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Concluir
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReopen(report)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Reabrir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Complete Dialog */}
        <Dialog open={!!completeDialog} onOpenChange={() => setCompleteDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Concluir Manutenção</DialogTitle>
              <DialogDescription>
                Informe a data de conclusão da manutenção do veículo {completeDialog?.vehicle_plate}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data da Resolução
                </Label>
                <Input
                  type="date"
                  value={resolutionDate}
                  onChange={(e) => setResolutionDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCompleteDialog(null)}>
                Cancelar
              </Button>
              <Button onClick={handleComplete}>
                <Check className="h-4 w-4 mr-2" />
                Confirmar Conclusão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MaintenanceAdmin;
