export interface Permission {
  module: string;
  actions: string[];
}

export interface User {
  id: string;
  accessCode: string;
  name: string;
  cpf: string;
  password: string;
  role: 'admin' | 'gerente' | 'vendedor' | 'caixa' | 'estoquista' | 'motorista';
  permissions: Permission[];
  active: boolean;
  createdAt: Date;
}

export const ROLES = {
  admin: 'Administrador',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
  caixa: 'Caixa',
  estoquista: 'Estoquista',
  motorista: 'Motorista',
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

export const DEFAULT_ADMIN: User = {
  id: '1',
  accessCode: '001',
  name: 'Administrador',
  cpf: '000.000.000-00',
  password: 'admin123',
  role: 'admin',
  permissions: Object.keys(MODULES).map((module) => ({
    module,
    actions: MODULES[module as keyof typeof MODULES].actions as unknown as string[],
  })),
  active: true,
  createdAt: new Date(),
};
