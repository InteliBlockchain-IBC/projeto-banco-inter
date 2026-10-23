<p align="center">
  <img src="./assets/banner_blockas.png" alt="Banner Inteli Blockchain" width="700">
</p>
<h1 align="center">
  Projeto Banco Inter - Protocolo de Concessão de Crédito Interfinanceiro
</h1>
<p align="center">
  <strong>Projeto do clube Inteli Blockchain em parceria com o Banco Inter.</strong>
</p>

---

## 🎯 Sobre o projeto

A gestão de liquidez interbancária de curtíssimo prazo ainda enfrenta ineficiências de conciliação e liquidação. Processos tradicionais podem exigir checagens manuais de limites e criar atrasos entre a negociação e a conclusão da operação, aumentando o risco de contraparte e a complexidade do fechamento diário de caixa.

Neste ciclo, o Inteli Blockchain e o Banco Inter desenvolverão uma prova de conceito híbrida Web2/Web3 para automatizar o ciclo de crédito interfinanceiro overnight. A solução utilizará smart contracts para registrar ofertas, validar limites, aceitar operações e simular a liquidação atômica, além de oferecer um painel para acompanhar limites, taxas e estados das transações.

O projeto tem caráter acadêmico e experimental. Todas as operações serão realizadas na testnet Sepolia com ativos simulados, sem integração com sistemas de produção do Banco Inter e sem movimentação de dinheiro real.

---

## 🗓️ Timeline de entregas

| 14/09 | 23/09 | 17/10 | 21/10 |
| :---: | :---: | :---: | :---: |
| **Início** | **Sprint review** | **Entrega** | **Demo day** |

> Itens marcados como **Ir além** são metas complementares.

<details open>
<summary><strong>🔬 Pesquisa</strong></summary>

| Período | Entregas |
| --- | --- |
| **14/09 - 20/09** | Matriz de critérios com pesos<br>Lista fechada de redes candidatas<br>Bibliografia inicial |
| **21/09 - 27/09** | Tabela comparativa preenchida<br>Slides da sprint review<br>Estrutura do paper |
| **28/09 - 04/10** | Paper versão 1<br>Recomendação de rede |
| **05/10 - 11/10** | Roteiro de medição<br>*Ir além: Dados do teste empírico*<br>*Ir além: Script de coleta* |
| **12/10 - 17/10** | Paper final<br>Resumo executivo |

</details>

<details>
<summary><strong>⚙️ Backend</strong></summary>

| Período | Entregas |
| --- | --- |
| **14/09 - 20/09** | Repositório configurado<br>Escolha da stack<br>Diagrama de arquitetura<br>*Ir além: Contrato de API v0* |
| **21/09 - 27/09** | Modelagem do banco<br>Rotas respondendo com mock<br>Coleção de requisições |
| **28/09 - 04/10** | Rotas ligadas ao Postgres<br>Plano de deploy escrito<br>*Ir além: Ambiente em um comando* |
| **05/10 - 11/10** | Integração com os contratos<br>*Ir além: Testes de integração*<br>*Ir além: Massa de dados da demo* |
| **12/10 - 17/10** | Backend publicado<br>Guia de instalação |

</details>

<details>
<summary><strong>🎨 Frontend / Design</strong></summary>

| Período | Entregas |
| --- | --- |
| **14/09 - 20/09** | Wireframes de baixa fidelidade<br>Fluxo de navegação<br>*Ir além: Personas e jornada do operador*<br>*Ir além: User stories priorizadas* |
| **21/09 - 27/09** | Protótipo navegável<br>Design system |
| **28/09 - 04/10** | React com design system<br>Telas estáticas navegáveis<br>*Ir além: Preview publicado* |
| **05/10 - 11/10** | Telas consumindo a API<br>Conexão de carteira<br>Estados de carregamento e erro |
| **12/10 - 17/10** | Ajustes finais de interface<br>Vídeo demo |

</details>

<details>
<summary><strong>⛓️ Web3</strong></summary>

| Período | Entregas |
| --- | --- |
| **14/09 - 20/09** | Máquina de estados da oferta<br>Interface do contrato<br>Foundry inicializado |
| **21/09 - 27/09** | Token de CDI implementado<br>Contrato de liquidação DvP<br>Testes do caminho feliz |
| **28/09 - 04/10** | Testes de falha e borda<br>Script de deploy<br>Primeiro deploy na Sepolia |
| **05/10 - 11/10** | Contrato final verificado<br>ABI publicado para os times<br>Guia de integração |
| **12/10 - 17/10** | Demonstração on-chain<br>Release v1.0.0 |

</details>

---

## 🔗 Links

- 📄 [Termo de Abertura de Projeto (TAP)](./docs/TAP-Banco-Inter.pdf)
- 📅 [Cronograma de entregas](./docs/Entregaveis-Banco-Inter.pdf)

---

## 💻 Projetos desenvolvidos

- ⛓️ [Smart contracts (Web3)](./contracts)
- ⚙️ [Backend](./backend)
- 🎨 [Frontend](./frontend)

---

## 🗂️ Estrutura do repositório

Este repositório reúne as três frentes técnicas do projeto. Cada pasta veio do repositório original da equipe, com o histórico de commits preservado.

