# Jornada do Operador — Mesa de Operações de Crédito Interfinanceiro

| | |
| --- | --- |
| **Entregável** | Semana 1 · "Personas e jornada do operador — quem usa a mesa e o que precisa ver em cada momento" |
| **Versão** | 0.1 · 20/09/2026 · **proposta** — validar com o time na sprint review (23/09) |
| **Persona-guia** | Marina Duarte, Operadora da Mesa (ver [personas.md](personas.md)). Ricardo e Camila entram nas etapas em que consomem a tela |
| **Fontes** | TAP · Entregáveis do ciclo · Wireframes WEB 01–10 do Figma "Frontend-Projeto-Inter" |
| **Peça visual** | Página "jornada do usuário" no Figma: prancha **J-A** (Marina toma crédito) e prancha **J-B** (Marina concede crédito) |

## Como ler

A jornada é **uma só**: o dia de Marina na Mesa. Ela começa em um tronco comum (entrar, ler a mesa, analisar), **ramifica** conforme a posição de caixa — **ramo A: tomar crédito** (aceitar oferta de terceiro) ou **ramo B: conceder crédito** (publicar a própria oferta) — e **converge** na confirmação e no histórico.

Para cada etapa: o que Marina quer, o que faz, **o que precisa ver**, em qual tela, em que estado a oferta/UI está, qual requisito da TAP isso cobre, qual dor do processo tradicional existe nesse momento, como ela se sente e o que a interface precisa garantir.

Legenda de emoção: 😐 neutro · 🙂 confiante · 😟 ansiosa · 😠 frustrada · 😌 aliviada.

## Tronco comum

### 0. Gatilho — posição de caixa do dia (fora da tela)

| | |
| --- | --- |
| **Objetivo** | Saber se hoje sobra ou falta caixa para o overnight |
| **Ação** | Lê a posição no sistema interno de tesouraria; decide se vai tomar (→ ramo A) ou conceder (→ ramo B) |
| **Precisa ver** | Nada na Mesa ainda — mas chega com um número na cabeça: quanto precisa tomar ou quanto pode ofertar |
| **Tela** | — (antes do produto) |
| **Dor hoje** | A posição vem de um sistema, os limites de outro, as contrapartes de um terceiro |
| **Emoção** | 😐 |
| **A UI deve** | Receber Marina já mostrando os números que ela vai comparar com o que trouxe: limite disponível e CDI vigente |

### 1. Entrar — WEB 01 Login

| | |
| --- | --- |
| **Objetivo** | Entrar na Mesa e estar pronta para operar |
| **Ação** | Login (e-mail/senha) e conexão da carteira |
| **Precisa ver** | Que a carteira está conectada e em **Sepolia**; qual banco/conta está logado ("Banco A") |
| **Estado da UI** | carteira desconectada · rede errada · conectada |
| **Requisito** | RNF01 (só Sepolia) |
| **Dor hoje** | Não há equivalente: hoje ela não assina nada, e é isso que muda |
| **Emoção** | 😐 → 😟 se algo da carteira falhar |
| **A UI deve** | **Bloquear** operações fora da Sepolia e pedir a troca de rede com instrução clara; nunca deixar Marina chegar à Mesa achando que pode operar quando não pode |

### 2. Ler a mesa — WEB 02 Mesa de Operações

| | |
| --- | --- |
| **Objetivo** | Entender o dia em 10 segundos: quanto cabe, a que taxa o mercado está, o que há de oferta |
| **Ação** | Lê as métricas, revê as "acessadas recentemente", filtra por status, seleciona ofertas para comparar |
| **Precisa ver** | **Limite disponível · Taxa CDI vigente · Volume ofertado 24 h · Ofertas ativas**; em cada card: **contraparte, valor, taxa, prazo, status, impacto no limite** |
| **Estado da oferta** | Ofertada (disponível para aceite) · Aceita · Liquidada · Cancelada — como chips de filtro |
| **Requisito** | RF04 (painel em tempo real) |
| **Dor hoje** | Não existe visão consolidada; a comparação é mental ou em planilha |
| **Emoção** | 🙂 |
| **A UI deve** | Manter os seis dados de leitura rápida sempre visíveis no card; atualizar status sem recarregar; o gráfico "impacto no limite" compara, não recomenda |
| **Também aqui** | **Ricardo** lê as métricas e o gráfico de impacto |

