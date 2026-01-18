import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw, Loader2 } from "lucide-react";

interface TicketData {
  peso_bruto_kg?: number | null;
  peso_liquido_kg?: number | null;
  tara_kg?: number | null;
  data_hora?: string | null;
  confianca: number;
}

interface TicketResultProps {
  ticketData: TicketData;
  expectedWeightKg: number;
  capturedImage: string;
  isLoading: boolean;
  onConfirm: () => void;
  onRetake: () => void;
  onCancel: () => void;
}

const TicketResult = ({
  ticketData,
  expectedWeightKg,
  capturedImage,
  isLoading,
  onConfirm,
  onRetake,
  onCancel
}: TicketResultProps) => {
  const ticketWeightKg = ticketData.peso_liquido_kg || 0;
  const differenceKg = ticketWeightKg - expectedWeightKg;
  const differencePercent = expectedWeightKg > 0 
    ? (differenceKg / expectedWeightKg) * 100 
    : 0;
  
  const absDifferencePercent = Math.abs(differencePercent);
  
  // Determine status
  const isOk = absDifferencePercent <= 5;
  const isWarning = absDifferencePercent > 5 && absDifferencePercent <= 10;
  const isError = absDifferencePercent > 10;
  const couldNotRead = !ticketData.peso_liquido_kg;

  const formatWeight = (kg: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(kg)) + ' Kg';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6">
        <div className="w-40 h-40 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img 
            src={`data:image/jpeg;base64,${capturedImage}`}
            alt="Ticket capturado"
            className="w-full h-full object-cover"
          />
        </div>
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl font-semibold text-foreground">Analisando ticket...</p>
        <p className="text-muted-foreground mt-2">Aguarde alguns segundos</p>
      </div>
    );
  }

  if (couldNotRead) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col p-6">
        <div className="flex-1 flex flex-col items-center justify-center">
          <XCircle className="h-20 w-20 text-destructive mb-6" />
          <p className="text-2xl font-bold text-foreground mb-2">NÃO FOI POSSÍVEL LER</p>
          <p className="text-muted-foreground text-center mb-8">
            Tente tirar uma foto mais nítida do ticket
          </p>
          
          <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg mb-8">
            <img 
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="Ticket capturado"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-3 pb-safe">
          <Button
            onClick={onRetake}
            size="lg"
            className="w-full h-16 text-lg font-semibold"
          >
            <RotateCcw className="h-6 w-6 mr-3" />
            TIRAR OUTRA FOTO
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="w-full h-14 text-base"
          >
            CANCELAR
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Status Icon */}
        {isOk && <CheckCircle2 className="h-24 w-24 text-green-500 mb-4" />}
        {isWarning && <AlertTriangle className="h-24 w-24 text-yellow-500 mb-4" />}
        {isError && <AlertTriangle className="h-24 w-24 text-orange-500 mb-4" />}

        {/* Status Text */}
        <p className="text-3xl font-bold text-foreground mb-2">
          {isOk ? "PESO CONFERE!" : "PESO DIFERENTE!"}
        </p>

        {/* Weight Comparison */}
        <div className="w-full max-w-sm space-y-4 mt-6">
          <div className="flex justify-between items-center p-4 bg-muted rounded-xl">
            <span className="text-lg text-muted-foreground">Esperado:</span>
            <span className="text-xl font-bold">{formatWeight(expectedWeightKg)}</span>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-muted rounded-xl">
            <span className="text-lg text-muted-foreground">Ticket:</span>
            <span className="text-xl font-bold text-primary">{formatWeight(ticketWeightKg)}</span>
          </div>
          
          <div className={`flex justify-between items-center p-4 rounded-xl ${
            isOk ? 'bg-green-100 dark:bg-green-900/30' : 
            isWarning ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
            'bg-orange-100 dark:bg-orange-900/30'
          }`}>
            <span className="text-lg text-muted-foreground">Diferença:</span>
            <span className={`text-xl font-bold ${
              isOk ? 'text-green-600 dark:text-green-400' : 
              isWarning ? 'text-yellow-600 dark:text-yellow-400' : 
              'text-orange-600 dark:text-orange-400'
            }`}>
              {differenceKg >= 0 ? '+' : ''}{formatWeight(differenceKg)} ({differencePercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Ticket image preview */}
        <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg mt-6">
          <img 
            src={`data:image/jpeg;base64,${capturedImage}`}
            alt="Ticket capturado"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-safe">
        <Button
          onClick={onConfirm}
          size="lg"
          className={`w-full h-16 text-lg font-semibold ${
            isOk ? 'bg-green-600 hover:bg-green-700' : 
            isWarning ? 'bg-yellow-600 hover:bg-yellow-700' : 
            'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          <CheckCircle2 className="h-6 w-6 mr-3" />
          {isOk ? "CONFIRMAR" : "CONFIRMAR MESMO ASSIM"}
        </Button>
        
        <Button
          onClick={onRetake}
          variant="outline"
          size="lg"
          className="w-full h-14 text-base"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          REFAZER FOTO
        </Button>
        
        <Button
          onClick={onCancel}
          variant="ghost"
          size="lg"
          className="w-full h-12 text-base text-muted-foreground"
        >
          CANCELAR
        </Button>
      </div>
    </div>
  );
};

export default TicketResult;
