# Personas — Mesa de Operações de Crédito Interfinanceiro

| | |
| --- | --- |
| **Entregável** | Semana 1 · "Personas e jornada do operador — quem usa a mesa e o que precisa ver em cada momento" |
| **Versão** | 0.1 · 20/09/2026 · **proposta** — validar com o time na sprint review (23/09) e, se possível, com o Inter |
| **Fontes** | TAP (problema, objetivo, RF01–RF06, RNF01–RNF04) · Entregáveis do ciclo · Wireframes WEB 01–10 do Figma "Frontend-Projeto-Inter" |
| **Peça visual** | Página "jornada do usuário" no mesmo arquivo Figma (pranchas P1, P2, P3) |

## Premissas

- São **proto-personas**: derivadas dos documentos do projeto e dos wireframes, sem entrevistas com operadores. Servem para orientar as decisões de interface até que haja validação com o parceiro.
- Nomes, cargos, bancos e valores são **fictícios**. Nenhum dado, pessoa ou instituição real do Banco Inter é usado. A instituição do operador é sempre "Banco A", como nos wireframes.
- A TAP descreve o usuário-alvo como a **tesouraria** do banco, com duas dores centrais: **risco de contraparte** (a operação falhar entre a negociação e a liquidação) e **complexidade operacional no fechamento diário de caixa** (checagem manual de limites, conciliação lenta). As personas partem daí.
- A Mesa dos wireframes assume que **o mesmo operador atua nos dois lados**: aceita ofertas de terceiros (toma crédito) e publica as suas (concede crédito). A persona primária reflete isso.

## Resumo

| Persona | Papel | Prioridade | Telas principais | Requisitos que exercita |
| --- | --- | --- | --- | --- |
| Marina Duarte | Operadora da Mesa de Tesouraria | **Primária** | WEB 01–08, 10 | RF01, RF02, RF03, RF04, RF06, RNF02 |
| Ricardo Sá | Gestor de Tesouraria / Risco de Liquidez | Secundária | WEB 02, 09 | RF02, RF04, RF05 |
| Camila Reis | Analista de Back-office / Conformidade | Secundária | WEB 09, 04, 08 | RF05, RNF03 |

---

## Persona 1 — Marina Duarte

**Operadora da Mesa de Tesouraria (DI / overnight)** · persona primária

> "Preciso fechar a posição do dia com a melhor taxa — e saber, na hora, que a liquidação aconteceu."

| | |
| --- | --- |
| **Cargo** | Operadora da mesa de tesouraria do Banco A; opera crédito interfinanceiro de curtíssimo prazo |
| **Cadência de uso** | Diária e intensa, concentrada em duas janelas: abertura da manhã e fechamento do caixa no fim da tarde |
| **Decide** | Publicar uma oferta (valor, taxa CDI, prazo), aceitar uma oferta de terceiro dentro do limite, cancelar a própria oferta enquanto ninguém a aceitou |

### Perfil

- ~32 anos, 6 anos em mesa de DI/open market. Formação em economia, certificação de mercado.
- Trabalha com várias contrapartes ao mesmo tempo, sob pressão de horário: a janela do overnight fecha e a posição precisa estar zerada.
- Hoje negocia por telefone/mensageria e registra em sistemas separados; a confirmação da liquidação chega depois, por outro canal.

### Contexto

Marina acompanha a posição de caixa do banco ao longo do dia. Quando sobra caixa, oferece crédito a outras instituições; quando falta, toma. Cada decisão depende de três números (valor, taxa, prazo) e de uma pergunta que hoje custa tempo responder: *cabe no limite da contraparte?* Depois de negociar, ela ainda precisa esperar a liquidação de fato ocorrer e conciliar o registro.

### Motivações

- Fechar a posição do dia com a melhor taxa disponível e o menor risco.
- Ter **certeza** de que a liquidação ocorreu, sem depender de confirmação por outro canal.
- Nunca estourar o limite de uma contraparte.
- Reduzir o retrabalho de conciliação no fim do dia.

