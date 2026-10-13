# React + Vite

## MetaMask

A conexão com a extensão já está disponível no cabeçalho e no perfil. Veja [como testar e os pontos para integrar o backend](docs/metamask.md).

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Rodando com a API do backend

As telas de Mesa, Detalhe da operação e Histórico consomem a API do
[backend-banco-inter](https://github.com/InteliBlockchain-IBC/backend-banco-inter).

1. Suba o backend (no repositório dele): `docker compose up --build -d`, ou, sem banco,
   `npm run build && NODE_ENV=development npm run start` (fixtures em memória).
2. Neste repositório: `npm install` e `npm run dev`.

Em desenvolvimento, o Vite encaminha `/api` para `http://127.0.0.1:3000` (o backend ainda
não libera CORS). Para outro endereço, defina `API_PROXY_TARGET` em `.env.local`. Em um build
publicado, `VITE_API_URL` aponta para a API (exige CORS no backend). Nenhuma das duas guarda
segredo.

Testes das funções de dados (sem dependências extras): `npm test`.

### Operações e ambiente

O login é demonstrativo. Mesa, detalhe, histórico, minhas ofertas, instituição e
limites no perfil leem a API. As ofertas e o histórico são atualizados
periodicamente. Favoritos e notificações da sessão são estados locais.

O Docker com PostgreSQL pode continuar servindo o **seed sintético**. O frontend
identifica esse deployment pelo endereço, mostra o aviso de demonstração e
permite escolher uma carteira fictícia no cabeçalho. Criação, aceite e
cancelamento usam `/api/mock/offers`; as alterações são gravadas no PostgreSQL
e refletidas nas telas. Os hashes desse fluxo são sintéticos e não abrem o
explorer da Sepolia. Nenhuma assinatura é pedida nesse ambiente.

Quando o backend servir um contrato real implantado na Sepolia, conecte uma
carteira participante na MetaMask. O frontend pede a intenção à API, confere
conta, rede e código do contrato, envia a transação pela MetaMask, registra o
hash e acompanha o recibo. O listener do backend deve estar configurado para
indexar a oferta; as rotas de intenção só estão disponíveis em `development`.