| Pasta | Conteúdo | Repositório de origem |
| --- | --- | --- |
| [`contracts/`](./contracts) | Smart contracts em Solidity com Foundry: oferta de crédito, token BRLt e token de posição CDI | [projeto-inter-web3](https://github.com/anacampos-crypto/projeto-inter-web3) |
| [`backend/`](./backend) | API em Node.js/TypeScript com PostgreSQL e listener dos eventos da Sepolia | [backend-banco-inter](https://github.com/InteliBlockchain-IBC/backend-banco-inter) |
| [`frontend/`](./frontend) | Mesa de operações em React + Vite, com conexão de carteira MetaMask | [frontend-banco-inter](https://github.com/InteliBlockchain-IBC/frontend-banco-inter) |
| [`docs/`](./docs) | TAP e cronograma de entregas | — |
| [`.github/workflows/`](./.github/workflows) | CI de cada pasta, executado só quando a pasta correspondente muda | — |

---

## 🚀 Como rodar localmente

Requisitos: Git, [Foundry](https://book.getfoundry.sh/getting-started/installation), Node.js 24 e Docker com o plugin Docker Compose. As dependências dos contratos são submódulos, por isso clone com `--recursive`:

```bash
git clone --recursive https://github.com/InteliBlockchain-IBC/projeto-banco-inter.git
cd projeto-banco-inter
```

<details open>
<summary><strong>⛓️ Contratos</strong></summary>

```bash
cd contracts
forge build
forge test -vv
```

</details>

<details open>
<summary><strong>⚙️ Backend</strong></summary>

Sobe o PostgreSQL, aplica as migrations, grava a massa de demonstração e inicia a API em `http://127.0.0.1:3000`:

```bash
cd backend
docker compose up --build -d
curl http://127.0.0.1:3000/health
```

</details>

<details open>
<summary><strong>🎨 Frontend</strong></summary>

Com o backend rodando, em outro terminal:

```bash
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173`. Em desenvolvimento, o Vite encaminha `/api` para `http://127.0.0.1:3000`, então não é preciso configurar `VITE_API_URL`. Para mudar o destino, copie `.env.example` para `.env.local` e ajuste `API_PROXY_TARGET`. A MetaMask só é necessária para assinar operações com o contrato real na Sepolia.

</details>

---

## 📍 Contratos na Sepolia

Implantados e verificados no Etherscan em 05/10/2026. Os endereços também ficam em [`contracts/deployments/sepolia.json`](./contracts/deployments/sepolia.json) e as ABIs em [`contracts/abi/`](./contracts/abi).

| Contrato | Endereço |
| --- | --- |
| `CreditInterbankOffer` | [`0x2401d88D300dD2CEdB83337bba9Ba29E7269079A`](https://sepolia.etherscan.io/address/0x2401d88D300dD2CEdB83337bba9Ba29E7269079A#code) |
| `BRLToken` | [`0x9591db5fa1345Cc12e7b8F747a3DdAeecc83d25D`](https://sepolia.etherscan.io/address/0x9591db5fa1345Cc12e7b8F747a3DdAeecc83d25D#code) |
| `CDIPositionToken` | [`0xae1C70253946E2a4Cf42c1C979ABD9E8d76AE3c7`](https://sepolia.etherscan.io/address/0xae1C70253946E2a4Cf42c1C979ABD9E8d76AE3c7#code) |

---

## 📚 Documentação por área

| Área | Documentos |
| --- | --- |
| **⛓️ Web3** | [README](./contracts/README.md) · [Guia de integração](./contracts/docs/guia-integracao.md) · [Máquina de estados da oferta](./contracts/docs/maquina-estados-oferta.md) · [ABIs](./contracts/abi/README.md) · [Changelog](./contracts/CHANGELOG.md) |
| **⚙️ Backend** | [README](./backend/README.md) · [Arquitetura](./backend/docs/arquitetura.md) · [API](./backend/docs/api.md) · [Modelagem do banco](./backend/docs/modelagem-banco.md) · [Modelagem do banco no Miro](https://miro.com/app/board/uXjVHk0vcgg=/) · [Deploy](./backend/docs/deploy.md) · [OpenAPI](./backend/docs/openapi.json) · [Coleção Postman](./backend/docs/collection/backend-banco-inter.postman_collection.json) |
| **🎨 Frontend / Design** | [README](./frontend/README.md) · [Documentação](./frontend/docs/documentacao.md) · [Arquitetura](./frontend/docs/architecture.md) · [Integração com a MetaMask](./frontend/docs/metamask.md) · [UX](./frontend/docs/ux/README.md) · [Personas](./frontend/docs/ux/personas.md) · [Jornada do operador](./frontend/docs/ux/jornada-operador.md) |

---

## 👥 Créditos

Autores dos commits de cada área, conforme o histórico do Git (identidades unificadas no [`.mailmap`](./.mailmap)).

| Área | Pessoas |
| --- | --- |
| **🔬 Pesquisa** | Vanessa Andrade · Vitor Garcia|
| **⛓️ Web3** | ana.campos · Théo Morêda · Fabi |
| **⚙️ Backend** | Isaac Nicolas Alves da Silva · Rafael Ryu · MarcusML · viniciuscbonani |
| **🎨 Frontend / Design** | Ana Célia Augusta Santos do Amaral · Guilherme Maia · Gabriel Rodrigues |
---

<p align="center">
  Um projeto do <a href="https://github.com/InteliBlockchain-IBC">Inteli Blockchain</a>
</p>
