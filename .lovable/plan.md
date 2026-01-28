

# Plano de Correcao: Remover Acentuacao do Arquivo

## Problema Identificado

O arquivo `.lovable/full-code-export.md` esta exibindo caracteres corrompidos como:
- `Ã³` em vez de `o`
- `Ã¡` em vez de `a`
- `Ãº` em vez de `u`
- `â€"` em vez de `-`

Isso acontece porque o encoding UTF-8 nao esta sendo interpretado corretamente.

---

## Solucao

Vou reescrever o arquivo removendo TODOS os acentos e caracteres especiais:

### Substituicoes:
| Original | Substituir por |
|----------|----------------|
| á, à, ã, â | a |
| é, ê | e |
| í | i |
| ó, ô, õ | o |
| ú | u |
| ç | c |
| ñ | n |
| → | -> |
| ✅ | [OK] |
| ✓ | [x] |
| – | - |
| " " | " |

---

## Secoes Afetadas

O arquivo tem 650 linhas. As secoes que serao corrigidas:

1. **Titulo e Instrucoes** (linhas 1-14)
2. **Comentarios no codigo** (linhas 20-411)
3. **Descricoes de tipos** (linhas 415-540)
4. **Lista de arquivos** (linhas 544-623)
5. **Passos finais** (linhas 626-650)

---

## Implementacao

Vou reescrever o arquivo `.lovable/full-code-export.md` com texto limpo, sem acentos, mantendo todo o codigo-fonte intacto.

### Exemplo do resultado:

**Antes:**
```
## PRÓXIMO PASSO: COPIAR VIA GIT
✅ Produtos têm campo de Densidade
```

**Depois:**
```
## PROXIMO PASSO: COPIAR VIA GIT
[OK] Produtos tem campo de Densidade
```

---

## Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `.lovable/full-code-export.md` | Reescrever sem acentos |

