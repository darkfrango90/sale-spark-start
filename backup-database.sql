-- ============================================
-- BACKUP SISTEMA CEZAR - 28/01/2026
-- Tabelas: customers, products, sales, sale_items, payment_methods
-- ============================================

-- PAYMENT METHODS (Executar primeiro)
INSERT INTO payment_methods (id, name, active, created_at) VALUES
('c7d382bb-2542-456d-b034-b360b0f3c8c3', 'A Prazo', true, '2026-01-12 19:39:04.565879+00'),
('3f0101f8-46ee-4da5-abe3-ef7736c5a489', 'À Vista', true, '2026-01-12 19:39:04.565879+00'),
('609e973e-e906-4854-9f6f-e549ebb31131', 'Boleto', true, '2026-01-12 19:39:04.565879+00'),
('d283663a-ffe3-4be9-9579-483e31d9f7d0', 'Cartão de Débito', true, '2026-01-12 19:39:04.565879+00'),
('10f88d6e-a878-46df-90f4-775cfbf10d30', 'Cartão no Crédito', true, '2026-01-12 19:39:04.565879+00'),
('8be65b9c-d329-4541-abc4-f9185140ca45', 'Carteira', true, '2026-01-12 19:39:04.565879+00'),
('983afeb8-9365-40a2-b951-7b371f1d75bb', 'Permuta', true, '2026-01-12 19:39:04.565879+00'),
('9e72b76d-18b7-4f69-96ac-a12f8fafff37', 'Pix', true, '2026-01-12 19:39:04.565879+00')
ON CONFLICT (id) DO NOTHING;

-- PRODUCTS (13 produtos)
INSERT INTO products (id, code, name, description, category, unit, density, cost_price, sale_price, stock, min_stock, active, created_at, updated_at) VALUES
('0d5f59a6-60e0-4e86-88b4-824132b30404', '001', 'AREIA FINA', 'AREIA FINA LAVADA', 'AREIA', 'M3', 1490, 48, 72, 100000, 1, true, '2026-01-12 19:54:58.674375+00', '2026-01-22 12:10:58.709015+00'),
('96eb48b8-010e-42bf-b010-efc48be3588f', '002', 'AREIA MEDIA', 'AREIA MEDIA LAVADA', 'AREIA', 'M3', 1520, 48, 72, 100000, 10, true, '2026-01-22 12:09:52.840722+00', '2026-01-22 12:09:52.840722+00'),
('10cc90ed-1854-4a34-84f6-49d3d5c24b5f', '003', 'AREIA GROSSA', 'AREIA GROSSA LAVADA', 'AREIA', 'M3', 1564, 48, 72, 100000, 10, true, '2026-01-22 12:10:47.437105+00', '2026-01-22 12:10:47.437105+00'),
('6a72b308-f824-4289-895c-5c05642ea6bd', '004', 'PEDRISCO ROLADO', 'PEDRISCO ROLADO', 'SEIXO', 'M3', 1615, 94, 141, 100000, 10, true, '2026-01-22 12:12:59.357116+00', '2026-01-22 12:12:59.357116+00'),
('e01e5a50-695d-4668-aaad-802d4374933f', '005', 'SEIXO ROLADO Nº 0', 'SEIXO ROLADO Nº 0', 'SEIXO', 'M3', 1579, 85, 127, 100000, 10, true, '2026-01-22 12:14:08.065388+00', '2026-01-22 12:14:08.065388+00'),
('807d6efa-8861-4ec6-9e84-170e04ad3793', '006', 'SEIXO ROLADO Nº 1', 'SEIXO ROLADO Nº 1', 'SEIXO', 'M3', 127, 85, 127, 100000, 10, true, '2026-01-22 12:15:01.08001+00', '2026-01-22 12:15:01.08001+00'),
('e6952355-265f-402e-81d0-b23077c1eebf', '007', 'SEIXO ROLADO Nº 2/3', 'SEIXO MISTO 2/3', 'SEIXO', 'M3', 1764, 85, 127, 100000, 10, true, '2026-01-22 12:15:53.270688+00', '2026-01-22 12:15:53.270688+00'),
('ff6246f6-cca8-43c7-8e2c-d99ba3091236', '008', 'PO DE SEIXO BRITADO', 'PO DE SEIXO BRITADO', 'SEIXO', 'M3', 1400, 76, 113, 100000, 10, true, '2026-01-22 12:17:52.073871+00', '2026-01-22 12:17:52.073871+00'),
('fd3a7ceb-3f7d-479e-bceb-91fdacb1edea', '009', 'SEIXO BRITADO Nº 0', 'SEIXO BRITADO Nº 0', 'SEIXO', 'M3', 1428, 105, 158, 100000, 10, true, '2026-01-22 12:19:08.296382+00', '2026-01-22 12:19:08.296382+00'),
('fae21d21-9d19-4d65-8690-a86df4ed9bb0', '010', 'SEIXO BRITADO Nº 1', 'SEIXO BRITADO Nº 1', 'SEIXO', 'M3', 1405, 105, 158, 100000, 10, true, '2026-01-22 12:20:07.748437+00', '2026-01-22 12:20:07.748437+00'),
('54e17735-a585-4f90-b986-f03fa62fb315', '011', 'AREIA FUNDO DE VALA', 'AREIA FUNDO DE VALA', 'AREIA', 'M3', 1530, 32, 48, 100000, 10, true, '2026-01-22 12:21:36.389849+00', '2026-01-22 12:21:36.389849+00'),
('1a2798e0-aa8f-43b5-ae4c-dfd6982b6d9e', '025', 'AREIA FILTRANTE PISCINA', 'AREIA FILTRANTE ESPECIAL', 'AREIA', 'KG', 1500, 0.7, 1, 100000, 100, true, '2026-01-22 12:23:11.359199+00', '2026-01-22 12:23:11.359199+00'),
('354edfe8-725c-48b2-ac8a-c6ed863d7404', '999', 'FRETE', 'Valor do frete', 'Serviço', 'UN', NULL, 0, 0, 9999, 0, true, '2026-01-13 14:54:46.422213+00', '2026-01-13 16:15:43.160839+00')
ON CONFLICT (id) DO NOTHING;

