import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopMenu from '@/components/dashboard/TopMenu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Home, Camera, Trash2, Receipt, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VEHICLE_PLATES } from '@/types/driver';
import CameraCapture from '@/components/operations/CameraCapture';

const ExpenseEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    vehiclePlate: '',
    locationEquipment: '',
    description: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d,]/g, '');
    // Replace comma with dot for numeric operations later
    setFormData(prev => ({ ...prev, amount: value }));
  };

  const handleCapture = (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setShowCamera(false);
  };

  const handleRemoveImage = () => {
    setCapturedImage(null);
  };

  const uploadImage = async (base64Image: string): Promise<string | null> => {
    try {
      const base64Data = base64Image.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const fileName = `expense_${user?.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('expense-receipts')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('expense-receipts')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!formData.amount || !formData.vehiclePlate || !formData.locationEquipment) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const amountNum = parseFloat(formData.amount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Valor inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      let receiptUrl: string | null = null;
      if (capturedImage) {
        receiptUrl = await uploadImage(capturedImage);
      }

      const { error } = await supabase.from('driver_expenses').insert({
        user_id: user.id,
        user_name: user.name,
        amount: amountNum,
        vehicle_plate: formData.vehiclePlate,
        location_equipment: formData.locationEquipment,
        description: formData.description || null,
        receipt_image_url: receiptUrl,
      });

      if (error) throw error;

      toast.success('Despesa registrada com sucesso!');
      navigate('/motorista');
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Erro ao salvar despesa');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <main className="pt-16 pb-8 px-4 max-w-2xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            <Home className="h-4 w-4 mr-1" />
            Início
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/motorista')}
            className="border-primary text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao Painel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-500" />
              Lançar Nova Despesa
            </CardTitle>
            <CardDescription>
              Preencha os detalhes da despesa realizada durante a viagem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor da Despesa (R$) *</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="Ex: 25,50"
                value={formData.amount}
                onChange={handleAmountChange}
              />
            </div>

            {/* Vehicle Plate */}
            <div className="space-y-2">
              <Label htmlFor="vehiclePlate">Placa do Caminhão *</Label>
              <Select
                value={formData.vehiclePlate}
                onValueChange={(value) => handleInputChange('vehiclePlate', value)}
              >
                <SelectTrigger id="vehiclePlate">
                  <SelectValue placeholder="Selecione uma placa..." />
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

            {/* Location/Equipment */}
            <div className="space-y-2">
              <Label htmlFor="locationEquipment">Local ou Equipamento *</Label>
              <Input
                id="locationEquipment"
                type="text"
                placeholder="Ex: Posto Central, Peça do motor..."
                value={formData.locationEquipment}
                onChange={(e) => handleInputChange('locationEquipment', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Adicional (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Detalhes extras sobre a despesa..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Receipt Photo */}
            <div className="space-y-2">
              <Label>Foto do Comprovante (Opcional)</Label>
              {capturedImage ? (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Comprovante"
                    className="w-full max-h-48 object-contain rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-24 border-dashed"
                  onClick={() => setShowCamera(true)}
                >
                  <Camera className="h-6 w-6 mr-2" />
                  Abrir Câmera
                </Button>
              )}
            </div>

            {/* Submit Button */}
            <Button
              className="w-full h-12 text-lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Receipt className="h-5 w-5 mr-2" />
                  Enviar Despesa
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ExpenseEntry;