### 3. Analisar uma oferta — WEB 04 Detalhe da Operação (oferta de terceiro)

| | |
| --- | --- |
| **Objetivo** | Decidir se esta oferta cabe e vale |
| **Ação** | Abre o detalhe; confere valor, taxa, prazo, contraparte; olha o card de limite |
| **Precisa ver** | Os dados da oferta lado a lado com **limite disponível com esta contraparte**, quanto a oferta consome e quanto sobra; a nota "validação automática de limite" |
| **Estado da oferta** | Ofertada. Se outro operador aceitar ou a contraparte cancelar enquanto a tela está aberta, a UI atualiza e bloqueia o botão |
| **Requisito** | RF02 (validação de limite) |
| **Dor hoje** | **Checagem manual de limite**: liga, consulta, confirma — e o limite pode ter mudado |
| **Emoção** | 🙂 se cabe · 😟 se não cabe |
| **A UI deve** | Se o limite não comporta: **bloquear o aceite com mensagem clara** (quanto falta), não só desabilitar o botão. A validação real é do contrato; a UI antecipa |

## Ramo A — Tomar crédito (aceitar oferta de terceiro)

### 4A. Confirmar e assinar — WEB 05 Confirmar Operação

| | |
| --- | --- |
| **Objetivo** | Assinar com certeza do que está assinando |
| **Ação** | Revisa valor, taxa, prazo, contraparte; vê a carteira conectada; clica "Assinar e enviar"; **assina na carteira** |
| **Precisa ver** | O resumo exato do que vai para o contrato; qual carteira/endereço assina; aviso de que aceite = liquidação na mesma transação |
| **Estado da UI** | revisão → aguardando assinatura na carteira → enviada / rejeitada pelo usuário / falhou |
| **Requisito** | RF03 (liquidação atômica no aceite) |
| **Dor hoje** | Negociação e liquidação são momentos separados: entre um e outro, **risco de contraparte** |
| **Emoção** | 😟 (ação irreversível) |
| **A UI deve** | Nunca assinar nem enviar por conta própria — quem assina é Marina, na carteira dela. Se ela rejeitar na carteira: voltar ao detalhe com erro explícito e **sem estado inconsistente** |

### 5A. Aguardar a confirmação — WEB 06 Aguardando Confirmação

| | |
| --- | --- |
| **Objetivo** | Saber que a liquidação de fato ocorreu |
| **Ação** | Acompanha o stepper; copia o hash; espera |
| **Precisa ver** | **Hash da transação** assim que enviada; etapa atual (enviada → confirmando → finalizada); tempo decorrido; aviso "confirmação em até 30 s" |
| **Estado da oferta** | Aceita (transitória) → **Liquidada** somente após receipt/evento on-chain |
| **Requisito** | RNF02 (confirmação visível em até 30 s) · RNF03 (hash) |
| **Dor hoje** | A confirmação chega depois, por outro canal; enquanto isso, a posição fica "no ar" |
| **Emoção** | 😟 durante a espera → 😌 na confirmação · 😠 se falhar |
| **A UI deve** | **Nunca mostrar "Liquidada" de forma otimista.** Se a transação falhar ou passar de 30 s: dizer o que aconteceu, manter o hash e oferecer "ver no histórico"; nunca declarar concluído sem resposta real do backend/blockchain |
| **[DEFINIR com Web3]** | Como aceite e liquidação ocorrem na mesma transação (DvP), "Aceita" existe como estado persistido ou só como etapa transitória do stepper? |