-- CUSTOMERS (primeiros registros de exemplo - dados truncados para segurança)
-- Execute a consulta SELECT * FROM customers no Supabase para obter todos os clientes
INSERT INTO customers (id, code, name, trade_name, type, cpf_cnpj, rg_ie, phone, cellphone, email, zip_code, street, number, complement, neighborhood, city, state, birth_date, notes, active, has_barter, barter_credit, barter_limit, barter_notes, created_at, updated_at) VALUES
('2f032641-9781-407f-b7a3-2c916c0272db', '001', 'teste teste', NULL, 'fisica', '000.000.000-01', NULL, '(63) 3215-5767', NULL, 'teste@teste.com', '77000-000', 'QUADRA 409 NORTE ALAMEDA 25 LOTE 10', '10', 'NORTE', 'PLANO DIRETOR NORTE', 'PALMAS', 'TO', NULL, 'teste', true, false, 0, 0, NULL, '2026-01-12 19:46:10.032912+00', '2026-01-12 20:37:47.973034+00'),
('c86bfb71-df92-4c92-bc57-dc73aa4dc8a5', '002', 'cliente permuta teste', NULL, 'fisica', '000.000.000-02', NULL, '(63) 9844-4655', NULL, 'teste@teste.com', '77000-000', 'RUA SEM NOME', '10', NULL, 'CENTRO', 'PALMAS', 'TO', '1987-03-31', 'TESTE', true, true, 50000, 2000, 'CREDITO EM TELHA TESTE', '2026-01-17 14:41:23.483745+00', '2026-01-17 14:41:23.483745+00'),
('6da4bbe9-4bbe-4ba2-88c6-7a958b35cb6e', '003', 'DIONES PACNI', NULL, 'fisica', '00978367103', '5', '6384533873', NULL, NULL, '77000-000', 'SEM NUMERO', NULL, NULL, 'P', 'PALMAS', 'TO', NULL, NULL, true, false, 0, 0, NULL, '2026-01-21 19:56:39.970485+00', '2026-01-21 19:56:39.970485+00'),
('09dc632d-aa00-4f2d-a034-fac3113e0a14', '004', 'GILVAN ALVES FERREIRA', NULL, 'fisica', '37863193249', '0', '6381210599', NULL, NULL, '77000-000', 'CHACARA TEM A MESMA ENTRADA DA', NULL, NULL, 'PLANO DIRETOR NORTE', 'PALMAS', 'TO', NULL, NULL, true, false, 0, 0, NULL, '2026-01-21 19:56:40.914112+00', '2026-01-21 19:56:40.914112+00'),
('59329e46-b913-4613-97ad-c111155405d2', '005', 'RAFAELLA CARVALHO SOU', NULL, 'fisica', '03791148109', '0', '6384103879', NULL, NULL, '77000-000', 'LOTEAMENTO  JAU 4 ETAPA CHACAR', NULL, NULL, 'LOTEAMENTO  JAU', 'PALMAS', 'TO', NULL, NULL, true, false, 0, 0, NULL, '2026-01-21 19:56:41.73782+00', '2026-01-21 19:56:41.73782+00'),
('7f814644-6c6f-4e7d-a0c4-58edfe8225a6', '006', 'A B NOLETO DE OLIVEIR', 'A B NOLETO DE OLIVEIRA LTDA', 'juridica', '34202096000192', '29.497.641-8', '6332253401', NULL, NULL, '77006-316', '212 NORTE ALAMEDA 8', NULL, NULL, 'PLANO DIRETOR NORTE', 'PALMAS', 'TO', NULL, NULL, true, false, 0, 0, NULL, '2026-01-21 19:56:42.54249+00', '2026-01-21 19:56:42.54249+00'),
('8e659983-c440-4197-b04c-9e63a9c5bdba', '007', 'A H BRAS INDUSTRIA', 'JBRAS', 'juridica', '12488659000118', '29.426.162-1', '6332155636', NULL, NULL, '77060-820', 'ALAMEDA TOCANTINS, QD 5', NULL, NULL, 'DIST. IND. DE TAQUARALTO', 'PALMAS', 'TO', NULL, NULL, true, false, 0, 0, NULL, '2026-01-21 19:56:43.330473+00', '2026-01-21 19:56:43.330473+00'),
('fafcec89-f412-4b6b-b497-209bb9346d06', '008', 'A2G ENGENHARIA E CONC', 'A2G ENGENHARIA', 'juridica', '11815034000150', '29.423.586-8', '(63)9987-5200', NULL, NULL, '77500-000', 'RUA TOCANTINS QD. L, LOTE 01', NULL, NULL, 'SETOR DAS MANSOES', 'PORTO NACIONAL', NULL, NULL, NULL, true, false, 0, 0, NULL, '2026-01-21 19:56:44.124952+00', '2026-01-21 19:56:44.124952+00'),
('40fc2495-69b0-4cb8-82e4-b2e1ce6baeab', '009', 'ABELARDO DA COSTA LEI', NULL, 'fisica', '86864033104', 'ISENTO', '(63)9215-9096', NULL, NULL, '77000-000', 'CHACARA AGUA BOA', NULL, NULL, 'PLANO DIRETOR NORTE', 'PALMAS', NULL, NULL, NULL, true, false, 0, 0, NULL, '2026-01-21 19:56:44.845738+00', '2026-01-21 19:56:44.845738+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- NOTA: Para obter TODOS os clientes e vendas completas,
-- execute no SQL Editor do Supabase:
-- 
-- SELECT 'INSERT INTO customers VALUES (' || 
--   quote_literal(id) || ',' || 
--   quote_literal(code) || ',' || 
--   ... etc
-- FROM customers;
-- ============================================

-- Para exportar dados completos, use o Supabase Dashboard:
-- 1. Acesse Table Editor
-- 2. Selecione a tabela (customers, products, sales, sale_items)
-- 3. Clique em "Export" > "Download as CSV"
-- 4. Importe no novo projeto usando "Import from CSV"
