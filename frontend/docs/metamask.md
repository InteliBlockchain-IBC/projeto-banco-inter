# Conexão com MetaMask

A conexão atual usa a extensão da MetaMask no navegador, sem dependências Web3 adicionais e sem exigir o backend. A descoberta usa EIP-6963, com fallback para o provider injetado em navegadores antigos.

## Testar manualmente

1. Instale ou habilite a extensão pelo [site oficial](https://metamask.io/download/).
2. Execute `npm run dev`, entre na mesa e clique em **Conectar MetaMask** no cabeçalho ou no perfil.
3. Autorize a conta na extensão. O perfil exibe o endereço completo e a rede real.
4. Se a carteira estiver em outra rede, clique em **Trocar para Sepolia** e aprove a solicitação. Se necessário, o app pede autorização para adicionar essa rede.
5. Troque de conta ou rede na extensão e confira a atualização da interface. Recarregar a página restaura o acesso já autorizado sem abrir outra solicitação.
6. **Desconectar do app** remove a conta da sessão da interface. Para revogar também a permissão do site, use as configurações de conexões da MetaMask. A desconexão local é lembrada nesta aba mesmo após recarregar.

A conexão não envia transações, não pede assinaturas e não autentica o operador. O aceite das ofertas permanece uma simulação identificada no modal. A integração do front com as transações já implementadas no backend exige os endpoints e o formato das respostas desse backend.

## Pontos de integração

- `src/services/metamask.js`: descoberta, estado da conexão e solicitação de troca de rede.
- `src/context/CarteiraContext.jsx`: `useCarteira()` disponibiliza `conta`, `chainId`, `conectada`, `naSepolia`, `conectar`, `desconectar`, `trocarParaSepolia` e `getProvider` para a futura integração.
- `getProvider()` retorna o provider EIP-1193 somente enquanto há uma conta conectada. Ao integrar transações, valide a conta e a rede novamente antes de enviá-las e aguarde o recibo real antes de atualizar o estado.
- Sepolia usa chain ID `11155111` (`0xaa36a7`). O RPC público é usado somente ao adicionar a rede à carteira: `https://ethereum-sepolia-rpc.publicnode.com`.

Referências: [descoberta EIP-6963](https://eips.ethereum.org/EIPS/eip-6963), [API do provider MetaMask](https://docs.metamask.io/metamask-connect/evm/reference/provider-api/).

## Verificação automatizada

Execute `node --test tests/metamask.test.mjs`, `npm run lint` e `npm run build`. Os testes usam um provider simulado; a confirmação dentro da extensão real deve ser verificada manualmente no navegador.
