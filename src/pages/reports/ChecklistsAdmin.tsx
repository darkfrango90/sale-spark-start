import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopMenu from '@/components/dashboard/TopMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SafetyChecklist, CHECKLIST_QUESTIONS, VEHICLE_PLATES } from '@/types/driver';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ArrowLeft, FileDown, AlertTriangle, Check, X, Minus } from 'lucide-react';

const ChecklistsAdmin = () => {
  const navigate = useNavigate();
  const { users } = useAuth();
  const [checklists, setChecklists] = useState<SafetyChecklist[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedPlate, setSelectedPlate] = useState('all');

  useEffect(() => {
    loadChecklists();
  }, [startDate, endDate, selectedDriver, selectedPlate]);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('safety_checklists')
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

      const { data, error } = await query;
      if (error) throw error;
      setChecklists((data || []) as SafetyChecklist[]);
    } catch (error) {
      console.error('Error loading checklists:', error);
      toast.error('Erro ao carregar checklists');
    } finally {
      setLoading(false);
    }
  };

  const getAnswerIcon = (answer: string) => {
    switch (answer) {
      case 'sim':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'não':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAnswerBadge = (answer: string) => {
    switch (answer) {
      case 'sim':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Sim</Badge>;
      case 'não':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Não</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const exportChecklistToPDF = (checklist: SafetyChecklist) => {
    let content = `
CHECKLIST DE SEGURANÇA VEICULAR
================================

Data: ${format(new Date(checklist.created_at), 'dd/MM/yyyy HH:mm')}
Colaborador: ${checklist.user_name}
Placa: ${checklist.vehicle_plate}
Status: ${checklist.has_repairs_needed ? 'COM REPAROS NECESSÁRIOS' : 'SEM PROBLEMAS'}

=== ITENS VERIFICADOS ===

`;

    CHECKLIST_QUESTIONS.forEach((q) => {
      const answer = checklist[q.key as keyof SafetyChecklist] as string;
      const status = answer === 'sim' ? '✓' : answer === 'não' ? '✗' : '-';
      content += `${status} ${q.question}: ${answer.toUpperCase()}\n`;
    });

    content += `
================================
Assinatura Digital: ${checklist.user_name}
`;

    // Create and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-${checklist.vehicle_plate}-${format(new Date(checklist.created_at), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Checklist exportado com sucesso');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <main className="pt-16 pb-8 px-4 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/relatorios')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-2xl font-bold mb-6">Checklists de Segurança</h1>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Checklists List */}
        <Card>
          <CardHeader>
            <CardTitle>Registros ({checklists.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : checklists.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum checklist encontrado
              </p>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {checklists.map((checklist) => (
                  <AccordionItem
                    key={checklist.id}
                    value={checklist.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">
                            {format(new Date(checklist.created_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                          <span className="text-muted-foreground">{checklist.user_name}</span>
                          <span className="font-mono text-sm">{checklist.vehicle_plate}</span>
                        </div>
                        {checklist.has_repairs_needed && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Com Reparos
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 pb-2">
                        <div className="grid gap-2">
                          {CHECKLIST_QUESTIONS.map((q) => {
                            const answer = checklist[q.key as keyof SafetyChecklist] as string;
                            return (
                              <div
                                key={q.key}
                                className={`flex items-center justify-between p-2 rounded ${
                                  answer === 'não' ? 'bg-red-50' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {getAnswerIcon(answer)}
                                  <span className="text-sm">{q.question}</span>
                                </div>
                                {getAnswerBadge(answer)}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportChecklistToPDF(checklist)}
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            Exportar PDF
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ChecklistsAdmin;
