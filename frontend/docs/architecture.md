# Arquitetura

## Visão geral

O projeto começa com uma estrutura independente de framework. A organização
pode ser refinada quando a stack e os requisitos funcionais forem definidos.

## Responsabilidades

- `public/`: recursos copiados ou publicados sem transformação.
- `public/assets/`: imagens, ícones e fontes acessíveis por URL pública.
- `src/`: todo o código-fonte da aplicação.
- `src/assets/`: recursos importados por componentes e processados pelo bundler.
- `src/components/`: elementos reutilizáveis da interface.
- `src/pages/`: composição das rotas e telas da aplicação.
- `src/services/`: clientes HTTP, adaptadores e integrações externas.
- `src/styles/`: estilos globais, temas, tokens e variáveis visuais.
- `src/utils/`: funções puras e auxiliares compartilhados.
- `tests/`: testes que não ficam próximos ao código testado, como testes E2E.

## Próximas decisões

Antes de implementar funcionalidades, defina e documente:

1. Framework, linguagem e ferramenta de build.
2. Estratégia de rotas e gerenciamento de estado.
3. Biblioteca de testes e padrão de cobertura.
4. Contratos de API e tratamento de erros.
5. Requisitos de acessibilidade, segurança e observabilidade.
