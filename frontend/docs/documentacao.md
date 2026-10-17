# Sobre o projeto

Esta é a interface de uma prova de conceito acadêmica de crédito interfinanceiro, desenvolvida pela Inteli Blockchain em um projeto com o Banco Inter. Ela mostra como instituições financeiras poderiam negociar crédito de curtíssimo prazo em uma mesa digital e acompanhar cada operação até a liquidação.

O projeto **não movimenta dinheiro real** e não se conecta aos sistemas de produção do Banco Inter. Há uma demonstração com dados fictícios e um fluxo experimental para a rede de testes Ethereum Sepolia.

## Qual problema motivou o projeto?

Quando uma instituição precisa de liquidez por um período curto, a negociação com outra instituição envolve conferir condições, limite de crédito e confirmação da liquidação. Se essas informações estiverem espalhadas, o operador precisa conciliar etapas manualmente e pode demorar a saber se a operação foi concluída.

A proposta desta interface é reunir oferta, limite, decisão e histórico em um lugar. No fluxo com contrato, o aceite e a liquidação são acompanhados por uma transação na Sepolia. Assim, o operador consegue ver o estado da operação e consultar seu registro técnico.

## Como uma operação acontece?

1. **Oferta:** uma instituição informa a contraparte, o valor, a taxa ligada ao CDI e o prazo.
2. **Análise:** a contraparte consulta as condições e o limite disponível.
3. **Aceite ou cancelamento:** a contraparte pode aceitar a oferta; quem publicou pode cancelá-la enquanto ela estiver aberta.
4. **Liquidação e registro:** a aplicação mostra o resultado, os dados da operação e, no fluxo real de testes, o hash da transação.

Uma oferta aceita passa diretamente para a liquidação no contrato; “aceita” não é um estado persistido separado. O histórico permite voltar aos detalhes depois.

## O que há na aplicação?

| Tela | Para que serve |
| --- | --- |
| Login | Entrada demonstrativa. Os campos não são validados por um serviço de autenticação. |
| Mesa | Consulta ofertas abertas, limites e indicadores; inicia uma nova oferta. |
| Minhas ofertas | Acompanha ofertas relacionadas à instituição selecionada. |
| Detalhe da operação | Mostra condições, status, eventos e ações disponíveis. |
| Histórico | Pesquisa operações e abre seus detalhes. |
| Perfil | Mostra carteira, instituição, limite e histórico de alterações do limite. |

O frontend consulta a [API do backend](https://github.com/InteliBlockchain-IBC/backend-banco-inter). A API fornece ofertas, limites, eventos e informações do contrato. Favoritos e notificações pertencem ao estado local da interface. As listas de ofertas são atualizadas periodicamente.

## Demonstração e Sepolia

| Ambiente | O que acontece |
| --- | --- |
| Demonstração | O backend usa instituições e ofertas fictícias. É possível percorrer criação, aceite e cancelamento sem MetaMask. Endereços, blocos e hashes são sintéticos. Os dados em memória desaparecem ao encerrar o backend. |
| Sepolia | O backend informa um contrato implantado na rede de testes. Uma carteira MetaMask cadastrada assina as transações. A aplicação verifica conta, rede e contrato, registra o hash na API e acompanha a confirmação. A publicação pode exigir autorização de BRLt de teste. |

A demonstração serve para apresentar e explorar as telas. Ela não comprova uma transação na blockchain. O fluxo Sepolia depende de contrato, backend com listener ativo, carteiras cadastradas e tokens de teste. A confirmação completa na extensão e a indexação real ainda precisam de verificação manual nesse ambiente.

Hoje, a troca entre as duas APIs não aparece como controle na interface. Para iniciar a aplicação diretamente com os dados fictícios, configure o proxy conforme as instruções do [README](../README.md).

## O que já foi implementado e o que falta?

O repositório contém as telas, integração com a API, conexão à MetaMask, envio e acompanhamento de transações, consulta de BRLt e testes automatizados dos serviços e funções de dados. `npm test`, `npm run lint` e `npm run build` passaram na revisão de 17/10/2026.

Faltam ligar a seleção de ambiente à interface, substituir o login demonstrativo caso seja necessária autenticação real e registrar uma verificação manual completa do fluxo na Sepolia. Não há endereço de publicação ou vídeo de demonstração registrado neste repositório.

## Para continuar a leitura

- [README](../README.md): como baixar, configurar e executar o frontend.
- [Arquitetura](architecture.md): organização do código e caminho dos dados.
- [MetaMask](metamask.md): conexão da carteira e teste manual.
- [UX](ux/README.md): personas, jornada do operador e decisões de interface.
- [Design system no Figma](https://www.figma.com/design/Mfw2YIbDKTmjuyLKGII7JI/Frontend-Projeto-Inter?node-id=351-106).

## Autores

- [Ana Célia Augusta Santos do Amaral](https://www.linkedin.com/in/ana-c%C3%A9lia-amaral/)
- [Gabriel Rodrigues](https://www.linkedin.com/in/rodriguesgabrieleng)
- [José Guilherme Gonçalves Maia](https://www.linkedin.com/in/jos%C3%A9-guilherme-gon%C3%A7alves-maia/)
