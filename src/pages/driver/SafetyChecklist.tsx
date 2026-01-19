import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopMenu from '@/components/dashboard/TopMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VEHICLE_PLATES, CHECKLIST_QUESTIONS, ChecklistAnswer } from '@/types/driver';
import { ArrowLeft, Check, X, Minus, ArrowRight } from 'lucide-react';

const SafetyChecklist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'plate' | 'questions' | 'complete'>('plate');
  const [selectedPlate, setSelectedPlate] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer>>({});
  const [loading, setLoading] = useState(false);

  const handleStartChecklist = () => {
    if (!selectedPlate) {
      toast.error('Selecione a placa do veículo');
      return;
    }
    setStep('questions');
  };

  const handleAnswer = async (answer: ChecklistAnswer) => {
    const question = CHECKLIST_QUESTIONS[currentQuestion];
    const newAnswers = { ...answers, [question.key]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < CHECKLIST_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, save to database
      await saveChecklist(newAnswers);
    }
  };

  const saveChecklist = async (finalAnswers: Record<string, ChecklistAnswer>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setLoading(true);

    try {
      const hasRepairsNeeded = Object.values(finalAnswers).some(answer => answer === 'não');

      const { error } = await supabase
        .from('safety_checklists')
        .insert({
          user_id: user.id,
          user_name: user.name,
          vehicle_plate: selectedPlate,
          ...finalAnswers,
          has_repairs_needed: hasRepairsNeeded,
        });

      if (error) throw error;

      setStep('complete');
      toast.success('Checklist salvo com sucesso!');
      
      setTimeout(() => {
        navigate('/motorista');
      }, 2000);
    } catch (error) {
      console.error('Error saving checklist:', error);
      toast.error('Erro ao salvar checklist');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / CHECKLIST_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <main className="pt-16 pb-8 px-4 max-w-2xl mx-auto">
        <Button
          variant="outline"
          className="mb-4 border-2 border-primary text-primary hover:bg-primary hover:text-white"
          onClick={() => {
            if (step === 'questions' && currentQuestion > 0) {
              setCurrentQuestion(currentQuestion - 1);
            } else if (step === 'questions') {
              setStep('plate');
            } else {
              navigate('/motorista');
            }
          }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar ao Painel
        </Button>

        {step === 'plate' && (
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Selecione a placa do veículo para iniciar o checklist de segurança semanal.
              </p>
              
              <div className="space-y-2">
                <Label>Placa do Veículo</Label>
                <Select value={selectedPlate} onValueChange={setSelectedPlate}>
                  <SelectTrigger className="text-lg h-14">
                    <SelectValue placeholder="Selecione a placa" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_PLATES.map((v) => (
                      <SelectItem key={v.plate} value={v.plate} className="text-lg py-3">
                        {v.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleStartChecklist} 
                className="w-full h-14 text-lg"
                disabled={!selectedPlate}
              >
                Iniciar Checklist
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'questions' && (
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Pergunta {currentQuestion + 1} de {CHECKLIST_QUESTIONS.length}</span>
                <span className="font-medium">{selectedPlate}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center py-6">
                <h2 className="text-xl font-semibold text-foreground leading-relaxed">
                  {CHECKLIST_QUESTIONS[currentQuestion].question}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleAnswer('sim')}
                  className="h-20 flex flex-col gap-2 bg-green-500 hover:bg-green-600 text-white"
                  disabled={loading}
                >
                  <Check className="h-8 w-8" />
                  <span className="text-lg font-semibold">Sim</span>
                </Button>
                
                <Button
                  onClick={() => handleAnswer('não')}
                  className="h-20 flex flex-col gap-2 bg-red-500 hover:bg-red-600 text-white"
                  disabled={loading}
                >
                  <X className="h-8 w-8" />
                  <span className="text-lg font-semibold">Não</span>
                </Button>
                
                <Button
                  onClick={() => handleAnswer('não se aplica')}
                  variant="secondary"
                  className="h-20 flex flex-col gap-2"
                  disabled={loading}
                >
                  <Minus className="h-8 w-8" />
                  <span className="text-sm font-semibold">N/A</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Checklist Concluído!
              </h2>
              <p className="text-muted-foreground">
                O checklist de segurança foi salvo com sucesso.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Redirecionando para o painel...
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SafetyChecklist;
