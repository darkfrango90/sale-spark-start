import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Truck, Fuel, ClipboardCheck, LogOut, Package, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const OperatorPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChecklistReminder, setShowChecklistReminder] = useState(false);
  const [stats, setStats] = useState({
    loadingsToday: 0,
    fuelingsMonth: 0,
    checklistDone: false,
    pendingOrders: 0
  });

  useEffect(() => {
    if (user) {
      loadStats();
      checkDailyChecklist();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const today = new Date();
      const startOfDay = format(today, 'yyyy-MM-dd');
      const startOfMonth = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');

      // Loadings today
      const { count: loadingsCount } = await supabase
        .from('order_loadings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${startOfDay}T00:00:00`)
        .eq('operator_id', user?.id);

      // Fuelings this month
      const { count: fuelingsCount } = await supabase
        .from('fuel_entries')
        .select('*', { count: 'exact', head: true })
        .gte('date', startOfMonth)
        .eq('user_id', user?.id);

      // Pending orders count
      const { count: pendingCount } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'pedido')
        .eq('status', 'pendente');

      setStats(prev => ({
        ...prev,
        loadingsToday: loadingsCount || 0,
        fuelingsMonth: fuelingsCount || 0,
        pendingOrders: pendingCount || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const checkDailyChecklist = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data: checklists } = await supabase
        .from('operator_checklists')
        .select('id')
        .eq('user_id', user?.id)
        .gte('created_at', `${today}T00:00:00`)
        .limit(1);

      const checklistDone = (checklists?.length || 0) > 0;
      setStats(prev => ({ ...prev, checklistDone }));

      // Show reminder if checklist not done today
      if (!checklistDone) {
        setShowChecklistReminder(true);
      }
    } catch (error) {
      console.error('Erro ao verificar checklist:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuCards = [
    {
      title: 'Carregamento',
      description: 'Confirme carregamentos com foto do ticket de pesagem',
      icon: Truck,
      path: '/operador/carregamento',
      color: 'bg-blue-500',
      stat: `${stats.pendingOrders} pendente${stats.pendingOrders !== 1 ? 's' : ''}`
    },
    {
      title: 'Abastecimento',
      description: 'Registre abastecimentos de veículos e máquinas',
      icon: Fuel,
      path: '/operacao/abastecimento',
      color: 'bg-amber-500',
      stat: `${stats.fuelingsMonth} este mês`
    },
    {
      title: 'Checklist da Máquina',
      description: 'Complete o checklist diário da pá carregadeira',
      icon: ClipboardCheck,
      path: '/operador/checklist',
      color: stats.checklistDone ? 'bg-green-500' : 'bg-orange-500',
      stat: stats.checklistDone ? 'Completo hoje' : 'Pendente'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Painel do Operador</h1>
              {user && <span className="text-slate-400 text-sm">{user.name}</span>}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            className="text-white hover:bg-slate-700 h-12 w-12"
          >
            <LogOut className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Welcome message */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-white">
            Bem-vindo, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-slate-400 mt-1 flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.loadingsToday}</div>
              <div className="text-xs text-slate-400">Carregamentos Hoje</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{stats.fuelingsMonth}</div>
              <div className="text-xs text-slate-400">Abastecimentos Mês</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 text-center">
              {stats.checklistDone ? (
                <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto" />
              ) : (
                <AlertCircle className="h-6 w-6 text-orange-400 mx-auto" />
              )}
              <div className="text-xs text-slate-400 mt-1">Checklist</div>
            </CardContent>
          </Card>
        </div>

        {/* Action cards */}
        <div className="space-y-4">
          {menuCards.map((card) => (
            <Card 
              key={card.path}
              className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-all active:scale-[0.98]"
              onClick={() => navigate(card.path)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`${card.color} p-4 rounded-xl`}>
                  <card.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{card.title}</h3>
                  <p className="text-slate-400 text-sm">{card.description}</p>
                  <span className="text-xs text-slate-500 mt-1 inline-block">{card.stat}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Checklist reminder dialog */}
      <Dialog open={showChecklistReminder} onOpenChange={setShowChecklistReminder}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              Checklist Diário Pendente
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Você ainda não completou o checklist de segurança da máquina hoje. 
              É importante verificar todos os itens antes de iniciar a operação.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowChecklistReminder(false)}
              className="border-slate-600 text-slate-300"
            >
              Fazer depois
            </Button>
            <Button 
              onClick={() => {
                setShowChecklistReminder(false);
                navigate('/operador/checklist');
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Fazer Checklist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperatorPanel;
