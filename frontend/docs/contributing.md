# Guia de contribuição

## Fluxo sugerido

1. Crie uma branch curta e descritiva.
2. Faça alterações pequenas e focadas.
3. Execute lint, testes e build antes de abrir a revisão.
4. Explique no pull request o problema, a solução e como validar.

## Código

- Prefira nomes claros a abreviações.
- Evite lógica de negócio dentro de componentes visuais.
- Não versione credenciais, tokens ou arquivos `.env`.
- Inclua testes para novos comportamentos quando a suíte estiver configurada.

## Commits

Use mensagens objetivas no imperativo. Exemplo:

```text
feat: adiciona formulário de acesso
fix: corrige validação do CPF
docs: atualiza instruções de execução
```
