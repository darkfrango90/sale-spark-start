// Manual do Sistema CEZAR - Documentação Completa
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import pptxgen from "pptxgenjs";
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
  Sparkles,
  Download
} from 'lucide-react';

const Documentation = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPPTX = () => {
    const pres = new pptxgen();
    
    // Configurações padrão
    pres.layout = 'LAYOUT_16x9';
    pres.title = 'Manual do Sistema CEZAR';
    pres.author = 'Sistema CEZAR';
    pres.subject = 'Manual Completo de Funcionalidades';
    
    const primaryColor = '3B82F6';
    const darkText = '1F2937';
    const grayText = '6B7280';
    const lightBg = 'F3F4F6';

    // =============== SLIDE 1: CAPA ===============
    const slideCapa = pres.addSlide();
    slideCapa.addText("SISTEMA CEZAR", {
      x: 0, y: 2.5, w: '100%', h: 1,
      fontSize: 54, color: primaryColor, bold: true, align: 'center',
      fontFace: 'Arial'
    });
    slideCapa.addText("Manual Completo de Funcionalidades", {
      x: 0, y: 3.6, w: '100%', h: 0.6,
      fontSize: 28, color: grayText, align: 'center',
      fontFace: 'Arial'
    });
    slideCapa.addText(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`, {
      x: 0, y: 4.8, w: '100%', h: 0.4,
      fontSize: 14, color: grayText, align: 'center',
      fontFace: 'Arial'
    });

    // =============== SLIDE 2: VISÃO GERAL ===============
    const slideVisao = pres.addSlide();
    slideVisao.addText("Visão Geral do Sistema", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideVisao.addText("O Sistema CEZAR é uma solução completa para gestão de vendas, operações logísticas e controle financeiro. Desenvolvido para otimizar processos e aumentar a produtividade.", {
      x: 0.5, y: 1, w: 9, h: 0.8,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const modulosVisao = [
      { title: 'Gestão de Vendas', desc: 'Pedidos, orçamentos e controle de recebimentos' },
      { title: 'Operação Logística', desc: 'Carregamentos com verificação por IA' },
      { title: 'Controle de Frota', desc: 'Abastecimento, manutenção e checklist' },
      { title: 'Financeiro', desc: 'Contas a pagar e receber integradas' },
      { title: 'Sistema de Permuta', desc: 'Créditos e débitos de clientes' },
      { title: 'Relatórios e IA', desc: 'Dashboard analítico e assistente inteligente' },
    ];
    
    modulosVisao.forEach((mod, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      slideVisao.addShape('rect', {
        x: 0.5 + col * 4.7, y: 2 + row * 1.2, w: 4.5, h: 1,
        fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
      });
      slideVisao.addText(mod.title, {
        x: 0.6 + col * 4.7, y: 2.1 + row * 1.2, w: 4.3, h: 0.4,
        fontSize: 14, color: darkText, bold: true,
        fontFace: 'Arial'
      });
      slideVisao.addText(mod.desc, {
        x: 0.6 + col * 4.7, y: 2.5 + row * 1.2, w: 4.3, h: 0.4,
        fontSize: 12, color: grayText,
        fontFace: 'Arial'
      });
    });

    // =============== SLIDE 3: LOGIN ===============
    const slideLogin = pres.addSlide();
    slideLogin.addText("Tela de Login", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideLogin.addText("Acesso seguro ao sistema através de código de usuário e senha.", {
      x: 0.5, y: 1, w: 9, h: 0.5,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    slideLogin.addText("Campos de Acesso:", {
      x: 0.5, y: 1.7, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideLogin.addText("• Código de Acesso: Identificador único do usuário (ex: 001, 002)\n• Senha: Senha pessoal de acesso", {
      x: 0.5, y: 2.2, w: 9, h: 0.8,
      fontSize: 14, color: grayText,
      fontFace: 'Arial'
    });
    slideLogin.addShape('rect', {
      x: 0.5, y: 3.2, w: 9, h: 0.8,
      fill: { color: 'FEF3C7' }, line: { color: 'F59E0B', pt: 1 }
    });
    slideLogin.addText("⚠️ Comportamento Especial: Usuários com perfil \"Motorista\" são automaticamente redirecionados para o painel do motorista após o login.", {
      x: 0.6, y: 3.3, w: 8.8, h: 0.6,
      fontSize: 12, color: '92400E',
      fontFace: 'Arial'
    });

    // =============== SLIDE 4: DASHBOARD ===============
    const slideDash = pres.addSlide();
    slideDash.addText("Dashboard Principal", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideDash.addText("Painel executivo com indicadores em tempo real e gráficos analíticos.", {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const cardsDash = ['Receita do Mês', 'Total de Vendas', 'Clientes Ativos', 'Contas a Receber'];
    cardsDash.forEach((card, i) => {
      slideDash.addShape('rect', {
        x: 0.5 + i * 2.3, y: 1.4, w: 2.1, h: 0.6,
        fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
      });
      slideDash.addText(card, {
        x: 0.5 + i * 2.3, y: 1.5, w: 2.1, h: 0.4,
        fontSize: 10, color: darkText, align: 'center',
        fontFace: 'Arial'
      });
    });
    
    slideDash.addText("Gráficos e Visualizações:", {
      x: 0.5, y: 2.2, w: 9, h: 0.4,
      fontSize: 16, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideDash.addText("• Tendência de Vendas: Gráfico de área com evolução dos últimos 6 meses\n• Fluxo de Caixa: Gráfico de barras comparando Recebíveis vs Pagáveis (15 dias)\n• Top 5 Produtos: Ranking horizontal dos produtos mais vendidos\n• Ranking de Vendedores: Leaderboard mensal com receita e qtd de vendas\n• Alertas do Sistema: Estoque crítico, contas vencidas, manutenções pendentes\n• Vendas Recentes: Lista com últimas vendas e status", {
      x: 0.5, y: 2.6, w: 9, h: 1.6,
      fontSize: 12, color: grayText,
      fontFace: 'Arial'
    });

    slideDash.addShape('rect', {
      x: 0.5, y: 4.4, w: 9, h: 0.6,
      fill: { color: 'DBEAFE' }, line: { color: '3B82F6', pt: 1 }
    });
    slideDash.addText("💡 Comparações: Cada indicador mostra variação % em relação ao mês anterior.", {
      x: 0.6, y: 4.5, w: 8.8, h: 0.4,
      fontSize: 11, color: '1E40AF',
      fontFace: 'Arial'
    });

    // =============== SLIDE 5: CADASTRO - CLIENTES ===============
    const slideCadastro1 = pres.addSlide();
    slideCadastro1.addText("Módulo de Cadastro - Clientes", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideCadastro1.addText("Cadastro completo de clientes pessoa física e jurídica.", {
      x: 0.5, y: 1, w: 9, h: 0.5,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const camposCliente = ['Código automático', 'CPF/CNPJ com validação', 'Endereço completo', 'Telefone e celular', 'E-mail de contato', 'Status ativo/inativo'];
    camposCliente.forEach((campo, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      slideCadastro1.addShape('rect', {
        x: 0.5 + col * 4.7, y: 1.7 + row * 0.6, w: 4.5, h: 0.5,
        fill: { color: lightBg }
      });
      slideCadastro1.addText(campo, {
        x: 0.6 + col * 4.7, y: 1.8 + row * 0.6, w: 4.3, h: 0.3,
        fontSize: 12, color: darkText,
        fontFace: 'Arial'
      });
    });

    slideCadastro1.addShape('rect', {
      x: 0.5, y: 3.7, w: 9, h: 0.8,
      fill: { color: 'DBEAFE' }, line: { color: '3B82F6', pt: 1 }
    });
    slideCadastro1.addText("💡 Permuta: Clientes podem ter crédito de permuta habilitado, com limite configurável e controle de saldo.", {
      x: 0.6, y: 3.8, w: 8.8, h: 0.6,
      fontSize: 12, color: '1E40AF',
      fontFace: 'Arial'
    });

    // =============== SLIDE 6: CADASTRO - PRODUTOS ===============
    const slideCadastro2 = pres.addSlide();
    slideCadastro2.addText("Módulo de Cadastro - Produtos", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideCadastro2.addText("Gestão de produtos com controle de estoque e precificação.", {
      x: 0.5, y: 1, w: 9, h: 0.5,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const camposProduto = ['Código do produto', 'Nome e descrição', 'Unidade (M³ ou KG)', 'Densidade (ton/m³)', 'Preço de custo', 'Preço de venda', 'Estoque atual', 'Estoque mínimo'];
    camposProduto.forEach((campo, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      slideCadastro2.addShape('rect', {
        x: 0.5 + col * 4.7, y: 1.6 + row * 0.55, w: 4.5, h: 0.45,
        fill: { color: lightBg }
      });
      slideCadastro2.addText(campo, {
        x: 0.6 + col * 4.7, y: 1.68 + row * 0.55, w: 4.3, h: 0.3,
        fontSize: 11, color: darkText,
        fontFace: 'Arial'
      });
    });

    slideCadastro2.addShape('rect', {
      x: 0.5, y: 3.9, w: 9, h: 0.8,
      fill: { color: 'DCFCE7' }, line: { color: '22C55E', pt: 1 }
    });
    slideCadastro2.addText("✅ Cálculo Automático: O peso em toneladas é calculado automaticamente: M³ × Densidade = Toneladas", {
      x: 0.6, y: 4, w: 8.8, h: 0.6,
      fontSize: 12, color: '166534',
      fontFace: 'Arial'
    });

    // =============== SLIDE 7: CADASTRO - FORNECEDORES ===============
    const slideCadastro3 = pres.addSlide();
    slideCadastro3.addText("Módulo de Cadastro - Fornecedores", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideCadastro3.addText("Cadastro de fornecedores para gestão de contas a pagar.", {
      x: 0.5, y: 1, w: 9, h: 0.5,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const camposFornecedor = ['Código automático', 'Razão Social / Nome', 'CPF/CNPJ', 'Endereço completo', 'Contatos', 'Observações'];
    camposFornecedor.forEach((campo, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      slideCadastro3.addShape('rect', {
        x: 0.5 + col * 4.7, y: 1.7 + row * 0.6, w: 4.5, h: 0.5,
        fill: { color: lightBg }
      });
      slideCadastro3.addText(campo, {
        x: 0.6 + col * 4.7, y: 1.8 + row * 0.6, w: 4.3, h: 0.3,
        fontSize: 12, color: darkText,
        fontFace: 'Arial'
      });
    });

    // =============== SLIDE 8: VENDAS - NOVA VENDA ===============
    const slideVendas1 = pres.addSlide();
    slideVendas1.addText("Módulo de Vendas - Nova Venda", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideVendas1.addText("Criação de pedidos e orçamentos com fluxo intuitivo.", {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    slideVendas1.addText("Fluxo de Venda:", {
      x: 0.5, y: 1.4, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    
    const fluxoVenda = [
      '1. Selecionar tipo: Pedido ou Orçamento',
      '2. Buscar cliente por código ou nome',
      '3. Adicionar produtos com quantidade em M³',
      '4. Definir "Preço Praticado" (desconto automático)',
      '5. Selecionar condição: À Vista ou A Prazo',
      '6. Escolher forma de pagamento',
      '7. Anexar comprovante (PIX/Depósito)',
      '8. Adicionar observações',
      '9. Finalizar e imprimir pedido'
    ];
    fluxoVenda.forEach((item, i) => {
      slideVendas1.addText(item, {
        x: 0.5, y: 1.9 + i * 0.35, w: 9, h: 0.3,
        fontSize: 12, color: darkText,
        fontFace: 'Arial'
      });
    });

    // =============== SLIDE 9: VENDAS - FUNCIONALIDADES ===============
    const slideVendas2 = pres.addSlide();
    slideVendas2.addText("Módulo de Vendas - Funcionalidades Especiais", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    
    const funcVendas = [
      { title: 'Autocomplete Inteligente', desc: 'Ativado após 1 caractere digitado' },
      { title: 'Desconto Automático', desc: '(Preço Cadastrado - Preço Praticado) / Preço Cadastrado × 100' },
      { title: 'Peso Calculado', desc: 'M³ × Densidade do produto' },
      { title: 'Frete Editável', desc: 'Adicionado como produto/serviço' },
    ];
    funcVendas.forEach((func, i) => {
      slideVendas2.addShape('rect', {
        x: 0.5, y: 1.1 + i * 0.9, w: 9, h: 0.8,
        fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
      });
      slideVendas2.addText(func.title, {
        x: 0.6, y: 1.2 + i * 0.9, w: 8.8, h: 0.35,
        fontSize: 14, color: darkText, bold: true,
        fontFace: 'Arial'
      });
      slideVendas2.addText(func.desc, {
        x: 0.6, y: 1.5 + i * 0.9, w: 8.8, h: 0.3,
        fontSize: 12, color: grayText,
        fontFace: 'Arial'
      });
    });

    // =============== SLIDE 10: VENDAS - LISTA E IMPRESSÃO ===============
    const slideVendas3 = pres.addSlide();
    slideVendas3.addText("Módulo de Vendas - Lista e Impressão", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    
    slideVendas3.addText("Lista de Pedidos:", {
      x: 0.5, y: 1, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideVendas3.addText("• Filtro por período e busca por cliente/número\n• Status do pedido (pendente, carregado, cancelado)\n• Impressão individual e cancelamento com motivo\n• Pedidos cancelados exibem marca d'água", {
      x: 0.5, y: 1.5, w: 9, h: 1,
      fontSize: 13, color: grayText,
      fontFace: 'Arial'
    });
    
    slideVendas3.addText("Impressão de Pedidos:", {
      x: 0.5, y: 2.7, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideVendas3.addText("• Layout otimizado para meia folha A4\n• Dados da empresa no cabeçalho\n• Aviso \"NÃO É DOCUMENTO FISCAL\"\n• Assinatura do Vendedor (nome automático do usuário)\n• Assinatura do Motorista Autorizado com campo CPF", {
      x: 0.5, y: 3.2, w: 9, h: 1.3,
      fontSize: 13, color: grayText,
      fontFace: 'Arial'
    });

    // =============== SLIDE 11: OPERAÇÃO - OPERADOR ===============
    const slideOp1 = pres.addSlide();
    slideOp1.addText("Módulo de Operação - Operador", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideOp1.addText("Tela mobile-first para operadores confirmarem carregamentos.", {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    slideOp1.addText("Fluxo de Carregamento:", {
      x: 0.5, y: 1.4, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideOp1.addText("1. Buscar pedido por número\n2. Visualizar detalhes: cliente, produtos, peso esperado\n3. Fotografar ticket de pesagem da balança\n4. Sistema processa imagem com IA\n5. Comparar peso real vs esperado\n6. Confirmar carregamento", {
      x: 0.5, y: 1.9, w: 9, h: 1.5,
      fontSize: 13, color: grayText,
      fontFace: 'Arial'
    });

    slideOp1.addShape('rect', {
      x: 0.5, y: 3.6, w: 9, h: 1.2,
      fill: { color: 'F3E8FF' }, line: { color: '9333EA', pt: 1 }
    });
    slideOp1.addText("🤖 Verificação com Inteligência Artificial", {
      x: 0.6, y: 3.7, w: 8.8, h: 0.35,
      fontSize: 14, color: '6B21A8', bold: true,
      fontFace: 'Arial'
    });
    slideOp1.addText("• A IA analisa a foto do ticket e extrai peso bruto, tara e líquido\n• Compara com peso esperado (M³ × Densidade)\n• Alerta visual se divergência > 5%", {
      x: 0.6, y: 4.1, w: 8.8, h: 0.6,
      fontSize: 11, color: '7C3AED',
      fontFace: 'Arial'
    });

    // =============== SLIDE 12: OPERAÇÃO - OUTROS ===============
    const slideOp2 = pres.addSlide();
    slideOp2.addText("Módulo de Operação - Carregados e Frota", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    
    slideOp2.addText("Pedidos Carregados:", {
      x: 0.5, y: 1, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideOp2.addText("Histórico de carregamentos com data/hora, operador, peso verificado, % divergência, foto do ticket e resposta da IA.", {
      x: 0.5, y: 1.5, w: 9, h: 0.5,
      fontSize: 13, color: grayText,
      fontFace: 'Arial'
    });
    
    slideOp2.addText("Abastecimento:", {
      x: 0.5, y: 2.2, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideOp2.addText("Registro de abastecimentos: veículo, tipo de combustível (Gasolina/Diesel), litros, valor por litro, KM ou Horímetro.", {
      x: 0.5, y: 2.7, w: 9, h: 0.5,
      fontSize: 13, color: grayText,
      fontFace: 'Arial'
    });
    
    slideOp2.addText("Veículos:", {
      x: 0.5, y: 3.4, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideOp2.addText("Cadastro da frota: nome, placa, tipo (Caminhão, Carreta), combustível, capacidade do tanque, odômetro ou horímetro.", {
      x: 0.5, y: 3.9, w: 9, h: 0.5,
      fontSize: 13, color: grayText,
      fontFace: 'Arial'
    });

    // =============== SLIDE 13: MOTORISTA - PAINEL ===============
    const slideMot1 = pres.addSlide();
    slideMot1.addText("Módulo do Motorista - Painel", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideMot1.addText("Acesso exclusivo para usuários com perfil \"motorista\" ou \"admin\"", {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 14, color: grayText, italic: true,
      fontFace: 'Arial'
    });
    
    slideOp2.addText("Dashboard Pessoal:", {
      x: 0.5, y: 1.5, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    
    const cardsMot = ['Viagens no mês', 'KM total', 'Status checklist', 'Manutenções pendentes'];
    cardsMot.forEach((card, i) => {
      slideMot1.addShape('rect', {
        x: 0.5 + i * 2.3, y: 1.6, w: 2.1, h: 0.7,
        fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
      });
      slideMot1.addText(card, {
        x: 0.5 + i * 2.3, y: 1.75, w: 2.1, h: 0.4,
        fontSize: 10, color: darkText, align: 'center',
        fontFace: 'Arial'
      });
    });

    slideMot1.addShape('rect', {
      x: 0.5, y: 2.6, w: 9, h: 0.7,
      fill: { color: 'DBEAFE' }, line: { color: '3B82F6', pt: 1 }
    });
    slideMot1.addText("📅 Lembrete: Toda segunda-feira o sistema solicita a realização do checklist semanal do veículo.", {
      x: 0.6, y: 2.75, w: 8.8, h: 0.4,
      fontSize: 12, color: '1E40AF',
      fontFace: 'Arial'
    });

    // =============== SLIDE 14: MOTORISTA - PARTE DIÁRIA ===============
    const slideMot2 = pres.addSlide();
    slideMot2.addText("Módulo do Motorista - Parte Diária", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideMot2.addText("Registro diário de viagens com controle de quilometragem e frete.", {
      x: 0.5, y: 1, w: 9, h: 0.4,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const camposParte = ['Veículo utilizado', 'Número do pedido', 'Cliente atendido', 'KM inicial (auto)', 'KM final', 'Valor do frete', 'Assinatura digital', 'Observações'];
    camposParte.forEach((campo, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      slideMot2.addShape('rect', {
        x: 0.5 + col * 4.7, y: 1.6 + row * 0.55, w: 4.5, h: 0.45,
        fill: { color: lightBg }
      });
      slideMot2.addText(campo, {
        x: 0.6 + col * 4.7, y: 1.68 + row * 0.55, w: 4.3, h: 0.3,
        fontSize: 11, color: darkText,
        fontFace: 'Arial'
      });
    });

    slideMot2.addShape('rect', {
      x: 0.5, y: 4, w: 9, h: 0.7,
      fill: { color: 'DCFCE7' }, line: { color: '22C55E', pt: 1 }
    });
    slideMot2.addText("✅ KM Inteligente: O KM inicial é preenchido automaticamente com o KM final do último relatório do motorista.", {
      x: 0.6, y: 4.15, w: 8.8, h: 0.4,
      fontSize: 12, color: '166534',
      fontFace: 'Arial'
    });

    // =============== SLIDE 15: MOTORISTA - CHECKLIST ===============
    const slideMot3 = pres.addSlide();
    slideMot3.addText("Módulo do Motorista - CheckList Semanal", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideMot3.addText("Inspeção de segurança com 21 itens obrigatórios.", {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const itensChecklist = [
      'Óleo do motor', 'Água do radiador', 'Fluido de freio', 'Óleo hidráulico',
      'Freio de serviço', 'Freio estacionamento', 'Pneus (estado)', 'Pneus (calibragem)',
      'Estepe', 'Faróis', 'Lanternas', 'Setas',
      'Retrovisores', 'Limpador parabrisa', 'Buzina', 'Cinto segurança',
      'Extintor', 'Triângulo', 'Macaco/chave', 'Documentos', 'Limpeza geral'
    ];
    
    itensChecklist.forEach((item, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      slideMot3.addShape('rect', {
        x: 0.5 + col * 3.1, y: 1.5 + row * 0.38, w: 2.9, h: 0.32,
        fill: { color: lightBg }
      });
      slideMot3.addText(item, {
        x: 0.55 + col * 3.1, y: 1.54 + row * 0.38, w: 2.8, h: 0.25,
        fontSize: 9, color: darkText,
        fontFace: 'Arial'
      });
    });

    slideMot3.addText("Cada item pode ser: OK | Precisa Reparo | Crítico", {
      x: 0.5, y: 4.3, w: 9, h: 0.3,
      fontSize: 12, color: grayText,
      fontFace: 'Arial'
    });

    // =============== SLIDE 16: MOTORISTA - MANUTENÇÃO ===============
    const slideMot4 = pres.addSlide();
    slideMot4.addText("Módulo do Motorista - Manutenção", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideMot4.addText("Solicitação de reparos e acompanhamento.", {
      x: 0.5, y: 1, w: 9, h: 0.4,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const camposManut = ['Veículo com problema', 'Descrição detalhada do problema', 'Data da solicitação', 'Status (Pendente/Resolvido)', 'Data de resolução', 'Responsável pelo reparo'];
    camposManut.forEach((campo, i) => {
      slideMot4.addShape('rect', {
        x: 0.5, y: 1.6 + i * 0.55, w: 9, h: 0.45,
        fill: { color: lightBg }
      });
      slideMot4.addText(campo, {
        x: 0.6, y: 1.68 + i * 0.55, w: 8.8, h: 0.3,
        fontSize: 12, color: darkText,
        fontFace: 'Arial'
      });
    });

    // =============== SLIDE 17: FINANCEIRO ===============
    const slideFin = pres.addSlide();
    slideFin.addText("Módulo Financeiro", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    
    slideFin.addText("Contas a Pagar:", {
      x: 0.5, y: 1, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideFin.addText("Gestão de pagamentos a fornecedores com: fornecedor, valor original, juros/multa, valor final, vencimento, competência, status, conta de pagamento, parcelamento.", {
      x: 0.5, y: 1.45, w: 9, h: 0.7,
      fontSize: 13, color: grayText,
      fontFace: 'Arial'
    });
    
    slideFin.addText("Contas a Receber:", {
      x: 0.5, y: 2.3, w: 9, h: 0.4,
      fontSize: 18, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideFin.addText("Controle de recebimentos de clientes com: venda associada, valor original, juros/multa, valor final, status, data de recebimento, conta, comprovante anexo.", {
      x: 0.5, y: 2.75, w: 9, h: 0.7,
      fontSize: 13, color: grayText,
      fontFace: 'Arial'
    });

    // =============== SLIDE 18: PERMUTA ===============
    const slidePerm = pres.addSlide();
    slidePerm.addText("Sistema de Permuta", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slidePerm.addText("Sistema exclusivo para clientes com crédito de permuta habilitado.", {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const funcPerm = [
      { title: 'Dashboard de Permuta', desc: 'Visão geral de clientes com permuta ativa' },
      { title: 'Extrato por Cliente', desc: 'Histórico detalhado de créditos e débitos' },
      { title: 'Controle de Saldo', desc: 'Saldo atual, limite negativo e crédito disponível' },
      { title: 'Integração com Vendas', desc: 'Pagamento "Permuta" deduz automaticamente' },
    ];
    funcPerm.forEach((func, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      slidePerm.addShape('rect', {
        x: 0.5 + col * 4.7, y: 1.5 + row * 1, w: 4.5, h: 0.9,
        fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
      });
      slidePerm.addText(func.title, {
        x: 0.6 + col * 4.7, y: 1.6 + row * 1, w: 4.3, h: 0.35,
        fontSize: 13, color: darkText, bold: true,
        fontFace: 'Arial'
      });
      slidePerm.addText(func.desc, {
        x: 0.6 + col * 4.7, y: 1.95 + row * 1, w: 4.3, h: 0.35,
        fontSize: 11, color: grayText,
        fontFace: 'Arial'
      });
    });

    slidePerm.addShape('rect', {
      x: 0.5, y: 3.7, w: 9, h: 1,
      fill: { color: 'DBEAFE' }, line: { color: '3B82F6', pt: 1 }
    });
    slidePerm.addText("💡 Como Funciona: Cliente recebe crédito → Usa \"Permuta\" como pagamento → Saldo descontado automaticamente → Pode ter limite negativo configurável (débito).", {
      x: 0.6, y: 3.85, w: 8.8, h: 0.7,
      fontSize: 11, color: '1E40AF',
      fontFace: 'Arial'
    });

    // =============== SLIDE 19: RELATÓRIOS ===============
    const slideRel = pres.addSlide();
    slideRel.addText("Relatórios e Assistente IA", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slideRel.addText("Análises detalhadas e consultas inteligentes via linguagem natural.", {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const relatorios = [
      { title: 'Vendas', desc: 'Por período, cliente, produto' },
      { title: 'Produtos', desc: 'Saída em M³ e Toneladas' },
      { title: 'Clientes', desc: 'Análise da carteira' },
      { title: 'Financeiro', desc: 'Fluxo de caixa' },
      { title: 'Fornecedores', desc: 'Compras por fornecedor' },
      { title: 'Permuta', desc: 'Saldos e movimentações' },
      { title: 'Ticagem', desc: 'Carregados vs Pendentes' },
      { title: 'Partes Diárias', desc: 'Viagens dos motoristas' },
      { title: 'Checklists', desc: 'Inspeções veiculares' },
      { title: 'Assistente IA', desc: 'Consultas em linguagem natural' },
    ];
    
    relatorios.forEach((rel, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      slideRel.addShape('rect', {
        x: 0.5 + col * 4.7, y: 1.4 + row * 0.55, w: 4.5, h: 0.45,
        fill: { color: lightBg }
      });
      slideRel.addText(`${rel.title}: ${rel.desc}`, {
        x: 0.6 + col * 4.7, y: 1.48 + row * 0.55, w: 4.3, h: 0.32,
        fontSize: 11, color: darkText,
        fontFace: 'Arial'
      });
    });

    slideRel.addShape('rect', {
      x: 0.5, y: 4.2, w: 9, h: 0.7,
      fill: { color: 'F3E8FF' }, line: { color: '9333EA', pt: 1 }
    });
    slideRel.addText("🤖 Assistente IA: Pergunte em português \"vendas do mês\", \"clientes com saldo\", \"produtos mais vendidos\" e receba respostas instantâneas.", {
      x: 0.6, y: 4.3, w: 8.8, h: 0.5,
      fontSize: 11, color: '6B21A8',
      fontFace: 'Arial'
    });

    // =============== SLIDE 20: CONFIGURAÇÕES ===============
    const slideConf = pres.addSlide();
    slideConf.addText("Configurações", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    
    const configItems = [
      { title: 'Dados da Empresa', desc: 'Nome, CNPJ, endereço, telefone, e-mail (aparecem nos documentos)' },
      { title: 'Usuários (Admin)', desc: 'Criar usuários, definir perfil, configurar permissões, ativar/desativar' },
      { title: 'Condições de Pagamento', desc: 'Dinheiro, PIX, Cartão Débito/Crédito, Depósito, Permuta, Boleto, Cheque' },
      { title: 'Contas de Recebimento', desc: 'Cadastro de contas bancárias para recebimentos' },
    ];
    
    configItems.forEach((item, i) => {
      slideConf.addShape('rect', {
        x: 0.5, y: 1 + i * 1, w: 9, h: 0.9,
        fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
      });
      slideConf.addText(item.title, {
        x: 0.6, y: 1.1 + i * 1, w: 8.8, h: 0.35,
        fontSize: 14, color: darkText, bold: true,
        fontFace: 'Arial'
      });
      slideConf.addText(item.desc, {
        x: 0.6, y: 1.45 + i * 1, w: 8.8, h: 0.35,
        fontSize: 12, color: grayText,
        fontFace: 'Arial'
      });
    });

    // =============== SLIDE 21: PERMISSÕES ===============
    const slidePerms = pres.addSlide();
    slidePerms.addText("Sistema de Permissões", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    slidePerms.addText("Controle granular de acesso por perfil e módulo.", {
      x: 0.5, y: 0.9, w: 9, h: 0.4,
      fontSize: 16, color: darkText,
      fontFace: 'Arial'
    });
    
    const perfis = [
      { title: 'Admin', desc: 'Acesso total, incluindo gestão de usuários e configurações', color: '3B82F6' },
      { title: 'Vendedor', desc: 'Vendas, cadastro de clientes/produtos e financeiro', color: '6B7280' },
      { title: 'Operador', desc: 'Módulo de operação: carregamentos e abastecimentos', color: '9CA3AF' },
      { title: 'Motorista', desc: 'Exclusivo: parte diária, checklist, manutenção', color: '9CA3AF' },
    ];
    
    perfis.forEach((perfil, i) => {
      slidePerms.addShape('rect', {
        x: 0.5, y: 1.4 + i * 0.85, w: 9, h: 0.75,
        fill: { color: 'FFFFFF' }, line: { color: perfil.color, pt: 2 }
      });
      slidePerms.addText(perfil.title, {
        x: 0.6, y: 1.5 + i * 0.85, w: 8.8, h: 0.3,
        fontSize: 14, color: perfil.color, bold: true,
        fontFace: 'Arial'
      });
      slidePerms.addText(perfil.desc, {
        x: 0.6, y: 1.8 + i * 0.85, w: 8.8, h: 0.3,
        fontSize: 12, color: grayText,
        fontFace: 'Arial'
      });
    });

    // =============== SLIDE 22: DESTAQUES TÉCNICOS 1 ===============
    const slideTec1 = pres.addSlide();
    slideTec1.addText("Destaques Técnicos - Cálculos", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    
    slideTec1.addShape('rect', {
      x: 0.5, y: 1, w: 9, h: 1.3,
      fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
    });
    slideTec1.addText("📊 Cálculo Automático de Desconto", {
      x: 0.6, y: 1.1, w: 8.8, h: 0.35,
      fontSize: 14, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideTec1.addText("O desconto é calculado automaticamente quando o vendedor informa o \"Preço Praticado\" diferente do preço cadastrado.", {
      x: 0.6, y: 1.5, w: 8.8, h: 0.4,
      fontSize: 12, color: grayText,
      fontFace: 'Arial'
    });
    slideTec1.addText("Fórmula: (Preço Cadastrado - Preço Praticado) / Preço Cadastrado × 100", {
      x: 0.6, y: 1.95, w: 8.8, h: 0.3,
      fontSize: 11, color: '6B7280', italic: true,
      fontFace: 'Courier New'
    });

    slideTec1.addShape('rect', {
      x: 0.5, y: 2.5, w: 9, h: 1.3,
      fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
    });
    slideTec1.addText("⚖️ Cálculo Automático de Peso", {
      x: 0.6, y: 2.6, w: 8.8, h: 0.35,
      fontSize: 14, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideTec1.addText("O peso em toneladas é calculado automaticamente usando a densidade configurada no cadastro do produto.", {
      x: 0.6, y: 3, w: 8.8, h: 0.4,
      fontSize: 12, color: grayText,
      fontFace: 'Arial'
    });
    slideTec1.addText("Fórmula: Peso (ton) = Quantidade (M³) × Densidade (ton/m³)", {
      x: 0.6, y: 3.45, w: 8.8, h: 0.3,
      fontSize: 11, color: '6B7280', italic: true,
      fontFace: 'Courier New'
    });

    // =============== SLIDE 23: DESTAQUES TÉCNICOS 2 - IA ===============
    const slideTec2 = pres.addSlide();
    slideTec2.addText("Destaques Técnicos - Inteligência Artificial", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });
    
    slideTec2.addShape('rect', {
      x: 0.5, y: 0.95, w: 9, h: 1.3,
      fill: { color: 'F3E8FF' }, line: { color: '9333EA', pt: 2 }
    });
    slideTec2.addText("🤖 Verificação de Pesagem com IA", {
      x: 0.6, y: 1.05, w: 8.8, h: 0.3,
      fontSize: 13, color: '6B21A8', bold: true,
      fontFace: 'Arial'
    });
    slideTec2.addText("O operador fotografa o ticket de pesagem e a IA extrai peso bruto, tara e líquido automaticamente, comparando com peso esperado. Alerta divergências > 5%.", {
      x: 0.6, y: 1.4, w: 8.8, h: 0.5,
      fontSize: 11, color: '7C3AED',
      fontFace: 'Arial'
    });
    slideTec2.addText("Tecnologia: Edge Function + Gemini Vision", {
      x: 0.6, y: 1.95, w: 8.8, h: 0.25,
      fontSize: 9, color: '9333EA', italic: true,
      fontFace: 'Arial'
    });

    slideTec2.addShape('rect', {
      x: 0.5, y: 2.4, w: 9, h: 1.3,
      fill: { color: 'F3E8FF' }, line: { color: '9333EA', pt: 2 }
    });
    slideTec2.addText("💬 Assistente de Negócios com IA", {
      x: 0.6, y: 2.5, w: 8.8, h: 0.3,
      fontSize: 13, color: '6B21A8', bold: true,
      fontFace: 'Arial'
    });
    slideTec2.addText("Consulte dados do sistema em linguagem natural: \"vendas do mês\", \"clientes com saldo devedor\", \"produtos mais vendidos\". Respostas instantâneas com dados reais.", {
      x: 0.6, y: 2.85, w: 8.8, h: 0.5,
      fontSize: 11, color: '7C3AED',
      fontFace: 'Arial'
    });
    slideTec2.addText("Acesso: Relatórios → Assistente IA", {
      x: 0.6, y: 3.4, w: 8.8, h: 0.25,
      fontSize: 9, color: '9333EA', italic: true,
      fontFace: 'Arial'
    });

    slideTec2.addShape('rect', {
      x: 0.5, y: 3.85, w: 4.4, h: 0.95,
      fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
    });
    slideTec2.addText("🖨️ Impressão Otimizada", {
      x: 0.6, y: 3.95, w: 4.2, h: 0.25,
      fontSize: 11, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideTec2.addText("Layout meia folha A4, assinatura vendedor automática, campo CPF motorista.", {
      x: 0.6, y: 4.25, w: 4.2, h: 0.45,
      fontSize: 9, color: grayText,
      fontFace: 'Arial'
    });

    slideTec2.addShape('rect', {
      x: 5.1, y: 3.85, w: 4.4, h: 0.95,
      fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
    });
    slideTec2.addText("📊 KM Inicial Inteligente", {
      x: 5.2, y: 3.95, w: 4.2, h: 0.25,
      fontSize: 11, color: darkText, bold: true,
      fontFace: 'Arial'
    });
    slideTec2.addText("Campo preenchido automaticamente com KM final do relatório anterior.", {
      x: 5.2, y: 4.25, w: 4.2, h: 0.45,
      fontSize: 9, color: grayText,
      fontFace: 'Arial'
    });

    // =============== SLIDE 24: DESTAQUES TÉCNICOS 3 - DASHBOARD ===============
    const slideTec3 = pres.addSlide();
    slideTec3.addText("Destaques Técnicos - Dashboard Executivo", {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 32, color: primaryColor, bold: true,
      fontFace: 'Arial'
    });

    const dashFeatures = [
      { title: '📈 Tendência de Vendas', desc: 'Gráfico de área com evolução dos últimos 6 meses e comparação MoM' },
      { title: '💰 Fluxo de Caixa', desc: 'Gráfico de barras comparando Recebíveis vs Pagáveis nos próximos 15 dias' },
      { title: '🏆 Top 5 Produtos', desc: 'Ranking horizontal dos produtos mais vendidos do mês' },
      { title: '👥 Ranking de Vendedores', desc: 'Leaderboard mensal com receita, quantidade de vendas e progress bar' },
      { title: '🚨 Alertas do Sistema', desc: 'Estoque crítico, contas vencidas, manutenções pendentes, checklists atrasados' },
      { title: '🔄 Dados em Tempo Real', desc: 'Todas as informações são atualizadas automaticamente do banco de dados' },
    ];

    dashFeatures.forEach((feat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      slideTec3.addShape('rect', {
        x: 0.5 + col * 4.7, y: 1 + row * 1.1, w: 4.5, h: 1,
        fill: { color: lightBg }, line: { color: 'D1D5DB', pt: 1 }
      });
      slideTec3.addText(feat.title, {
        x: 0.6 + col * 4.7, y: 1.1 + row * 1.1, w: 4.3, h: 0.3,
        fontSize: 12, color: darkText, bold: true,
        fontFace: 'Arial'
      });
      slideTec3.addText(feat.desc, {
        x: 0.6 + col * 4.7, y: 1.45 + row * 1.1, w: 4.3, h: 0.5,
        fontSize: 10, color: grayText,
        fontFace: 'Arial'
      });
    });

    slideTec3.addShape('rect', {
      x: 0.5, y: 4.4, w: 9, h: 0.6,
      fill: { color: 'DBEAFE' }, line: { color: '3B82F6', pt: 1 }
    });
    slideTec3.addText("💡 Acesso: Menu Principal → Dashboard (todos os perfis têm acesso ao painel inicial)", {
      x: 0.6, y: 4.5, w: 8.8, h: 0.4,
      fontSize: 11, color: '1E40AF',
      fontFace: 'Arial'
    });

    // =============== SLIDE 25: ENCERRAMENTO ===============
    const slideFinal = pres.addSlide();
    slideFinal.addText("SISTEMA CEZAR", {
      x: 0, y: 2.2, w: '100%', h: 0.8,
      fontSize: 44, color: primaryColor, bold: true, align: 'center',
      fontFace: 'Arial'
    });
    slideFinal.addText("Obrigado!", {
      x: 0, y: 3.1, w: '100%', h: 0.6,
      fontSize: 28, color: darkText, align: 'center',
      fontFace: 'Arial'
    });
    slideFinal.addText(`© ${new Date().getFullYear()} - Todos os direitos reservados`, {
      x: 0, y: 4, w: '100%', h: 0.4,
      fontSize: 14, color: grayText, align: 'center',
      fontFace: 'Arial'
    });

    // Salvar arquivo
    pres.writeFile({ fileName: "Manual-Sistema-CEZAR.pptx" });
  };

  return (
    <div className="min-h-screen bg-background print:bg-white print:min-h-0">
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
          <div className="flex items-center gap-2">
            <Button onClick={handleDownloadPPTX} className="gap-2">
              <Download className="h-4 w-4" />
              Baixar PowerPoint
            </Button>
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block text-center py-8 border-b border-gray-300 bg-white">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">SISTEMA CEZAR</h1>
        <p className="text-xl text-gray-600">Manual Completo de Funcionalidades</p>
        <p className="text-sm text-gray-500 mt-2">Documento gerado em {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div className="flex max-w-6xl mx-auto print:max-w-none print:block">
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
        <main className="flex-1 p-6 lg:p-8 print:p-0 print:w-full">
          <div className="max-w-4xl mx-auto space-y-8 print:max-w-none print:space-y-4">
            
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
                      { title: 'Relatórios e IA', desc: 'Dashboard analítico e assistente inteligente' },
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
                    Painel executivo com indicadores em tempo real e gráficos analíticos.
                  </p>
                  
                  <h4 className="font-semibold mt-4">Cards de Estatísticas:</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Receita do Mês', desc: 'Valor total de vendas com comparação MoM' },
                      { label: 'Total de Vendas', desc: 'Quantidade de pedidos realizados' },
                      { label: 'Clientes Ativos', desc: 'Número de clientes cadastrados' },
                      { label: 'Contas a Receber', desc: 'Total pendente de recebimento' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-semibold mt-4">Gráficos e Visualizações:</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Tendência de Vendas', desc: 'Gráfico de área com evolução dos últimos 6 meses' },
                      { label: 'Fluxo de Caixa', desc: 'Recebíveis vs Pagáveis nos próximos 15 dias' },
                      { label: 'Top 5 Produtos', desc: 'Ranking horizontal dos produtos mais vendidos' },
                      { label: 'Ranking de Vendedores', desc: 'Leaderboard mensal com receita e quantidade' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-semibold mt-4">Alertas do Sistema:</h4>
                  <p className="text-sm text-muted-foreground">
                    Avisos automáticos de estoque crítico, contas vencidas, manutenções pendentes e checklists atrasados.
                  </p>

                  <h4 className="font-semibold mt-4">Vendas Recentes e Ações Rápidas:</h4>
                  <p className="text-sm text-muted-foreground">
                    Lista das últimas vendas e botões de acesso rápido filtrados por permissões.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>💡 Comparações:</strong> Cada indicador mostra a variação percentual em relação ao mês anterior.
                    </p>
                  </div>
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
                          Solicitação de reparos e acompanhamento de manutenções.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">Veículo com problema</div>
                          <div className="p-2 bg-slate-50 rounded">Descrição detalhada</div>
                          <div className="p-2 bg-slate-50 rounded">Data da solicitação</div>
                          <div className="p-2 bg-slate-50 rounded">Status (Pendente/Resolvido)</div>
                          <div className="p-2 bg-slate-50 rounded">Data de resolução</div>
                          <div className="p-2 bg-slate-50 rounded">Responsável pelo reparo</div>
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
                      { title: 'Produtos', desc: 'Saída em M³ e Toneladas por produto' },
                      { title: 'Clientes', desc: 'Análise da carteira de clientes' },
                      { title: 'Financeiro', desc: 'Fluxo de caixa, receitas e despesas' },
                      { title: 'Fornecedores', desc: 'Análise de compras por fornecedor' },
                      { title: 'Permuta', desc: 'Saldos e movimentações de permuta' },
                      { title: 'Ticagem', desc: 'Ratio de pedidos carregados vs pendentes' },
                      { title: 'Partes Diárias', desc: 'Relatórios de viagens dos motoristas' },
                      { title: 'Checklists', desc: 'Histórico de inspeções veiculares' },
                      { title: 'Assistente IA', desc: 'Consultas em linguagem natural' },
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
                        📊 Cálculo Automático de Desconto
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        O desconto é calculado automaticamente quando o vendedor informa 
                        o "Preço Praticado" diferente do preço cadastrado.
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

                    <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                      <h4 className="font-semibold flex items-center gap-2 text-purple-800">
                        💬 Assistente de Negócios com IA
                      </h4>
                      <p className="text-sm text-purple-700 mt-1">
                        Consulte dados do sistema em linguagem natural: "vendas do mês", 
                        "clientes com saldo devedor", "produtos mais vendidos". 
                        Respostas instantâneas com dados reais do banco de dados.
                      </p>
                      <div className="mt-2 text-xs text-purple-600">
                        Acesso: Relatórios → Assistente IA
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold flex items-center gap-2">
                        📈 Dashboard Executivo
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Gráficos de tendência de vendas (6 meses), fluxo de caixa (15 dias), 
                        top 5 produtos, ranking de vendedores e alertas do sistema em tempo real.
                      </p>
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

      {/* Print Styles - Comprehensive print CSS */}
      <style>{`
        @media print {
          /* Reset everything for print */
          *, *::before, *::after {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Root and body */
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 12pt !important;
            line-height: 1.4 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Main container */
          .min-h-screen {
            min-height: auto !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
          }
          
          /* Flex container fix */
          .flex {
            display: block !important;
          }
          
          /* Max-width fixes */
          .max-w-6xl, .max-w-4xl {
            max-width: 100% !important;
          }
          
          /* Hide screen-only elements */
          header, aside, .print\\:hidden, [class*="print:hidden"] {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Show print elements */
          .hidden.print\\:block, [class*="print:block"] {
            display: block !important;
            visibility: visible !important;
          }
          
          /* Main content area */
          main, main > div {
            width: 100% !important;
            max-width: 100% !important;
            padding: 10px !important;
            margin: 0 !important;
            display: block !important;
          }
          
          /* Sections */
          section {
            display: block !important;
            visibility: visible !important;
            background: #ffffff !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid !important;
          }
          
          /* Cards */
          [class*="rounded-lg"], [class*="border"], .p-4, .p-6, .space-y-4 > div {
            background: #ffffff !important;
            background-color: #ffffff !important;
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            margin-bottom: 10px !important;
            padding: 10px !important;
            display: block !important;
            visibility: visible !important;
          }
          
          /* All text elements */
          h1, h2, h3, h4, h5, h6 {
            color: #111827 !important;
            page-break-after: avoid !important;
          }
          
          p, span, li, div, strong, em, a {
            color: #374151 !important;
          }
          
          /* Muted text */
          .text-muted-foreground, [class*="muted"] {
            color: #6b7280 !important;
          }
          
          /* Primary color text */
          .text-primary, [class*="primary"] {
            color: #2563eb !important;
          }
          
          /* Background colors to white */
          .bg-background, .bg-card, .bg-white, 
          [class*="bg-slate"], [class*="bg-blue"], 
          [class*="bg-green"], [class*="bg-amber"], 
          [class*="bg-red"], [class*="bg-gray"] {
            background: #f9fafb !important;
            background-color: #f9fafb !important;
          }
          
          /* Accordion - force all content visible */
          [data-state], [data-state] > * {
            display: block !important;
            visibility: visible !important;
            height: auto !important;
            overflow: visible !important;
            opacity: 1 !important;
          }
          
          /* AccordionContent specifically */
          [data-state="closed"] {
            display: block !important;
            height: auto !important;
          }
          
          /* Grid to block for print */
          .grid {
            display: block !important;
          }
          
          .grid > * {
            margin-bottom: 8px !important;
          }
          
          /* Page breaks */
          .print\\:break-before-page, [class*="print:break-before-page"] {
            page-break-before: always !important;
            break-before: page !important;
          }
          
          /* Page settings */
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          
          /* First page no break */
          section:first-of-type {
            page-break-before: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Documentation;
