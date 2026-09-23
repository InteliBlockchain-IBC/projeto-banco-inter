# Protocolo de Concessão de Crédito Interfinanceiro

Frontend da Prova de Conceito desenvolvida no **Inteli**, em parceria com o
**Banco Inter**, para simular operações de crédito interfinanceiro de curtíssimo
prazo (*overnight*) em uma arquitetura híbrida Web2/Web3.

## Sobre o projeto

Instituições financeiras precisam equilibrar sua posição de caixa diariamente.
Quando há falta ou excesso de liquidez, podem tomar ou conceder crédito a outras
instituições. Esse processo ainda pode depender de consultas manuais de limite,
negociação em canais separados e conciliação posterior à liquidação.

O projeto propõe uma Mesa de Operações capaz de centralizar ofertas, limites de
crédito, taxas e estados das transações. A PoC utiliza a testnet Sepolia para
simular o aceite e a liquidação atômica de uma operação por *smart contract*,
sem movimentar dinheiro ou ativos reais.

## Objetivo

Disponibilizar uma interface clara e rastreável para que uma pessoa operadora de
tesouraria possa:

- consultar ofertas, taxas de mercado e limites de crédito;
- registrar uma oferta com valor, taxa CDI e prazo;
- analisar e aceitar uma oferta de outra instituição;
- validar automaticamente o limite da contraparte antes do aceite;
- acompanhar o processamento e a confirmação da liquidação;
- cancelar uma oferta própria enquanto ela ainda não tiver sido aceita;
- consultar o histórico e o hash *on-chain* das operações.


## Arquitetura e tecnologias

O frontend será responsável pela interação da pessoa usuária com os serviços
Web2 e com o fluxo Web3. A separação inicial do código permite evoluir telas,
componentes e integrações sem misturar responsabilidades.

| Camada | Tecnologia prevista | Finalidade |
| --- | --- | --- |
| Frontend | React | Construção das telas e dos componentes da Mesa de Operações. |
| API | Node.js, TypeScript e Express | Regras de aplicação e comunicação com serviços externos. |
| Banco de dados | PostgreSQL | Persistência dos dados operacionais da PoC. |
| Smart contracts | Solidity e Foundry | Validação de limite e liquidação atômica simulada. |
| Blockchain | Ethereum Sepolia | Ambiente de testes das transações, sem ativos reais. |

> A aplicação ainda está na fase de estruturação. As tecnologias e versões
> definitivas devem ser atualizadas neste README quando a implementação for
> incorporada ao repositório.


## Estrutura do repositório

```text
frontend-banco-inter/
├── docs/
│   ├── architecture.md       # Organização e decisões arquiteturais
│   └── documentacao.md       # WAD, requisitos, UX e evolução do projeto
├── public/
│   └── assets/
│       └── images/           # Imagens públicas da documentação e da interface
├── src/
│   ├── assets/
│   │   ├── icons/            # Ícones importados pelo código
│   │   └── images/           # Imagens processadas pelo bundler
│   ├── components/           # Componentes reutilizáveis
│   ├── pages/                # Páginas e composição das rotas
│   ├── services/             # Clientes de API e integrações Web3
│   ├── styles/               # Estilos globais, temas e tokens
│   └── utils/                # Funções auxiliares compartilhadas
├── tests/                    # Testes automatizados e testes de fluxo
├── .env.example              # Exemplo das variáveis de ambiente
└── README.md                 # Apresentação e orientação inicial
```




## Integrantes

| Integrante | Perfil |
| --- | --- |
| Ana Célia Augusta Santos do Amaral | [LinkedIn](https://www.linkedin.com/in/ana-c%C3%A9lia-amaral/) |
| Gabriel Rodrigues | [LinkedIn](https://www.linkedin.com/in/rodriguesgabrieleng) |
| José Guilherme Gonçalves Maia | [LinkedIn](https://www.linkedin.com/in/jos%C3%A9-guilherme-gon%C3%A7alves-maia/) |

## Escopo e limitações

- Projeto acadêmico e experimental.
- Operações executadas exclusivamente em ambiente de testes.
- Sem integração com sistemas de produção do Banco Inter.
- Sem movimentação de dinheiro ou ativos reais.
- Sem liquidação financeira externa à blockchain.

## Convenções

- Usar `kebab-case` em nomes de arquivos e pastas.
- Manter componentes pequenos e com responsabilidade única.
- Armazenar arquivos públicos em `public/assets`.
- Armazenar recursos importados pelo código em `src/assets`.
- Nunca versionar segredos; documentar novas variáveis em `.env.example`.
