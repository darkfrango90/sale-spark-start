
# Plano: Configurar API da OpenAI no Assistente Inteligente

## Objetivo
Substituir o modelo Lovable AI (Google Gemini) pela API da OpenAI (GPT-4) usando sua própria chave de API para melhorar a interpretação de perguntas e a acurácia das respostas.

---

## Etapas de Implementação

### 1. Adicionar Secret da OpenAI
Você precisará fornecer sua chave de API da OpenAI (`OPENAI_API_KEY`). Vou solicitar isso através da ferramenta de secrets.

### 2. Atualizar Edge Function `business-chat`

Modificar o arquivo `supabase/functions/business-chat/index.ts`:

**Mudanças principais:**
- Usar a API da OpenAI diretamente (`https://api.openai.com/v1/chat/completions`)
- Usar o modelo `gpt-4o` (mais recente e preciso)
- Manter as mesmas ferramentas (tools) e lógica de consulta ao banco

**Estrutura da chamada OpenAI:**
```text
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer $OPENAI_API_KEY
  Content-Type: application/json
Body:
  model: "gpt-4o"
  messages: [system_prompt, ...user_messages]
  tools: [query_customers, query_products, query_sales, etc.]
  stream: true
```

### 3. Benefícios do GPT-4o

| Aspecto | Modelo Atual (Gemini Flash) | GPT-4o |
|---------|---------------------------|--------|
| Compreensão de contexto | Bom | Excelente |
| Interpretação de português | Bom | Muito bom |
| Tool calling | Funciona | Mais preciso |
| Raciocínio complexo | Básico | Avançado |

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/business-chat/index.ts` | Trocar endpoint de Lovable AI para OpenAI, adicionar fallback para `LOVABLE_API_KEY` caso OpenAI não esteja configurado |

---

## Detalhes Técnicos

### Estrutura atualizada da Edge Function

```text
1. Verificar autenticação (mantém igual)
2. Verificar OPENAI_API_KEY
   - Se existir: usar API OpenAI com gpt-4o
   - Se não existir: usar Lovable AI como fallback
3. Enviar mensagens com system prompt + tools
4. Executar queries do banco de dados
5. Retornar resposta em streaming
```

### Modelos disponíveis (você pode escolher):
- `gpt-4o` - Mais recente, melhor raciocínio
- `gpt-4o-mini` - Mais rápido, custo menor
- `gpt-4-turbo` - Bom equilíbrio

---

## Custos Estimados (OpenAI)

| Modelo | Custo por 1K tokens (input) | Custo por 1K tokens (output) |
|--------|---------------------------|------------------------------|
| gpt-4o | $0.0025 | $0.01 |
| gpt-4o-mini | $0.00015 | $0.0006 |

Para referência: Uma pergunta típica + resposta usa aproximadamente 500-1500 tokens.

---

## Próximo Passo
Após aprovação, vou solicitar sua chave de API da OpenAI e implementar as mudanças.
