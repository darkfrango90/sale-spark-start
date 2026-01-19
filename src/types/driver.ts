export interface DailyReport {
  id: string;
  user_id: string;
  user_name: string;
  vehicle_plate: string;
  customer_name: string;
  order_number: string;
  km_initial: number;
  km_final: number;
  freight_value: number;
  observation?: string;
  signature: string;
  created_at: string;
}

export interface SafetyChecklist {
  id: string;
  user_id: string;
  user_name: string;
  vehicle_plate: string;
  agua_radiador: ChecklistAnswer;
  oleo_motor: ChecklistAnswer;
  oleo_hidraulico: ChecklistAnswer;
  fluido_freio: ChecklistAnswer;
  pneus_calibrados: ChecklistAnswer;
  pneus_estado: ChecklistAnswer;
  farois_funcionando: ChecklistAnswer;
  lanternas_funcionando: ChecklistAnswer;
  setas_funcionando: ChecklistAnswer;
  freio_servico: ChecklistAnswer;
  freio_estacionamento: ChecklistAnswer;
  limpador_parabrisa: ChecklistAnswer;
  buzina: ChecklistAnswer;
  espelhos_retrovisores: ChecklistAnswer;
  cinto_seguranca: ChecklistAnswer;
  extintor_incendio: ChecklistAnswer;
  triangulo_sinalizacao: ChecklistAnswer;
  macaco_chave_roda: ChecklistAnswer;
  documentos_veiculo: ChecklistAnswer;
  estepe_estado: ChecklistAnswer;
  limpeza_geral: ChecklistAnswer;
  has_repairs_needed: boolean;
  created_at: string;
}

export interface MaintenanceReport {
  id: string;
  user_id: string;
  user_name: string;
  vehicle_plate: string;
  problem_description: string;
  status: 'pendente' | 'concluído';
  resolution_date?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export type ChecklistAnswer = 'sim' | 'não' | 'não se aplica';

export const VEHICLE_PLATES = [
  { plate: 'RSC7D05', multiplier: 6 },
  { plate: 'RSC5I45', multiplier: 6 },
  { plate: 'RSC3G57', multiplier: 6 },
  { plate: 'RSC3D46', multiplier: 6 },
  { plate: 'QWF1G05', multiplier: 12 },
  { plate: 'QWM1B96', multiplier: 12 },
  { plate: 'MWQ5551', multiplier: 12 },
  { plate: 'QWE3E38', multiplier: 12 },
] as const;

export const CHECKLIST_QUESTIONS = [
  { key: 'agua_radiador', question: 'Nível de água do radiador está OK?' },
  { key: 'oleo_motor', question: 'Nível de óleo do motor está OK?' },
  { key: 'oleo_hidraulico', question: 'Nível de óleo hidráulico está OK?' },
  { key: 'fluido_freio', question: 'Nível de fluido de freio está OK?' },
  { key: 'pneus_calibrados', question: 'Pneus estão calibrados?' },
  { key: 'pneus_estado', question: 'Estado dos pneus está OK?' },
  { key: 'farois_funcionando', question: 'Faróis estão funcionando?' },
  { key: 'lanternas_funcionando', question: 'Lanternas estão funcionando?' },
  { key: 'setas_funcionando', question: 'Setas/indicadores estão funcionando?' },
  { key: 'freio_servico', question: 'Freio de serviço está OK?' },
  { key: 'freio_estacionamento', question: 'Freio de estacionamento está OK?' },
  { key: 'limpador_parabrisa', question: 'Limpador de para-brisa está OK?' },
  { key: 'buzina', question: 'Buzina está funcionando?' },
  { key: 'espelhos_retrovisores', question: 'Espelhos retrovisores estão OK?' },
  { key: 'cinto_seguranca', question: 'Cinto de segurança está OK?' },
  { key: 'extintor_incendio', question: 'Extintor de incêndio está OK?' },
  { key: 'triangulo_sinalizacao', question: 'Triângulo de sinalização está presente?' },
  { key: 'macaco_chave_roda', question: 'Macaco e chave de roda estão OK?' },
  { key: 'documentos_veiculo', question: 'Documentos do veículo estão em dia?' },
  { key: 'estepe_estado', question: 'Estepe está em bom estado?' },
  { key: 'limpeza_geral', question: 'Limpeza geral do veículo está OK?' },
] as const;

export const getPlateMultiplier = (plate: string): number => {
  const found = VEHICLE_PLATES.find(v => v.plate === plate);
  return found?.multiplier ?? 6;
};