### Necessidades (o que precisa ver, em ordem de prioridade)

1. **Valor, taxa CDI e prazo** de cada oferta, sem precisar abrir a oferta.
2. **Limite disponível** com a contraparte e **quanto a oferta consome** dele.
3. **Contraparte** e **status** da oferta (Ofertada, Aceita, Liquidada, Cancelada).
4. Comparar ofertas lado a lado antes de decidir.
5. Após aceitar: o **hash** da transação e a confirmação em tempo hábil (RNF02: até 30 s).
6. Nas suas ofertas: quem aceitou, quando, e se ainda dá para cancelar.

### Comportamentos

- Lê a mesa "de cima para baixo": primeiro os números do dia (limite, CDI vigente), depois as ofertas.
- Compara duas ou três ofertas antes de aceitar; evita concentrar em uma única contraparte.
- Desconfia de qualquer estado "concluído" que não venha acompanhado de evidência.
- Prefere confirmar duas vezes a desfazer uma vez: ações irreversíveis precisam de revisão explícita.

### Dores no processo atual (TAP)

- **Checagem manual de limite** antes de fechar cada operação.
- **Atraso entre negociação e liquidação**: a operação pode falhar no meio do caminho (risco de contraparte).
- **Conciliação lenta** entre mensagem, sistema interno e extrato no fechamento diário.
- Falta de visão consolidada: limites, taxas e status em lugares diferentes.

### Relação com blockchain e carteira

- Familiaridade baixa a média. Sabe o que é assinar uma transação, mas não é rotina.
- Receios: assinar na **rede errada**, confirmar algo **irreversível** por engano, não saber se a transação "pegou".
- Implicações para a UI: bloqueio claro se a carteira estiver fora da Sepolia; tela de revisão antes de assinar (WEB 05); feedback contínuo durante a espera (WEB 06); erro explícito se a carteira rejeitar.

### Como a PoC responde

- Limite validado pelo contrato **antes** do aceite; a UI mostra o impacto no limite e bloqueia aceite acima dele (RF02).
- Aceite = liquidação atômica (DvP) em **uma única transação assinada por Marina** (RF03).
- Stepper "enviada → confirmando → finalizada" com hash visível e confirmação em até 30 s (RNF02).
- Cancelar disponível **somente enquanto a oferta está Ofertada** (RF06).

### Telas

WEB 01 Login · WEB 02 Mesa · WEB 03 Nova oferta · WEB 04 Detalhe (oferta de terceiro) · WEB 05 Confirmar · WEB 06 Aguardando confirmação · WEB 07 Minhas ofertas · WEB 08 Detalhe (minha oferta) · WEB 10 Confirmar cancelamento

---

## Persona 2 — Ricardo Sá

**Gestor de Tesouraria / Risco de Liquidez** · persona secundária

> "Quero ver a exposição do dia por contraparte antes que ela vire problema, não depois."

| | |
| --- | --- |
| **Cargo** | Gestor da tesouraria do Banco A; responsável pelos limites por contraparte e pela exposição de liquidez |
| **Cadência de uso** | Várias vezes ao dia, em consultas curtas; supervisiona, raramente executa |
| **Decide** | Limites por contraparte; se a exposição acumulada do dia é aceitável; quando pedir que a mesa reduza concentração |

### Perfil

- ~45 anos, 15 anos entre mesa e gestão de risco. Responde à diretoria pela política de limites.
- Não opera na tela: usa a Mesa para **enxergar** o que a equipe está fazendo e o que ainda cabe.

### Contexto

Ricardo define quanto o banco pode expor a cada contraparte e precisa saber, ao longo do dia, quanto desse limite já foi consumido e quanto as operações em análise consumiriam. Hoje essa visão chega tarde, em planilhas montadas depois do fato.

### Motivações

- Ver a exposição em tempo real, não no fechamento.
- Antecipar concentração excessiva em uma contraparte.
- Ter números defensáveis para a diretoria e para o risco.

### Necessidades