## Ramo B — Conceder crédito (publicar a própria oferta)

### 4B. Publicar uma oferta — WEB 03 Nova Oferta

| | |
| --- | --- |
| **Objetivo** | Colocar o caixa excedente para render com o mínimo de atrito |
| **Ação** | Preenche **valor, taxa CDI, prazo**; publica |
| **Precisa ver** | Os três campos, a taxa CDI de referência do dia para calibrar, e o limite disponível (a oferta não pode exceder o que o banco pode conceder) |
| **Estado da oferta** | — → **Ofertada** |
| **Requisito** | RF01 (registrar oferta com taxa, valor, prazo) |
| **Dor hoje** | Divulgar a oferta contraparte por contraparte, por telefone/mensagem |
| **Emoção** | 🙂 |
| **A UI deve** | Validar formato (valor monetário pt-BR, taxa em % do CDI, prazo em dias) sem arredondar silenciosamente; confirmar a publicação e levar para "Minhas ofertas" |

### 5B. Acompanhar minhas ofertas — WEB 07 Mesa (Minhas ofertas) · WEB 08 Detalhe da Minha Oferta

| | |
| --- | --- |
| **Objetivo** | Saber se alguém aceitou — e cancelar se o mercado mudar |
| **Ação** | Filtra "Minhas ofertas"; abre o detalhe; se necessário, cancela |
| **Precisa ver** | Status de cada oferta minha; **quem aceitou e quando** (se aceita); se ainda **pode cancelar** |
| **Estado da oferta** | Ofertada (cancelável) → Aceita/Liquidada por terceiro (não cancelável) · Ofertada → Cancelada |
| **Requisito** | RF06 (cancelar antes do aceite) · RF04 |
| **Dor hoje** | Retirar uma oferta significa avisar cada contraparte; o risco de alguém aceitar "depois de cancelada" existe |
| **Emoção** | 🙂 expectante → 😌 quando aceita · 😠 se foi aceita no instante em que ia cancelar |
| **A UI deve** | Mostrar "Cancelar oferta" **somente enquanto Ofertada**; se a contraparte aceitar com a tela aberta, atualizar e bloquear o cancelamento com aviso — nunca deixar Marina clicar em algo que o contrato vai rejeitar |

### 5B'. Confirmar cancelamento — WEB 10 Confirmar Cancelamento

| | |
| --- | --- |
| **Objetivo** | Cancelar sem ambiguidade |
| **Ação** | Confirma o cancelamento; assina na carteira |
| **Precisa ver** | Resumo da oferta que está cancelando; aviso de que a ação exige assinatura e é definitiva |
| **Estado da oferta** | Ofertada → **Cancelada** |
| **Requisito** | RF06 |
| **Emoção** | 😐 |
| **A UI deve** | Mesma disciplina do aceite: revisão, assinatura na carteira, erro explícito se rejeitada |

## Convergência

### 6. Conferir no histórico — WEB 09 Histórico de Operações

| | |
| --- | --- |
| **Objetivo** | Fechar o registro: a operação existe, com prova |
| **Ação** | Busca por ID/hash/banco/valor; filtra por período e status; abre o detalhe; exporta |
| **Precisa ver** | Por operação: **timestamp, partes, taxa CDI, valor, prazo, status, hash com link para o explorer da Sepolia, bloco, confirmações** |
| **Estado da oferta** | Qualquer; Liquidada e Cancelada aparecem com o hash correspondente |
| **Requisito** | RF05 (histórico completo) · RNF03 (rastreabilidade) |
| **Dor hoje** | **Conciliação lenta** entre mensagem, sistema interno e extrato |
| **Emoção** | 😌 |
| **A UI deve** | Tratar o Histórico como fonte de verdade da rastreabilidade: rede, hash, bloco e confirmações sempre visíveis; "Sem confirmação" e "Aguardando registro" como estados explícitos, não como campos vazios |
| **Também aqui** | **Camila** audita e exporta · **Ricardo** filtra por status e período |

