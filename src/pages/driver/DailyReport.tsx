import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopMenu from '@/components/dashboard/TopMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VEHICLE_PLATES } from '@/types/driver';
import { ArrowLeft, Send } from 'lucide-react';

const DailyReport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_plate: '',
    customer_name: '',
    order_number: '',
    km_initial: '',
    km_final: '',
    freight_value: '',
    observation: '',
    signature: user?.name || '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, signature: user.name }));
      loadLastKm();
    }
  }, [user]);

  const loadLastKm = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('daily_reports')
      .select('km_final')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data?.km_final) {
      setFormData(prev => ({ ...prev, km_initial: String(data.km_final) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Validate required fields
    if (!formData.vehicle_plate || !formData.customer_name || !formData.order_number || 
        !formData.km_initial || !formData.km_final || !formData.freight_value || !formData.signature) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const kmInitial = parseFloat(formData.km_initial);
    const kmFinal = parseFloat(formData.km_final);

    if (isNaN(kmInitial) || isNaN(kmFinal)) {
      toast.error('KM Inicial e Final devem ser números válidos');
      return;
    }

    if (kmFinal < kmInitial) {
      toast.error('KM Final deve ser maior ou igual ao KM Inicial');
      return;
    }

    const freightValue = parseFloat(formData.freight_value);
    if (isNaN(freightValue) || freightValue < 0) {
      toast.error('Valor do frete deve ser um número válido');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('daily_reports')
        .insert({
          user_id: user.id,
          user_name: user.name,
          vehicle_plate: formData.vehicle_plate,
          customer_name: formData.customer_name,
          order_number: formData.order_number,
          km_initial: kmInitial,
          km_final: kmFinal,
          freight_value: freightValue,
          observation: formData.observation || null,
          signature: formData.signature,
        });

      if (error) throw error;

      toast.success('Parte diária registrada com sucesso!');
      navigate('/motorista');
    } catch (error) {
      console.error('Error saving daily report:', error);
      toast.error('Erro ao salvar parte diária');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <main className="pt-28 pb-8 px-4 max-w-2xl mx-auto">
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
            <CardTitle>Registrar Parte Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_plate">Placa do Veículo *</Label>
                <Select
                  value={formData.vehicle_plate}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_plate: value }))}
                >
                  <SelectTrigger>
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
                <Label htmlFor="customer_name">Nome do Cliente *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Digite o nome do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_number">Número do Pedido *</Label>
                <Input
                  id="order_number"
                  value={formData.order_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                  placeholder="Digite o número do pedido"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="km_initial">KM Inicial *</Label>
                  <Input
                    id="km_initial"
                    type="number"
                    value={formData.km_initial}
                    onChange={(e) => setFormData(prev => ({ ...prev, km_initial: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="km_final">KM Final *</Label>
                  <Input
                    id="km_final"
                    type="number"
                    value={formData.km_final}
                    onChange={(e) => setFormData(prev => ({ ...prev, km_final: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freight_value">Valor do Frete (R$) *</Label>
                <Input
                  id="freight_value"
                  type="number"
                  step="0.01"
                  value={formData.freight_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, freight_value: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observation">Observação (opcional)</Label>
                <Textarea
                  id="observation"
                  value={formData.observation}
                  onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
                  placeholder="Digite observações sobre a viagem..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">Assinatura *</Label>
                <Input
                  id="signature"
                  value={formData.signature}
                  onChange={(e) => setFormData(prev => ({ ...prev, signature: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Parte Diária'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DailyReport;