1. **Limite disponível vs. consumido** por contraparte e no agregado.
2. **Impacto das propostas selecionadas** no limite antes de a mesa aceitá-las.
3. Indicadores do dia: **taxa CDI vigente, volume ofertado em 24 h, ofertas ativas**.
4. Histórico filtrável por período e status, com exportação.

### Comportamentos

- Abre a Mesa e lê só o topo (métricas) e o gráfico de impacto; desce para os cards apenas quando um número o incomoda.
- Usa os filtros de status para ver o que está Aceito mas ainda não Liquidado.
- Exporta o histórico para cruzar com a política de limites.

### Dores no processo atual (TAP)

- Visibilidade **tardia** da exposição: sabe depois que a operação já fechou.
- Limites controlados fora do fluxo, em planilha ou e-mail.
- Não enxerga a fila de operações em andamento.

### Como a PoC responde

- Métricas da Mesa em tempo real: limite disponível, CDI vigente, volume 24 h, ofertas ativas (RF04).
- Gráfico "Impacto das propostas selecionadas no limite" (WEB 02).
- Validação automática de limite pelo contrato, que impede aceite acima do permitido (RF02).
- Histórico completo, filtrável e exportável (RF05).

### Telas

WEB 02 Mesa (métricas, gráfico de impacto, filtros) · WEB 09 Histórico (filtros, exportar)

---

## Persona 3 — Camila Reis

**Analista de Back-office / Conformidade** · persona secundária

> "Se a operação aconteceu, eu preciso da prova — quem, quando, a que taxa e em qual transação."

| | |
| --- | --- |
| **Cargo** | Analista de back-office do Banco A; concilia operações e produz evidência para auditoria e regulatório |
| **Cadência de uso** | Diária no fechamento e sob demanda quando há questionamento de auditoria |
| **Decide** | Se a operação está conciliada e evidenciada; o que vai para o relatório de auditoria |

### Perfil

- ~28 anos, 4 anos em back-office de tesouraria. Perfil detalhista, orientado a evidência.
- Não negocia nem assina; consome o registro das operações.

### Contexto

Camila fecha o dia conferindo se cada operação negociada pela mesa tem registro completo e consistente. Hoje a evidência está espalhada: a negociação em um canal, o registro em outro, a liquidação em um terceiro.

### Motivações

- Conciliar sem retrabalho: uma operação, um registro completo.
- Responder a auditoria com evidência rastreável, não com reconstrução manual.
- Confiar que o registro é imutável.

### Necessidades

1. Para cada operação: **timestamp, partes, taxa CDI aplicada, hash on-chain** (RNF03).
2. Link do hash para o **explorer da Sepolia**, com bloco e número de confirmações.
3. **Busca por ID, hash, banco ou valor**; filtros por período e status.
4. **Exportar** o histórico.

### Comportamentos

- Entra direto no Histórico; raramente passa pela Mesa.
- Verifica o hash no explorer antes de considerar a operação evidenciada.
- Marca inconsistências (operação Aceita sem hash, hash sem confirmações) para a mesa.

### Dores no processo atual (TAP)

- Evidência **dispersa** em sistemas diferentes.
- Conciliação manual entre mensagem, sistema interno e extrato.
- Sem trilha imutável: a prova depende de quem registrou.

### Como a PoC responde

- Backend registra toda operação com timestamp, partes, taxa e hash (RNF03).
- Histórico com rastreabilidade blockchain: rede, hash, bloco, confirmações (WEB 09).
- Detalhe da operação com "Rastreabilidade → Consultar no Histórico" (WEB 04/08).
- Busca e exportação no Histórico (RF05).

### Telas

WEB 09 Histórico · WEB 04 / WEB 08 Detalhe da operação (rastreabilidade)

---

## Quem não é persona

O **avaliador do Inter** no demo day (21/10) e o time da sprint review são **audiência**, não usuários. A interface precisa ser legível em telão (contraste, tamanho de fonte e de alvos), mas não se desenha para eles: desenha-se para Marina, Ricardo e Camila.
