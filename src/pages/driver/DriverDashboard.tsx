import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopMenu from '@/components/dashboard/TopMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FileText, ClipboardCheck, Wrench, AlertTriangle, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, isMonday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showChecklistReminder, setShowChecklistReminder] = useState(false);
  const [stats, setStats] = useState({
    dailyReportsCount: 0,
    checklistsThisWeek: 0,
    pendingMaintenance: 0,
    expensesThisMonth: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
      checkWeeklyChecklist();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    // Count daily reports this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const { count: dailyCount } = await supabase
      .from('daily_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    // Count checklists this week
    const { count: checklistCount } = await supabase
      .from('safety_checklists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString());

    // Count pending maintenance reports
    const { count: maintenanceCount } = await supabase
      .from('maintenance_reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pendente');

    // Count expenses this month
    const { count: expensesCount } = await supabase
      .from('driver_expenses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    setStats({
      dailyReportsCount: dailyCount || 0,
      checklistsThisWeek: checklistCount || 0,
      pendingMaintenance: maintenanceCount || 0,
      expensesThisMonth: expensesCount || 0,
    });
  };

  const checkWeeklyChecklist = async () => {
    if (!user || !isMonday(new Date())) return;

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const { count } = await supabase
      .from('safety_checklists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString());

    if (count === 0) {
      setShowChecklistReminder(true);
    }
  };

  const menuCards = [
    {
      title: 'Registrar Parte Diária',
      description: 'Registre suas viagens e fretes realizados',
      icon: FileText,
      color: 'bg-blue-500',
      path: '/motorista/parte-diaria',
      stat: `${stats.dailyReportsCount} este mês`,
    },
    {
      title: 'Checklist de Segurança',
      description: 'Complete o checklist semanal do veículo',
      icon: ClipboardCheck,
      color: 'bg-green-500',
      path: '/motorista/checklist',
      stat: stats.checklistsThisWeek > 0 ? 'Completo esta semana' : 'Pendente',
      statColor: stats.checklistsThisWeek > 0 ? 'text-green-600' : 'text-amber-600',
    },
    {
      title: 'Relatar Manutenção',
      description: 'Informe problemas mecânicos do veículo',
      icon: Wrench,
      color: 'bg-amber-500',
      path: '/motorista/manutencao',
      stat: stats.pendingMaintenance > 0 ? `${stats.pendingMaintenance} pendente(s)` : 'Nenhum pendente',
      statColor: stats.pendingMaintenance > 0 ? 'text-amber-600' : 'text-green-600',
    },
    {
      title: 'Lançar Despesa',
      description: 'Registre despesas de viagem com comprovante',
      icon: Receipt,
      color: 'bg-purple-500',
      path: '/motorista/despesas',
      stat: `${stats.expensesThisMonth} este mês`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <main className="pt-16 pb-8 px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Bem-vindo, {user?.name || 'Motorista'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menuCards.map((card) => (
            <Card
              key={card.path}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate(card.path)}
            >
              <CardContent className="p-6">
                <div className={`${card.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                  <card.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
                <p className={`text-sm font-medium ${card.statColor || 'text-muted-foreground'}`}>
                  {card.stat}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Weekly Checklist Reminder Modal */}
      <Dialog open={showChecklistReminder} onOpenChange={setShowChecklistReminder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Lembrete de Checklist Semanal
            </DialogTitle>
            <DialogDescription>
              Você ainda não preencheu o checklist de segurança desta semana. 
              É importante realizar a verificação do veículo regularmente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowChecklistReminder(false)}>
              Fazer depois
            </Button>
            <Button onClick={() => {
              setShowChecklistReminder(false);
              navigate('/motorista/checklist');
            }}>
              Preencher agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverDashboard;
