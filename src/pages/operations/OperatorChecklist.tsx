import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { EQUIPMENT_LIST, OPERATOR_CHECKLIST_QUESTIONS, ChecklistAnswer } from "@/types/operator";

type Step = 'equipment' | 'questions' | 'complete';

const OperatorChecklist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('equipment');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer>>({});
  const [isSaving, setIsSaving] = useState(false);

  const totalQuestions = OPERATOR_CHECKLIST_QUESTIONS.length;
  const progress = (currentQuestion / totalQuestions) * 100;
  const currentQ = OPERATOR_CHECKLIST_QUESTIONS[currentQuestion];

  const handleStartChecklist = () => {
    if (!selectedEquipment) {
      toast.error('Selecione o equipamento');
      return;
    }
    setStep('questions');
  };

  const handleAnswer = async (answer: ChecklistAnswer) => {
    const newAnswers = {
      ...answers,
      [currentQ.key]: answer
    };
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      await saveChecklist(newAnswers);
    }
  };

  const saveChecklist = async (finalAnswers: Record<string, ChecklistAnswer>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const hasRepairsNeeded = Object.values(finalAnswers).some(a => a === 'não');

      const checklistData = {
        user_id: user.id,
        user_name: user.name,
        equipment_id: selectedEquipment,
        ...finalAnswers,
        has_repairs_needed: hasRepairsNeeded
      };

      const { error } = await supabase
        .from('operator_checklists')
        .insert(checklistData);

      if (error) throw error;

      setStep('complete');
      
      if (hasRepairsNeeded) {
        toast.warning('Checklist salvo! Alguns itens precisam de atenção.');
      } else {
        toast.success('Checklist completado com sucesso!');
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/operador');
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast.error('Erro ao salvar checklist');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 'questions' && currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (step === 'questions') {
      setStep('equipment');
    } else {
      navigate('/operador');
    }
  };

  const equipmentName = EQUIPMENT_LIST.find(e => e.id === selectedEquipment)?.name || '';

  // Equipment selection step
  if (step === 'equipment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/operador')}
          className="mb-6 border-slate-600 text-slate-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Painel
        </Button>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Checklist da Máquina</h1>
              <p className="text-slate-400 mt-2">
                Verifique 28 itens de segurança da pá carregadeira antes de iniciar a operação
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">
                Selecione o Equipamento
              </label>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger className="h-14 text-lg bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Escolha a máquina..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {EQUIPMENT_LIST.map((eq) => (
                    <SelectItem 
                      key={eq.id} 
                      value={eq.id}
                      className="text-white hover:bg-slate-600"
                    >
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleStartChecklist}
              disabled={!selectedEquipment}
              className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600"
            >
              Iniciar Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Questions step
  if (step === 'questions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        {/* Header with progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <span className="text-slate-400 text-sm">
              {currentQuestion + 1} de {totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Equipment info */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full text-sm text-slate-300">
            <Package className="h-4 w-4" />
            {equipmentName}
          </span>
        </div>

        {/* Category badge */}
        <div className="text-center mb-6">
          <span className="text-orange-400 text-sm font-medium">
            {currentQ.category}
          </span>
        </div>

        {/* Question card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-6 text-center">
            <div className="text-5xl mb-4">{currentQ.icon}</div>
            <h2 className="text-xl text-white font-medium leading-relaxed">
              {currentQ.question}
            </h2>
          </CardContent>
        </Card>

        {/* Answer buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => handleAnswer('sim')}
            disabled={isSaving}
            className="h-16 text-lg bg-green-600 hover:bg-green-700 text-white"
          >
            ✓ Sim
          </Button>
          <Button
            onClick={() => handleAnswer('não')}
            disabled={isSaving}
            className="h-16 text-lg bg-red-600 hover:bg-red-700 text-white"
          >
            ✗ Não
          </Button>
          <Button
            onClick={() => handleAnswer('não se aplica')}
            disabled={isSaving}
            className="h-16 text-lg bg-slate-600 hover:bg-slate-500 text-white"
          >
            N/A
          </Button>
        </div>
      </div>
    );
  }

  // Complete step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
        <CardContent className="p-8 text-center">
          {Object.values(answers).some(a => a === 'não') ? (
            <>
              <div className="bg-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Checklist Salvo com Alertas
              </h1>
              <p className="text-slate-400">
                Alguns itens precisam de atenção ou manutenção. Comunique ao responsável antes de operar.
              </p>
            </>
          ) : (
            <>
              <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Checklist Completo!
              </h1>
              <p className="text-slate-400">
                Todos os itens foram verificados. Máquina liberada para operação.
              </p>
            </>
          )}
          <p className="text-slate-500 text-sm mt-4">
            Redirecionando em 3 segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatorChecklist;
