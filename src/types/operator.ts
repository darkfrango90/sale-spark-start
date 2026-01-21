export type ChecklistAnswer = 'sim' | 'não' | 'não se aplica';

export interface OperatorChecklist {
  id: string;
  user_id: string;
  user_name: string;
  equipment_id: string;
  nivel_oleo_motor: ChecklistAnswer;
  nivel_oleo_hidraulico: ChecklistAnswer;
  nivel_liquido_arrefecimento: ChecklistAnswer;
  filtro_ar_limpo: ChecklistAnswer;
  vazamentos_hidraulicos: ChecklistAnswer;
  mangueiras_hidraulicas: ChecklistAnswer;
  cilindros_hidraulicos: ChecklistAnswer;
  cacamba_estado: ChecklistAnswer;
  dentes_cacamba: ChecklistAnswer;
  articulacao_central: ChecklistAnswer;
  pinos_buchas: ChecklistAnswer;
  pneus_estado: ChecklistAnswer;
  pneus_calibragem: ChecklistAnswer;
  parafusos_rodas: ChecklistAnswer;
  display_balanca: ChecklistAnswer;
  calibracao_balanca: ChecklistAnswer;
  sensores_balanca: ChecklistAnswer;
  cabo_conexao_balanca: ChecklistAnswer;
  cintos_seguranca: ChecklistAnswer;
  extintor: ChecklistAnswer;
  espelhos_retrovisores: ChecklistAnswer;
  luzes_funcionando: ChecklistAnswer;
  alarme_re: ChecklistAnswer;
  limpador_parabrisa: ChecklistAnswer;
  ar_condicionado: ChecklistAnswer;
  comandos_operacionais: ChecklistAnswer;
  freios: ChecklistAnswer;
  buzina: ChecklistAnswer;
  has_repairs_needed: boolean;
  created_at: string;
}

export const EQUIPMENT_LIST = [
  { id: 'PA_CAT_938K', name: 'Pá Carregadeira CAT 938K' },
  { id: 'PA_CAT_950H', name: 'Pá Carregadeira CAT 950H' },
] as const;

export const OPERATOR_CHECKLIST_QUESTIONS = [
  // Motor e Fluidos (4)
  { key: 'nivel_oleo_motor', question: 'Nível do óleo do motor está OK?', category: 'Motor e Fluidos', icon: '🛢️' },
  { key: 'nivel_oleo_hidraulico', question: 'Nível do óleo hidráulico está OK?', category: 'Motor e Fluidos', icon: '🛢️' },
  { key: 'nivel_liquido_arrefecimento', question: 'Nível do líquido de arrefecimento está OK?', category: 'Motor e Fluidos', icon: '🌡️' },
  { key: 'filtro_ar_limpo', question: 'Filtro de ar está limpo/desobstruído?', category: 'Motor e Fluidos', icon: '💨' },
  
  // Sistema Hidráulico (3)
  { key: 'vazamentos_hidraulicos', question: 'Não há vazamentos no sistema hidráulico?', category: 'Sistema Hidráulico', icon: '💧' },
  { key: 'mangueiras_hidraulicas', question: 'Mangueiras hidráulicas estão em bom estado?', category: 'Sistema Hidráulico', icon: '🔧' },
  { key: 'cilindros_hidraulicos', question: 'Cilindros hidráulicos funcionando corretamente?', category: 'Sistema Hidráulico', icon: '⚙️' },
  
  // Caçamba e Estrutura (4)
  { key: 'cacamba_estado', question: 'Caçamba/concha está em bom estado?', category: 'Caçamba e Estrutura', icon: '🪣' },
  { key: 'dentes_cacamba', question: 'Dentes da caçamba estão em condições de uso?', category: 'Caçamba e Estrutura', icon: '🦷' },
  { key: 'articulacao_central', question: 'Articulação central funcionando normalmente?', category: 'Caçamba e Estrutura', icon: '🔗' },
  { key: 'pinos_buchas', question: 'Pinos e buchas estão lubrificados e sem folgas?', category: 'Caçamba e Estrutura', icon: '📍' },
  
  // Pneus e Rodas (3)
  { key: 'pneus_estado', question: 'Pneus estão em bom estado (sem cortes/danos)?', category: 'Pneus e Rodas', icon: '🛞' },
  { key: 'pneus_calibragem', question: 'Pneus estão com calibragem adequada?', category: 'Pneus e Rodas', icon: '🎯' },
  { key: 'parafusos_rodas', question: 'Parafusos das rodas estão todos apertados?', category: 'Pneus e Rodas', icon: '🔩' },
  
  // Sistema de Pesagem/Balança (4)
  { key: 'display_balanca', question: 'Display da balança está funcionando e legível?', category: 'Balança de Pesagem', icon: '📟' },
  { key: 'calibracao_balanca', question: 'Balança foi calibrada/zerada antes de iniciar?', category: 'Balança de Pesagem', icon: '⚖️' },
  { key: 'sensores_balanca', question: 'Sensores de peso estão limpos e sem obstruções?', category: 'Balança de Pesagem', icon: '📡' },
  { key: 'cabo_conexao_balanca', question: 'Cabos de conexão da balança estão íntegros?', category: 'Balança de Pesagem', icon: '🔌' },
  
  // Cabine e Segurança (7)
  { key: 'cintos_seguranca', question: 'Cinto de segurança está funcionando?', category: 'Cabine e Segurança', icon: '🪢' },
  { key: 'extintor', question: 'Extintor de incêndio está presente e válido?', category: 'Cabine e Segurança', icon: '🧯' },
  { key: 'espelhos_retrovisores', question: 'Espelhos retrovisores estão OK?', category: 'Cabine e Segurança', icon: '🪞' },
  { key: 'luzes_funcionando', question: 'Luzes (faróis, giroflex, traseiras) funcionando?', category: 'Cabine e Segurança', icon: '💡' },
  { key: 'alarme_re', question: 'Alarme de ré está funcionando?', category: 'Cabine e Segurança', icon: '🔔' },
  { key: 'limpador_parabrisa', question: 'Limpador de para-brisa está funcionando?', category: 'Cabine e Segurança', icon: '🌧️' },
  { key: 'ar_condicionado', question: 'Ar condicionado está funcionando?', category: 'Cabine e Segurança', icon: '❄️' },
  
  // Controles (3)
  { key: 'comandos_operacionais', question: 'Comandos/joysticks respondendo corretamente?', category: 'Controles', icon: '🕹️' },
  { key: 'freios', question: 'Sistema de freios está funcionando?', category: 'Controles', icon: '🛑' },
  { key: 'buzina', question: 'Buzina está funcionando?', category: 'Controles', icon: '📢' },
] as const;
