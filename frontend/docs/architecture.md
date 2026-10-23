# Arquitetura do frontend

O projeto usa React 19, React Router 7, Vite 8 e Tailwind CSS 4. `src/App.jsx` monta os provedores de carteira, ambiente e operações e define as rotas. O login é apenas uma passagem para a mesa; não há autenticação de usuário ou proteção de rotas.

## Caminho dos dados

1. `src/services/api.js` chama o backend e normaliza os erros da API.
2. `src/services/offerAdapter.js` converte valores em centavos, taxas e estados para o formato das telas.
3. `src/hooks/` consulta ofertas, atualiza as listas periodicamente e permite nova tentativa após falha.
4. `src/context/EnvironmentContext.jsx` lê o deployment e os limites. Um endereço de contrato sintético identifica a demonstração.
5. `src/context/WalletContext.jsx` acompanha conta e rede na MetaMask. `src/context/OperationsContext.jsx` guarda favoritos, seleção para comparação e notificações locais.

## Operações

Na demonstração, criação e ações sobre ofertas usam `/api/mock/offers` e o backend registra hashes sintéticos. Com deployment real, `src/services/transactions.js` pede a intenção à API, confere carteira, rede, contrato e argumentos, envia a transação pela MetaMask, comunica o hash ao backend e consulta o recibo. `src/services/brlt.js` consulta saldo e autorização de BRLt e solicita `approve` quando necessário. A indexação pelo backend atualiza a oferta nas consultas seguintes.

## Ambientes

O Vite encaminha `/api` para `API_PROXY_TARGET` (padrão: porta 3000) e `/demo-api` para `DEMO_API_PROXY_TARGET` (padrão: porta 3001). `src/services/apiEnvironment.js` já contém a escolha de URL e a verificação do deployment, mas a interface ainda não oferece um controle para trocar de ambiente. Sem valor em `sessionStorage`, as chamadas usam a API real. Para executar somente a demo hoje, direcione `API_PROXY_TARGET` para o backend de demonstração. Em build publicado, `VITE_API_URL` e `VITE_DEMO_API_URL` substituem os proxies e exigem configuração de CORS no backend quando as origens diferem.

## Diretórios

| Caminho | Responsabilidade |
| --- | --- |
| `src/pages/` | Composição das telas e ações disponíveis em cada rota. |
| `src/components/` | Cabeçalho, modais, componentes de carteira e elementos de interface. |
| `src/context/` | Estado compartilhado da carteira, do ambiente e da sessão visual. |
| `src/hooks/` | Consultas e atualização periódica de dados. |
| `src/services/` | Integrações com API, carteira e contrato; adaptação de ofertas. |
| `src/styles/`, `src/utils/` | Estilos, tokens e funções de formatação. |
| `public/`, `src/assets/` | Recursos estáticos e imagens importadas pelo Vite. |
| `tests/` | Testes de serviços e funções de dados com `node:test`. |
| `docs/` | Documentação técnica e de UX. |

## Limites atuais

- A seleção entre as duas APIs precisa ser ligada a uma tela e deve recarregar os dados ao mudar de ambiente.
- O login não valida credenciais. Uma autenticação real exigirá contrato de sessão com o backend e proteção das rotas.
- Favoritos e notificações da sessão não são persistidos pela API; favoritos ficam no armazenamento local do navegador.
- A confirmação da extensão e o fluxo completo de contrato real precisam de teste manual na Sepolia com carteiras cadastradas e BRLt de teste.
