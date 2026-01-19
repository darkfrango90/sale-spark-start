// Manual do Sistema CEZAR - Documentação Completa
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Printer, 
  LogIn, 
  LayoutDashboard, 
  Users, 
  Package, 
  Truck, 
  ShoppingCart, 
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  Shield,
  Fuel,
  ClipboardCheck,
  Wrench,
  FileText,
  CreditCard,
  Building2,
  UserCog,
  CircleDollarSign,
  Scale,
  Camera,
  Sparkles
} from 'lucide-react';

const Documentation = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Hidden when printing */}
      <header className="print:hidden sticky top-0 z-50 bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">CEZAR</h1>
              <p className="text-sm text-muted-foreground">Manual do Sistema</p>
            </div>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir / Salvar PDF
          </Button>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block text-center py-8 border-b">
        <h1 className="text-4xl font-bold text-primary mb-2">SISTEMA CEZAR</h1>
        <p className="text-xl text-muted-foreground">Manual Completo de Funcionalidades</p>
        <p className="text-sm text-muted-foreground mt-2">Documento gerado em {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar Navigation - Hidden when printing */}
        <aside className="print:hidden hidden lg:block w-64 sticky top-20 h-[calc(100vh-5rem)] border-r p-4">
          <ScrollArea className="h-full">
            <nav className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground mb-4">NAVEGAÇÃO</p>
              {[
                { id: 'visao-geral', label: 'Visão Geral', icon: LayoutDashboard },
                { id: 'login', label: 'Login', icon: LogIn },
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'cadastro', label: 'Cadastro', icon: Users },
                { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
                { id: 'operacao', label: 'Operação', icon: Truck },
                { id: 'motorista', label: 'Motorista', icon: Truck },
                { id: 'financeiro', label: 'Financeiro', icon: Wallet },
                { id: 'permuta', label: 'Permuta', icon: CircleDollarSign },
                { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
                { id: 'configuracoes', label: 'Configurações', icon: Settings },
                { id: 'permissoes', label: 'Permissões', icon: Shield },
                { id: 'funcionalidades', label: 'Destaques Técnicos', icon: Sparkles },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Visão Geral */}
            <section id="visao-geral" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                    Visão Geral do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    O <strong>Sistema CEZAR</strong> é uma solução completa para gestão de vendas, operações logísticas e controle financeiro. 
                    Desenvolvido para otimizar processos e aumentar a produtividade, o sistema oferece:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: 'Gestão de Vendas', desc: 'Pedidos, orçamentos e controle de recebimentos' },
                      { title: 'Operação Logística', desc: 'Carregamentos com verificação por IA' },
                      { title: 'Controle de Frota', desc: 'Abastecimento, manutenção e checklist' },
                      { title: 'Financeiro', desc: 'Contas a pagar e receber integradas' },
                      { title: 'Sistema de Permuta', desc: 'Créditos e débitos de clientes' },
                      { title: 'Relatórios Gerenciais', desc: 'Análises detalhadas por módulo' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Login */}
            <section id="login" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogIn className="h-5 w-5 text-primary" />
                    Tela de Login
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Acesso seguro ao sistema através de código de usuário e senha.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold">Campos de Acesso:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      <li><strong>Código de Acesso:</strong> Identificador único do usuário (ex: 001, 002)</li>
                      <li><strong>Senha:</strong> Senha pessoal de acesso</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-800">Comportamento Especial:</h4>
                    <p className="text-sm text-amber-700">
                      Usuários com perfil "Motorista" são automaticamente redirecionados para o painel do motorista após o login.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Dashboard */}
            <section id="dashboard" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Dashboard Principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Visão geral do negócio com indicadores-chave de desempenho.
                  </p>
                  
                  <h4 className="font-semibold mt-4">Cards de Estatísticas:</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Receita Total', desc: 'Valor total de vendas do período' },
                      { label: 'Total de Vendas', desc: 'Quantidade de pedidos realizados' },
                      { label: 'Clientes Ativos', desc: 'Número de clientes cadastrados' },
                      { label: 'Taxa de Conversão', desc: 'Orçamentos convertidos em pedidos' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-semibold mt-4">Vendas Recentes:</h4>
                  <p className="text-sm text-muted-foreground">
                    Lista das últimas vendas realizadas com cliente, valor e status.
                  </p>

                  <h4 className="font-semibold mt-4">Ações Rápidas:</h4>
                  <p className="text-sm text-muted-foreground">
                    Botões de acesso rápido aos módulos mais utilizados, filtrados conforme as permissões do usuário.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Cadastro */}
            <section id="cadastro" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Módulo de Cadastro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="clientes">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Clientes
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Cadastro completo de clientes pessoa física e jurídica.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Código automático</div>
                          <div className="p-2 bg-slate-50 rounded">CPF/CNPJ com validação</div>
                          <div className="p-2 bg-slate-50 rounded">Endereço completo</div>
                          <div className="p-2 bg-slate-50 rounded">Telefone e celular</div>
                          <div className="p-2 bg-slate-50 rounded">E-mail de contato</div>
                          <div className="p-2 bg-slate-50 rounded">Status ativo/inativo</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Permuta:</strong> Clientes podem ter crédito de permuta habilitado, 
                            com limite configurável e controle de saldo.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="produtos">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Produtos
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Gestão de produtos com controle de estoque e precificação.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Código do produto</div>
                          <div className="p-2 bg-slate-50 rounded">Nome e descrição</div>
                          <div className="p-2 bg-slate-50 rounded">Unidade (M³ ou KG)</div>
                          <div className="p-2 bg-slate-50 rounded">Densidade (ton/m³)</div>
                          <div className="p-2 bg-slate-50 rounded">Preço de custo</div>
                          <div className="p-2 bg-slate-50 rounded">Preço de venda</div>
                          <div className="p-2 bg-slate-50 rounded">Estoque atual</div>
                          <div className="p-2 bg-slate-50 rounded">Estoque mínimo</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <p className="text-sm text-green-700">
                            <strong>Cálculo Automático:</strong> O peso em toneladas é calculado automaticamente 
                            usando a fórmula: M³ × Densidade = Toneladas
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="fornecedores">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Fornecedores
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Cadastro de fornecedores para gestão de contas a pagar.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Código automático</div>
                          <div className="p-2 bg-slate-50 rounded">Razão Social / Nome</div>
                          <div className="p-2 bg-slate-50 rounded">CPF/CNPJ</div>
                          <div className="p-2 bg-slate-50 rounded">Endereço completo</div>
                          <div className="p-2 bg-slate-50 rounded">Contatos</div>
                          <div className="p-2 bg-slate-50 rounded">Observações</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Vendas */}
            <section id="vendas" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Módulo de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="nova-venda">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          Nova Venda
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <p className="text-muted-foreground">
                          Criação de pedidos e orçamentos com fluxo intuitivo.
                        </p>
                        
                        <h5 className="font-semibold">Fluxo de Venda:</h5>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Selecionar tipo: <Badge variant="outline">Pedido</Badge> ou <Badge variant="secondary">Orçamento</Badge></li>
                          <li>Buscar cliente por código ou nome (autocomplete inteligente)</li>
                          <li>Adicionar produtos com quantidade em M³</li>
                          <li>Definir "Preço Praticado" (desconto calculado automaticamente)</li>
                          <li>Selecionar condição: <Badge>À Vista</Badge> ou <Badge variant="outline">A Prazo</Badge></li>
                          <li>Escolher forma de pagamento</li>
                          <li>Anexar comprovante (para PIX ou Depósito)</li>
                          <li>Adicionar observações se necessário</li>
                          <li>Finalizar e imprimir pedido</li>
                        </ol>

                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                          <h5 className="font-semibold text-amber-800">Funcionalidades Especiais:</h5>
                          <ul className="list-disc list-inside text-sm text-amber-700 mt-1 space-y-1">
                            <li>Autocomplete ativado após 1 caractere digitado</li>
                            <li>Desconto automático: (Preço Cadastrado - Preço Praticado) / Preço Cadastrado × 100</li>
                            <li>Peso calculado: M³ × Densidade do produto</li>
                            <li>Frete adicionado como produto/serviço editável</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pedidos">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Lista de Pedidos
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Visualização e gestão de todos os pedidos.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Filtro por período</div>
                          <div className="p-2 bg-slate-50 rounded">Busca por cliente/número</div>
                          <div className="p-2 bg-slate-50 rounded">Status do pedido</div>
                          <div className="p-2 bg-slate-50 rounded">Impressão individual</div>
                          <div className="p-2 bg-slate-50 rounded">Cancelamento com motivo</div>
                          <div className="p-2 bg-slate-50 rounded">Histórico de alterações</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                          <p className="text-sm text-red-700">
                            <strong>Cancelamento:</strong> Pedidos cancelados exibem marca d'água 
                            e o motivo pode ser visualizado via tooltip.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="impressao">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Printer className="h-4 w-4" />
                          Impressão de Pedidos
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Layout otimizado para impressão em meia folha A4.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Dados da empresa no cabeçalho</div>
                          <div className="p-2 bg-slate-50 rounded">Aviso "NÃO É DOCUMENTO FISCAL"</div>
                          <div className="p-2 bg-slate-50 rounded">Dados completos do cliente</div>
                          <div className="p-2 bg-slate-50 rounded">Lista de produtos com preços e totais</div>
                          <div className="p-2 bg-slate-50 rounded">Assinatura do Vendedor (nome do usuário logado)</div>
                          <div className="p-2 bg-slate-50 rounded">Assinatura do Motorista Autorizado com campo CPF</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Operação */}
            <section id="operacao" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Módulo de Operação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="operador">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4" />
                          Operador (Carregamentos)
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <p className="text-muted-foreground">
                          Tela mobile-first para operadores confirmarem carregamentos.
                        </p>
                        
                        <h5 className="font-semibold">Fluxo de Carregamento:</h5>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Buscar pedido por número</li>
                          <li>Visualizar detalhes: cliente, produtos, peso esperado</li>
                          <li>Fotografar ticket de pesagem da balança</li>
                          <li>Sistema processa imagem com IA</li>
                          <li>Comparar peso real vs esperado</li>
                          <li>Confirmar carregamento</li>
                        </ol>

                        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Camera className="h-4 w-4 text-purple-700" />
                            <h5 className="font-semibold text-purple-800">Verificação com Inteligência Artificial</h5>
                          </div>
                          <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
                            <li>A IA analisa a foto do ticket de pesagem</li>
                            <li>Extrai automaticamente: peso bruto, tara e peso líquido</li>
                            <li>Compara com peso esperado baseado na densidade</li>
                            <li>Alerta visual se divergência for maior que 5%</li>
                            <li>Registra dados para auditoria</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="carregados">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Pedidos Carregados
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Histórico de todos os pedidos que já foram carregados.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Data/hora do carregamento</div>
                          <div className="p-2 bg-slate-50 rounded">Operador responsável</div>
                          <div className="p-2 bg-slate-50 rounded">Peso verificado</div>
                          <div className="p-2 bg-slate-50 rounded">% de divergência</div>
                          <div className="p-2 bg-slate-50 rounded">Foto do ticket</div>
                          <div className="p-2 bg-slate-50 rounded">Resposta da IA</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="abastecimento">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4" />
                          Abastecimento
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Registro de abastecimentos da frota de veículos.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Seleção do veículo</div>
                          <div className="p-2 bg-slate-50 rounded">Tipo de combustível (Gasolina/Diesel)</div>
                          <div className="p-2 bg-slate-50 rounded">Litros abastecidos</div>
                          <div className="p-2 bg-slate-50 rounded">Valor por litro</div>
                          <div className="p-2 bg-slate-50 rounded">KM ou Horímetro atual</div>
                          <div className="p-2 bg-slate-50 rounded">Operador responsável</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="veiculos">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Veículos
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Cadastro e gestão da frota de veículos.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Nome/identificação</div>
                          <div className="p-2 bg-slate-50 rounded">Placa</div>
                          <div className="p-2 bg-slate-50 rounded">Tipo (Caminhão, Carreta, etc.)</div>
                          <div className="p-2 bg-slate-50 rounded">Tipo de combustível</div>
                          <div className="p-2 bg-slate-50 rounded">Capacidade do tanque</div>
                          <div className="p-2 bg-slate-50 rounded">Usa odômetro ou horímetro</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Motorista */}
            <section id="motorista" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Módulo do Motorista
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Acesso exclusivo para usuários com perfil "motorista" ou "admin"
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="painel">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Painel do Motorista
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Dashboard pessoal com estatísticas e atividades do motorista.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Viagens realizadas no mês</div>
                          <div className="p-2 bg-slate-50 rounded">Quilometragem total</div>
                          <div className="p-2 bg-slate-50 rounded">Status do checklist semanal</div>
                          <div className="p-2 bg-slate-50 rounded">Manutenções pendentes</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Lembrete:</strong> Toda segunda-feira o sistema solicita a 
                            realização do checklist semanal do veículo.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="parte-diaria">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Parte Diária
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Registro diário de viagens com controle de quilometragem e frete.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Veículo utilizado</div>
                          <div className="p-2 bg-slate-50 rounded">Número do pedido</div>
                          <div className="p-2 bg-slate-50 rounded">Cliente atendido</div>
                          <div className="p-2 bg-slate-50 rounded">KM inicial (preenchido auto)</div>
                          <div className="p-2 bg-slate-50 rounded">KM final</div>
                          <div className="p-2 bg-slate-50 rounded">Valor do frete</div>
                          <div className="p-2 bg-slate-50 rounded">Assinatura digital</div>
                          <div className="p-2 bg-slate-50 rounded">Observações</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <p className="text-sm text-green-700">
                            <strong>Preenchimento Inteligente:</strong> O KM inicial é automaticamente 
                            preenchido com o KM final do último relatório do motorista.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="checklist">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4" />
                          CheckList Semanal
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Inspeção de segurança com 21 itens obrigatórios.
                        </p>
                        <div className="space-y-2">
                          <h5 className="font-semibold text-sm">Categorias Inspecionadas:</h5>
                          <div className="grid sm:grid-cols-3 gap-2 text-xs">
                            <div className="p-2 bg-slate-50 rounded">Óleo do motor</div>
                            <div className="p-2 bg-slate-50 rounded">Água do radiador</div>
                            <div className="p-2 bg-slate-50 rounded">Fluido de freio</div>
                            <div className="p-2 bg-slate-50 rounded">Óleo hidráulico</div>
                            <div className="p-2 bg-slate-50 rounded">Freio de serviço</div>
                            <div className="p-2 bg-slate-50 rounded">Freio de estacionamento</div>
                            <div className="p-2 bg-slate-50 rounded">Pneus (estado)</div>
                            <div className="p-2 bg-slate-50 rounded">Pneus (calibragem)</div>
                            <div className="p-2 bg-slate-50 rounded">Estepe</div>
                            <div className="p-2 bg-slate-50 rounded">Faróis</div>
                            <div className="p-2 bg-slate-50 rounded">Lanternas</div>
                            <div className="p-2 bg-slate-50 rounded">Setas</div>
                            <div className="p-2 bg-slate-50 rounded">Retrovisores</div>
                            <div className="p-2 bg-slate-50 rounded">Limpador de parabrisa</div>
                            <div className="p-2 bg-slate-50 rounded">Buzina</div>
                            <div className="p-2 bg-slate-50 rounded">Cinto de segurança</div>
                            <div className="p-2 bg-slate-50 rounded">Extintor</div>
                            <div className="p-2 bg-slate-50 rounded">Triângulo</div>
                            <div className="p-2 bg-slate-50 rounded">Macaco e chave</div>
                            <div className="p-2 bg-slate-50 rounded">Documentos</div>
                            <div className="p-2 bg-slate-50 rounded">Limpeza geral</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cada item pode ser marcado como: <Badge className="mx-1" variant="outline">OK</Badge> 
                          <Badge className="mx-1" variant="secondary">Precisa Reparo</Badge> 
                          <Badge className="mx-1" variant="destructive">Crítico</Badge>
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="manutencao">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Manutenção
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Registro de problemas mecânicos e solicitações de manutenção.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Veículo afetado</div>
                          <div className="p-2 bg-slate-50 rounded">Descrição do problema</div>
                          <div className="p-2 bg-slate-50 rounded">Status (Pendente/Resolvido)</div>
                          <div className="p-2 bg-slate-50 rounded">Data da resolução</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Financeiro */}
            <section id="financeiro" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Módulo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="pagar">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Contas a Pagar
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Gestão de pagamentos a fornecedores.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Fornecedor</div>
                          <div className="p-2 bg-slate-50 rounded">Número da nota</div>
                          <div className="p-2 bg-slate-50 rounded">Valor original</div>
                          <div className="p-2 bg-slate-50 rounded">Juros/multa</div>
                          <div className="p-2 bg-slate-50 rounded">Valor final</div>
                          <div className="p-2 bg-slate-50 rounded">Data de vencimento</div>
                          <div className="p-2 bg-slate-50 rounded">Data de competência</div>
                          <div className="p-2 bg-slate-50 rounded">Status (Pendente/Pago)</div>
                          <div className="p-2 bg-slate-50 rounded">Conta de pagamento</div>
                          <div className="p-2 bg-slate-50 rounded">Parcelamento</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="receber">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <CircleDollarSign className="h-4 w-4" />
                          Contas a Receber
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Controle de recebimentos de clientes.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Venda associada</div>
                          <div className="p-2 bg-slate-50 rounded">Valor original</div>
                          <div className="p-2 bg-slate-50 rounded">Juros/multa</div>
                          <div className="p-2 bg-slate-50 rounded">Valor final</div>
                          <div className="p-2 bg-slate-50 rounded">Status (Pendente/Recebido)</div>
                          <div className="p-2 bg-slate-50 rounded">Data de recebimento</div>
                          <div className="p-2 bg-slate-50 rounded">Conta de recebimento</div>
                          <div className="p-2 bg-slate-50 rounded">Comprovante anexo</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Permuta */}
            <section id="permuta" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircleDollarSign className="h-5 w-5 text-primary" />
                    Sistema de Permuta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Sistema exclusivo para clientes com crédito de permuta habilitado.
                  </p>
                  
                  <h4 className="font-semibold">Funcionalidades:</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Dashboard de Permuta</h5>
                      <p className="text-xs text-muted-foreground">
                        Visão geral de todos os clientes com permuta ativa
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Extrato por Cliente</h5>
                      <p className="text-xs text-muted-foreground">
                        Histórico detalhado de créditos e débitos
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Controle de Saldo</h5>
                      <p className="text-xs text-muted-foreground">
                        Saldo atual, limite negativo e crédito disponível
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Integração com Vendas</h5>
                      <p className="text-xs text-muted-foreground">
                        Pagamento "Permuta" deduz automaticamente do saldo
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <h5 className="font-semibold text-blue-800">Como Funciona:</h5>
                    <ul className="list-disc list-inside text-sm text-blue-700 mt-1 space-y-1">
                      <li>Cliente recebe crédito de permuta (por serviços prestados, etc.)</li>
                      <li>Ao comprar, pode usar "Permuta" como forma de pagamento</li>
                      <li>Saldo é descontado automaticamente</li>
                      <li>Pode ter limite negativo configurável (débito)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Relatórios */}
            <section id="relatorios" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Relatórios Gerenciais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Análises detalhadas para tomada de decisão.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { title: 'Vendas', desc: 'Análise de vendas por período, cliente, produto' },
                      { title: 'Produtos', desc: 'Movimentação e estoque em M³ e Toneladas' },
                      { title: 'Clientes', desc: 'Análise da carteira de clientes' },
                      { title: 'Financeiro', desc: 'Fluxo de caixa, receitas e despesas' },
                      { title: 'Fornecedores', desc: 'Análise de compras por fornecedor' },
                      { title: 'Permuta', desc: 'Saldos e movimentações de permuta' },
                      { title: 'Ticagem', desc: 'Ratio de pedidos carregados vs pendentes' },
                      { title: 'Partes Diárias', desc: 'Relatórios de viagens dos motoristas' },
                      { title: 'Checklists', desc: 'Histórico de inspeções veiculares' },
                      { title: 'Manutenções', desc: 'Solicitações de manutenção da frota' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <h5 className="font-medium">{item.title}</h5>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <h5 className="font-semibold text-amber-800">Relatório de Ticagem:</h5>
                    <p className="text-sm text-amber-700">
                      Monitora a eficiência operacional comparando pedidos que já foram 
                      carregados com os que ainda estão pendentes.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <h5 className="font-semibold text-green-800">Relatório de Partes Diárias:</h5>
                    <p className="text-sm text-green-700">
                      Exportação em PDF com cálculo automático de diferença de frete 
                      usando multiplicadores específicos por placa de veículo (6 ou 12).
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Configurações */}
            <section id="configuracoes" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="empresa">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Dados da Empresa
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Configurações da empresa que aparecem nos documentos impressos.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Nome da empresa</div>
                          <div className="p-2 bg-slate-50 rounded">CNPJ</div>
                          <div className="p-2 bg-slate-50 rounded">Endereço completo</div>
                          <div className="p-2 bg-slate-50 rounded">Telefone</div>
                          <div className="p-2 bg-slate-50 rounded">E-mail</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="usuarios">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          Usuários
                          <Badge variant="destructive" className="ml-2">Admin</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Gestão de usuários e permissões (acesso restrito a administradores).
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Criar novos usuários</div>
                          <div className="p-2 bg-slate-50 rounded">Definir perfil (role)</div>
                          <div className="p-2 bg-slate-50 rounded">Configurar permissões por módulo</div>
                          <div className="p-2 bg-slate-50 rounded">Ativar/desativar usuários</div>
                          <div className="p-2 bg-slate-50 rounded">Resetar senhas</div>
                          <div className="p-2 bg-slate-50 rounded">Código de acesso automático</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pagamento">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Condições de Pagamento
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Configuração das formas de pagamento disponíveis.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Dinheiro</div>
                          <div className="p-2 bg-slate-50 rounded">PIX</div>
                          <div className="p-2 bg-slate-50 rounded">Cartão Débito</div>
                          <div className="p-2 bg-slate-50 rounded">Cartão Crédito</div>
                          <div className="p-2 bg-slate-50 rounded">Depósito</div>
                          <div className="p-2 bg-slate-50 rounded">Permuta</div>
                          <div className="p-2 bg-slate-50 rounded">Boleto</div>
                          <div className="p-2 bg-slate-50 rounded">Cheque</div>
                          <div className="p-2 bg-slate-50 rounded">+ Personalizados</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="contas">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Contas de Recebimento
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <p className="text-muted-foreground">
                          Cadastro de contas bancárias para recebimentos.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Nome da conta (ex: "Banco do Brasil - Conta Principal")</div>
                          <div className="p-2 bg-slate-50 rounded">Status ativo/inativo</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Permissões */}
            <section id="permissoes" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Sistema de Permissões
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Controle granular de acesso por perfil e módulo.
                  </p>

                  <h4 className="font-semibold">Perfis de Usuário:</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>Admin</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Acesso total ao sistema, incluindo gestão de usuários e configurações.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Vendedor</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Acesso a vendas, cadastro de clientes/produtos e módulo financeiro.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Operador</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Acesso ao módulo de operação para confirmar carregamentos e abastecimentos.
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Motorista</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Acesso exclusivo ao módulo do motorista (parte diária, checklist, manutenção).
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h4 className="font-semibold">Controle por Módulo:</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cada usuário pode ter permissões específicas por módulo e ação:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-slate-50 rounded">cadastro.Clientes</div>
                    <div className="p-2 bg-slate-50 rounded">cadastro.Produtos</div>
                    <div className="p-2 bg-slate-50 rounded">cadastro.Fornecedores</div>
                    <div className="p-2 bg-slate-50 rounded">vendas.Nova Venda</div>
                    <div className="p-2 bg-slate-50 rounded">vendas.Pedidos</div>
                    <div className="p-2 bg-slate-50 rounded">operacao.Operador</div>
                    <div className="p-2 bg-slate-50 rounded">operacao.Abastecimento</div>
                    <div className="p-2 bg-slate-50 rounded">financeiro.Contas a Pagar</div>
                    <div className="p-2 bg-slate-50 rounded">financeiro.Contas a Receber</div>
                    <div className="p-2 bg-slate-50 rounded">relatorios.*</div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Funcionalidades Técnicas */}
            <section id="funcionalidades" className="print:break-before-page">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Destaques Técnicos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Funcionalidades avançadas que diferenciam o sistema.
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        🔍 Autocomplete Inteligente
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Busca de clientes e produtos ativada após digitar apenas 1 caractere. 
                        Resultados em tempo real com destaque do termo buscado.
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        💰 Cálculo Automático de Desconto
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ao informar o "Preço Praticado", o sistema calcula automaticamente 
                        o percentual de desconto baseado no preço cadastrado do produto.
                      </p>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 block">
                        Desconto = (Preço Cadastrado - Preço Praticado) / Preço Cadastrado × 100
                      </code>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        ⚖️ Cálculo Automático de Peso
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        O peso em toneladas é calculado automaticamente usando a densidade 
                        configurada no cadastro do produto.
                      </p>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded mt-2 block">
                        Peso (ton) = Quantidade (M³) × Densidade (ton/m³)
                      </code>
                    </div>

                    <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                      <h4 className="font-semibold flex items-center gap-2 text-purple-800">
                        🤖 Verificação de Pesagem com IA
                      </h4>
                      <p className="text-sm text-purple-700 mt-1">
                        O operador fotografa o ticket de pesagem e a Inteligência Artificial 
                        extrai automaticamente os dados (peso bruto, tara, líquido) e compara 
                        com o peso esperado. Sistema alerta divergências maiores que 5%.
                      </p>
                      <div className="mt-2 text-xs text-purple-600">
                        Tecnologia: Edge Function + Modelo de Visão Computacional (Gemini)
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        🖨️ Impressão Otimizada
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Layout de pedidos formatado para meia folha A4, economizando papel. 
                        Inclui campos de assinatura do vendedor (nome automático) e motorista 
                        autorizado com espaço para CPF.
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        📊 KM Inicial Inteligente
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Na Parte Diária do motorista, o campo KM Inicial é preenchido 
                        automaticamente com o KM Final do relatório anterior do mesmo motorista.
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        📅 Lembrete de CheckList
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Toda segunda-feira o sistema exibe um lembrete para o motorista 
                        realizar a inspeção semanal do veículo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Footer */}
            <div className="text-center py-8 border-t mt-8">
              <p className="text-sm text-muted-foreground">
                Sistema CEZAR © {new Date().getFullYear()} - Todos os direitos reservados
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>

          </div>
        </main>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:break-before-page {
            break-before: page;
          }
          @page {
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
};

export default Documentation;
