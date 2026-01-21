export interface Permission {
  module: string;
  actions: string[];
}

export interface User {
  id: string;
  accessCode: string;
  name: string;
  cpf: string;
  role: 'diretor' | 'gerente' | 'vendedor' | 'caixa' | 'administrativo' | 'motorista' | 'operador';
  permissions: Permission[];
  active: boolean;
  createdAt: Date;
}

export const ROLES = {
  diretor: 'Diretor',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
  caixa: 'Caixa',
  administrativo: 'Administrativo',
  motorista: 'Motorista',
  operador: 'Operador',
} as const;

export const MODULES = {
  cadastro: {
    label: 'Cadastro',
    actions: ['Clientes', 'Produtos', 'Fornecedores'],
  },
  vendas: {
    label: 'Vendas',
    actions: ['Nova Venda', 'Orçamentos', 'Pedidos'],
  },
  operacao: {
    label: 'Operação',
    actions: ['Operador', 'Carregados', 'Abastecimento', 'Veículos'],
  },
  motorista: {
    label: 'Motorista',
    actions: ['Parte Diária', 'CheckList', 'Manutenção'],
  },
  financeiro: {
    label: 'Financeiro',
    actions: ['Contas a Pagar', 'Contas a Receber'],
  },
  relatorios: {
    label: 'Relatórios',
    actions: ['Vendas', 'Produtos', 'Financeiro', 'Clientes', 'Fornecedores', 'Permuta', 'Ticagem', 'Partes Diárias', 'Checklists', 'Manutenções'],
  },
  configuracao: {
    label: 'Configuração',
    actions: ['Empresa', 'Sistema', 'Contas de Recebimento'],
  },
} as const;
