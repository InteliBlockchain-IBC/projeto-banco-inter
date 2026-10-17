# Mesa de operações interfinanceiras

Frontend da prova de conceito de crédito interfinanceiro do projeto Inteli Blockchain com o Banco Inter. A aplicação reúne ofertas, limites, histórico e detalhes das operações. Há dois fluxos: uma demonstração com dados sintéticos e a integração experimental com contrato na Sepolia.

## Baixar e executar

Requisitos: Git, Node.js e npm. O frontend também precisa da API do [backend-banco-inter](https://github.com/InteliBlockchain-IBC/backend-banco-inter) em execução. A MetaMask é necessária apenas para assinar operações com o contrato real na Sepolia.

```bash
git clone https://github.com/InteliBlockchain-IBC/frontend-banco-inter.git
cd frontend-banco-inter
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`. A rota `/` mostra o login demonstrativo; qualquer email e senha preenchidos levam à mesa. O comando `npm run dev` usa o proxy de `/api` para `http://127.0.0.1:3000`. Configure e inicie o backend conforme o README dele antes de usar as telas que consultam ofertas e limites.

Para mudar o destino do proxy, copie `.env.example` para `.env.local` e ajuste `API_PROXY_TARGET`. Esse arquivo local não deve ser versionado. Em uma publicação, `VITE_API_URL` define a origem da API; o servidor precisa permitir CORS quando frontend e API tiverem origens diferentes.

### Demonstração local

O backend pode ser iniciado com dados em memória em uma segunda porta, mantendo a API real separada. Em PowerShell, com os dois repositórios lado a lado:

```powershell
cd ../backend-banco-inter
npm ci
npm run build
$env:NODE_ENV = 'development'
$env:PORT = '3001'
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
npm run start
```

No terminal do frontend:

```powershell
cd ../frontend-banco-inter
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

O proxy `/demo-api` aponta para a porta `3001` por padrão. Para outros endereços, use `DEMO_API_PROXY_TARGET` no `.env.local`; em uma publicação, use `VITE_DEMO_API_URL`. A seleção de ambiente ainda não está exposta na interface. Para abrir a aplicação diretamente com a demo, defina `API_PROXY_TARGET=http://127.0.0.1:3001` no `.env.local` e reinicie o Vite. Depois abra `http://127.0.0.1:5174/mesa`. O backend em memória perde as alterações ao encerrar. Endereços, blocos e hashes da demo são sintéticos e não representam transações na Sepolia.

### Contrato na Sepolia

Com o backend apontando para um deployment real, conecte uma carteira cadastrada no contrato e selecione Sepolia na MetaMask. A criação, o aceite e o cancelamento passam por uma intenção da API, assinatura na carteira e acompanhamento do recibo. A publicação de oferta também pode exigir aprovação de BRLt. O administrador do contrato deve cadastrar as instituições e fornecer BRLt de teste. Veja [a integração da carteira](docs/metamask.md).

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia o Vite para desenvolvimento. |
| `npm run build` | Gera a versão estática em `dist/`. |
| `npm run preview` | Serve o build localmente. |
| `npm test` | Executa os testes de serviços e funções de dados. |
| `npm run lint` | Verifica o código com ESLint. |

## Estrutura do repositório

| Caminho | Conteúdo |
| --- | --- |
| `src/pages/` | Telas de login, mesa, ofertas, histórico, detalhes e perfil. |
| `src/components/` | Componentes compartilhados, modais e elementos de interface. |
| `src/context/` | Estado da carteira, do ambiente e das operações. |
| `src/hooks/` | Consultas e atualização periódica das ofertas. |
| `src/services/` | Cliente da API, adaptação de dados, MetaMask, BRLt e transações. |
| `src/styles/`, `src/utils/` | Estilos, tokens e formatação. |
| `public/`, `src/assets/` | Imagens e recursos estáticos. |
| `tests/` | Testes automatizados e dados de teste. |
| `docs/` | [Documentação do projeto](docs/documentacao.md), [arquitetura](docs/architecture.md), carteira e UX. |

O login é demonstrativo e não autentica o operador. A API fornece ofertas, limites, deployment e histórico. Favoritos e notificações são estados locais da interface. As listas de ofertas são atualizadas periodicamente.

## Autores

- [Ana Célia Augusta Santos do Amaral](https://www.linkedin.com/in/ana-c%C3%A9lia-amaral/)
- [Gabriel Rodrigues](https://www.linkedin.com/in/rodriguesgabrieleng)
- [José Guilherme Gonçalves Maia](https://www.linkedin.com/in/jos%C3%A9-guilherme-gon%C3%A7alves-maia/)