### 7. Fechar o dia (fora da tela)

O que a PoC **elimina** do processo tradicional: a checagem manual de limite (o contrato valida), o intervalo entre negociação e liquidação (DvP atômico) e boa parte da conciliação (registro único com hash). O que **continua fora de escopo** (TAP): integração com sistemas reais do Inter, dinheiro real, liquidação fora da blockchain.

## Curva emocional resumida

| Etapa | 0 Gatilho | 1 Entrar | 2 Mesa | 3 Análise | 4A Assinar | 5A Espera | 6 Histórico |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ramo A | 😐 | 😐 | 🙂 | 🙂 / 😟 | 😟 | 😟 → 😌 | 😌 |

| Etapa | 0 Gatilho | 1 Entrar | 4B Publicar | 5B Acompanhar | 5B' Cancelar | 6 Histórico |
| --- | --- | --- | --- | --- | --- | --- |
| Ramo B | 😐 | 😐 | 🙂 | 🙂 → 😌 / 😠 | 😐 | 😌 |

Os pontos baixos (4A/5A no ramo A, 5B no ramo B) são onde a interface mais precisa de feedback claro: são os momentos irreversíveis e de espera.

## Matriz tela × persona × o que precisa ver

| Tela | Marina (operadora) | Ricardo (gestor) | Camila (back-office) |
| --- | --- | --- | --- |
| WEB 01 Login | Carteira conectada, rede Sepolia, banco logado | — | — |
| WEB 02 Mesa | Métricas do dia; cards com contraparte, valor, taxa, prazo, status, impacto no limite; comparar | Limite disponível vs. consumido; impacto agregado; volume 24 h; ofertas ativas | — |
| WEB 03 Nova oferta | Valor, taxa CDI, prazo; CDI de referência; limite | — | — |
| WEB 04 Detalhe (terceiro) | Dados da oferta + limite com a contraparte + validação | — | Rastreabilidade → histórico |
| WEB 05 Confirmar | Resumo exato; carteira que assina; aviso de atomicidade | — | — |
| WEB 06 Aguardando | Hash, etapa do stepper, tempo, ≤ 30 s | — | — |
| WEB 07 Minhas ofertas | Status de cada oferta minha; pode cancelar? | — | — |
| WEB 08 Detalhe (minha) | Quem aceitou, quando; cancelar só se Ofertada | — | Rastreabilidade → histórico |
| WEB 09 Histórico | Confirmação final da operação | Filtros por status/período; exportar | Timestamp, partes, taxa, hash + explorer, bloco, confirmações; busca; exportar |
| WEB 10 Cancelar | Resumo; assinatura; definitivo | — | — |

## Lacunas encontradas nos wireframes (insumo para a semana 2)

1. **Não há tela de erro/rejeição**: transação rejeitada na carteira, falha on-chain, timeout > 30 s, API indisponível. O stepper de WEB 06 só cobre o caminho feliz.
2. **Não há estado "rede errada" / "carteira desconectada"** depois do login (WEB 01 tem "Carteira conectada", mas nenhuma tela mostra o bloqueio).
3. **"Perfil"** aparece na navegação em todas as telas, sem tela correspondente.
4. **Aba "Em análise (2)"** na Mesa sem definição: é "salvas para comparar"? É um estado da oferta? Não existe na máquina de estados da TAP.
5. **"Aceita" persistida vs. transitória** — depende do contrato (DvP na mesma transação). `[DEFINIR com Web3]`.
6. **Oferta aceita/cancelada por outro enquanto a tela está aberta**: nenhuma tela mostra a atualização nem o bloqueio do botão.
7. **Limite insuficiente**: WEB 04 mostra o card de limite, mas não o estado bloqueado com mensagem.
8. **Botão "Salvar"** nos cards da Mesa: sem destino definido (favoritos? "Em análise"?).
