

# Plano: Mostrar Sugestões de IA Aplicadas na Importação

## Problema
Quando o usuário clica em "Aplicar Correções Automáticas", a tabela de pendências desaparece e o usuário não consegue ver quais correções foram realmente aplicadas.

## Solução
Adicionar um histórico de correções aplicadas que mostra exatamente o que a IA alterou.

---

## Etapa 1: Adicionar Estado para Rastrear Correções Aplicadas

**Arquivo:** `src/pages/settings/DataImport.tsx`

Criar novo estado para armazenar as correções que foram aplicadas:

```typescript
interface AppliedFix {
  row: number;
  field: string;
  originalValue: any;
  newValue: any;
  problem: string;
}

const [appliedFixes, setAppliedFixes] = useState<AppliedFix[]>([]);
```

---

## Etapa 2: Modificar `applyAutoFixes` para Registrar Alterações

Atualizar a função para salvar as correções antes de aplicá-las:

```typescript
const applyAutoFixes = () => {
  if (!analysis) return;

  const fixes: AppliedFix[] = [];

  const updatedItems = analysis.items.map(item => {
    if (item.status === 'needs_correction') {
      const autoFixableIssues = item.issues.filter(i => i.canAutoFix && i.suggestedValue !== null);
      
      if (autoFixableIssues.length > 0) {
        // Registrar cada correção aplicada
        autoFixableIssues.forEach(issue => {
          fixes.push({
            row: item.row,
            field: issue.field,
            originalValue: issue.currentValue,
            newValue: issue.suggestedValue,
            problem: issue.problem
          });
        });
        // ... resto da lógica existente
      }
    }
    return item;
  });

  setAppliedFixes(fixes);
  // ... resto da atualização
};
```

---

## Etapa 3: Adicionar Card de Correções Aplicadas

Criar novo card que aparece após aplicar correções, mostrando exatamente o que foi alterado:

```tsx
{appliedFixes.length > 0 && (
  <Card className="border-green-200 bg-green-50/30">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-green-700">
        <CheckCircle2 className="h-5 w-5" />
        Correções Aplicadas pela IA ({appliedFixes.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[200px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Linha</TableHead>
              <TableHead>Campo</TableHead>
              <TableHead>Problema</TableHead>
              <TableHead>Valor Original</TableHead>
              <TableHead>Valor Corrigido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appliedFixes.map((fix, idx) => (
              <TableRow key={idx}>
                <TableCell>{fix.row}</TableCell>
                <TableCell className="font-medium">{fix.field}</TableCell>
                <TableCell className="text-muted-foreground">{fix.problem}</TableCell>
                <TableCell className="text-red-600 line-through">
                  {fix.originalValue?.toString() || '-'}
                </TableCell>
                <TableCell className="text-green-600 font-medium">
                  {fix.newValue?.toString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </CardContent>
  </Card>
)}
```

---

## Etapa 4: Melhorar a Mensagem do Toast

Atualizar o toast para ser mais informativo:

```typescript
toast.success('Correções aplicadas', { 
  description: `${fixes.length} campo(s) corrigido(s) automaticamente. Veja os detalhes abaixo.` 
});
```

---

## Etapa 5: Limpar Histórico ao Reiniciar

Resetar `appliedFixes` quando o usuário cancela ou inicia nova importação:

- No botão "Cancelar": `setAppliedFixes([])`
- Ao carregar novo arquivo: `setAppliedFixes([])`

---

## Resultado Esperado

Após clicar "Aplicar Correções Automáticas":

1. Toast mostra: "X campo(s) corrigido(s) automaticamente"
2. Card verde "Correções Aplicadas pela IA" aparece com tabela mostrando:
   - Linha afetada
   - Campo corrigido
   - Qual era o problema
   - Valor original (riscado em vermelho)
   - Valor corrigido (em verde)
3. Tabela de "Dados Prontos" mostra os itens já com valores corrigidos

---

## Arquivos a Modificar

1. **`src/pages/settings/DataImport.tsx`**
   - Adicionar estado `appliedFixes`
   - Modificar função `applyAutoFixes`
   - Adicionar card de correções aplicadas
   - Limpar estado ao cancelar/reiniciar

