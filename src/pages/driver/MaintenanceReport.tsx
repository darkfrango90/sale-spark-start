import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopMenu from '@/components/dashboard/TopMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VEHICLE_PLATES } from '@/types/driver';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';

const MaintenanceReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_plate: '',
    problem_description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!formData.vehicle_plate || !formData.problem_description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('maintenance_reports')
        .insert({
          user_id: user.id,
          user_name: user.name,
          vehicle_plate: formData.vehicle_plate,
          problem_description: formData.problem_description,
          status: 'pendente',
        });

      if (error) throw error;

      toast.success('Relatório de manutenção enviado com sucesso!');
      navigate('/motorista');
    } catch (error) {
      console.error('Error saving maintenance report:', error);
      toast.error('Erro ao enviar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <main className="pt-16 pb-8 px-4 max-w-2xl mx-auto">
        <Button
          variant="outline"
          className="mb-4 border-2 border-primary text-primary hover:bg-primary hover:text-white"
          onClick={() => navigate('/motorista')}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar ao Painel
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Relatar Problema de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vehicle_plate">Placa do Veículo *</Label>
                <Select
                  value={formData.vehicle_plate}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_plate: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione a placa" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_PLATES.map((v) => (
                      <SelectItem key={v.plate} value={v.plate}>
                        {v.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem_description">Descrição do Problema *</Label>
                <Textarea
                  id="problem_description"
                  value={formData.problem_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, problem_description: e.target.value }))}
                  placeholder="Descreva detalhadamente o problema encontrado no veículo..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Seja o mais detalhado possível para facilitar o diagnóstico.
                </p>
              </div>

              <Button type="submit" className="w-full h-12" disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Relatório'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MaintenanceReport;
