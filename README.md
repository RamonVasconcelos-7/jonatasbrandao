# Legal Case Manager

# Prompt para o Lovable

Copie e cole o texto abaixo direto no chat do Lovable para iniciar o projeto.

---

## PROMPT

Quero criar um sistema web de gestão de processos jurídicos para um escritório de advocacia, substituindo uma planilha Excel que hoje controla tudo manualmente. O sistema precisa ter autenticação, banco de dados relacional (Supabase) e um visual limpo, profissional, no estilo jurídico/corporativo (tons neutros, azul-marinho, cinza, off-white — nada infantil).

### 1. Modelo de dados

Crie as seguintes entidades:

**Empresas (clientes atendidos pelo escritório)**

- Nome (ex: Engpac, Econtecx, Genesis)

- Cor/identificador visual

- Deve ser possível cadastrar novas empresas pelo sistema (não fixar só essas 3)

**Advogados**

- Nome

- OAB

- Empresas/áreas que atende

- Usuário vinculado (login)

**Áreas/Tipos de processo**

- Nome (Cível, Administrativo, Trabalhista, Criminal, Tributário, Previdenciário, Consumidor, Empresarial, Família, Eleitoral)

- Deve ser possível cadastrar novos tipos

**Processos** (entidade central — migrar todos os campos que já existem na planilha, sem perder nenhum, e adicionar os novos pedidos)

- Empresa (relaciona com Empresas)

- Advogado responsável (relaciona com Advogados)

- Área/tipo de processo (relaciona com Áreas)

- Número do processo (autos)

- Data de autuação

- Classe/tipo de ação

- Parte contrária (cível/administrativo) ou Reclamante (trabalhista)

- Vara/Órgão julgador

- Status (Aguardando, Em Progresso, Concluído)

- Data de audiência (quando houver)

- Observações

- **Valor da ação** (campo novo, monetário)

- **Última movimentação** (campo novo: data + texto curto da última movimentação processual)

- Data de criação/atualização do registro

**Movimentações (histórico, opcional mas recomendado)**

- Processo relacionado

- Data

- Descrição

- Permite manter um histórico completo em vez de só "última movimentação"

### 2. Perfis de usuário

- **Administrador/Distribuição**: vê todos os processos de todas as empresas e advogados. Cadastra novos processos e os distribui (atribui) a um advogado e a uma área. Pode editar/reclassificar qualquer processo.

- **Advogado**: ao logar, vê por padrão apenas os processos atribuídos a ele.

### 3. Navegação e telas

**Dashboard inicial (visão geral)**

- Cards com totais: total geral de processos, por status (Aguardando/Em Progresso/Concluído), por empresa, por empresa + área — reproduzindo o painel que já existe na planilha.

- Alertas de audiências próximas (destaque visual, ex: vermelho para prazo em até 3 dias).

**Abas por empresa** (Engpac, Econtecx, Genesis, e as que forem cadastradas)

- Cada aba mostra os processos daquela empresa, organizados por área/tipo de processo (Cível/Administrativo, Trabalhista, etc. — igual à estrutura de blocos que já existe na planilha).

**Área de cada advogado**

- Ao entrar na área de um advogado, mostrar os processos dele agrupados por tipo de processo (sub-abas ou seções: Cível, Trabalhista, Criminal, Tributário...).

- Poder filtrar também por empresa dentro da área do advogado.

**Área de Distribuição/Abastecimento** (visível para Administrador)

- Formulário para cadastrar novo processo (todos os campos acima).

- Lista de processos "não distribuídos" (sem advogado atribuído) em destaque.

- Ação rápida de atribuir/reatribuir advogado e área a um processo.

**Cards/ícones clicáveis de processo**

- Cada processo aparece como um card compacto (número do processo, tipo, status com cor, empresa).

- Ao clicar, abre um modal/detalhe com: tipo de processo, última movimentação, valor da ação, parte contrária, vara, data de autuação, data de audiência, observações e histórico de movimentações.

### 4. Filtros e busca

- Busca por número do processo (autos).

- Filtros combináveis: empresa, advogado, área/tipo, status, com/sem audiência marcada.

- Ordenação por prioridade de prazo (audiências mais próximas primeiro, igual à lógica de índice geral que já existe na planilha).

### 5. Dados iniciais (seed)

Comece o projeto com essas 3 empresas cadastradas: **Engpac**, **Econtecx**, **Genesis**, e as áreas: **Cível/Administrativo** e **Trabalhista** (deixando aberto para adicionar Criminal, Tributário, Previdenciário etc. depois). Não é necessário popular processos de exemplo — vou importar os dados reais depois.

---

## Depois de gerar o projeto

Quando o Lovable terminar a primeira versão, o próximo passo é migrar os dados reais da planilha (Engpac/Econtecx/Genesis) para o banco — posso te ajudar a exportar a planilha em formato compatível para importação assim que o site estiver de pé.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8c94c755-308c-4b46-b06b-d12f6308e11d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
