# Tasks — Clima

> Plano de implementação do [prd.md](./prd.md), dividido em tarefas pequenas e sequenciais.
> Este arquivo **não repete** os requisitos: cada tarefa aponta para as seções do PRD que devem ser lidas antes de começar.

## Como usar (instruções para os agentes)

1. Execute **uma tarefa por vez**, na ordem. Cada tarefa assume que as anteriores estão concluídas.
2. Antes de começar, leia as seções do PRD indicadas em **Referências**. Em caso de dúvida, o PRD prevalece sobre este arquivo.
3. Não implemente nada de tarefas futuras. Se algo do PRD não estiver coberto por nenhuma tarefa, registre em **Pendências** no final deste arquivo.
4. Ao terminar, confira todos os **Critérios de aprovação**. Só marque a tarefa como `[x]` se todos passarem.
5. Os nomes de funções e arquivos definidos aqui são **contratos** entre tarefas. Não os renomeie.

### Critérios globais (valem para todas as tarefas)

- `npm run build` termina sem erros (PRD §3, RNF03).
- Nenhuma dependência nova no `package.json` (RNF02).
- Nenhum `enum` nem parameter properties em classes (RNF03).
- Nenhum `fetch` ou URL da Open-Meteo fora de `src/services/openMeteo.ts` (PRD §6, critério 6).

### Como verificar funções isoladas

O projeto não tem framework de testes (RNF02). Para testar uma função isolada, rode `npm run dev`, abra o app no navegador e, no console do DevTools, importe o módulo direto pelo Vite:

```js
const m = await import('/src/utils/wind.ts');
m.getCardinalDirection(277); // "O"
```

---

## Fase 1 — Base do projeto

### [x] T01 — Limpar o scaffold do Vite

**Referências:** PRD §4.1 (último parágrafo), RNF07.

**O que fazer:**
- Remover `src/counter.ts` e a pasta `src/assets/`.
- Deixar `src/main.ts` apenas com o import de `./style.css`.
- Esvaziar `src/style.css`.
- Ajustar `index.html`: `<html lang="pt-BR">`, `<title>Clima</title>`, manter `<div id="app"></div>` e o script de `src/main.ts`.
- Remover referências a arquivos de `public/` que não serão usados (ex.: ícones do Vite), se existirem no `index.html`.

**Critérios de aprovação:**
- [x] `src/counter.ts` e `src/assets/` não existem.
- [x] Não há referências a `counter`, `typescript.svg`, `vite.svg` ou `hero` em `src/` nem no `index.html`.
- [x] `index.html` tem `lang="pt-BR"` e título `Clima`.
- [x] `npm run dev` abre uma página em branco sem erros no console.
- [x] `npm run build` passa.

---

### [x] T02 — Tipos compartilhados

**Referências:** PRD §4.3.

**O que fazer:**
- Criar `src/types/weather.ts` com as interfaces `CityLocation`, `WeatherUnits`, `CurrentWeather` e `CityWeather`, exatamente como no PRD.

**Critérios de aprovação:**
- [x] O arquivo exporta as 4 interfaces, com os mesmos nomes de campos e tipos do PRD §4.3.
- [x] `precipitation` é opcional e `isDay` é `boolean`.
- [x] `npm run build` passa.

---

## Fase 2 — Utilitários (funções puras, sem DOM e sem rede)

### [x] T03 — Mapa de weather codes

**Referências:** PRD §4.4, RF05 (linha "Condição do tempo").

**O que fazer:**
- Criar `src/utils/weatherCode.ts` com o mapa `Record<number, { emoji: string; label: string }>`.
- Exportar `getWeatherCondition(code: number, isDay: boolean): { emoji: string; label: string }`.

**Critérios de aprovação:**
- [x] Os 28 códigos da tabela do PRD §4.4 estão no mapa, com emoji e descrição iguais aos do PRD.
- [x] `getWeatherCondition(0, true)` → `{ emoji: '☀️', label: 'Céu limpo' }`.
- [x] `getWeatherCondition(0, false)` → emoji `🌙`.
- [x] `getWeatherCondition(1, false)` → emoji `🌙`, label `Predominantemente limpo`.
- [x] `getWeatherCondition(2, false)` → emoji `⛅` (a troca por lua vale só para 0 e 1).
- [x] `getWeatherCondition(999, true)` → `{ emoji: '🌡️', label: 'Condição desconhecida' }`.
- [x] `npm run build` passa.

---

### [x] T04 — Utilitários de vento

**Referências:** PRD §4.5.

**O que fazer:**
- Criar `src/utils/wind.ts` exportando:
  - `getCardinalDirection(deg: number): string` → um de `N, NE, L, SE, S, SO, O, NO`.
  - `getArrowRotation(deg: number): number` → `(deg + 180) % 360`.

**Critérios de aprovação:**
- [x] `getCardinalDirection(0)` → `N`; `(22)` → `N`; `(23)` → `NE`; `(90)` → `L`; `(180)` → `S`; `(277)` → `O`; `(338)` → `N`; `(360)` → `N`.
- [x] `getArrowRotation(277)` → `97`; `getArrowRotation(0)` → `180`; `getArrowRotation(180)` → `0`.
- [x] `npm run build` passa.

---

### [x] T05 — Utilitários de formatação

**Referências:** PRD §4.6, RF05.

**O que fazer:**
- Criar `src/utils/format.ts` exportando:
  - `formatTemperature(value: number, unit: string): string`
  - `formatPercent(value: number, unit: string): string`
  - `formatWindSpeed(value: number, unit: string): string`
  - `formatDate(isoLocal: string): string`

**Critérios de aprovação:**
- [x] `formatTemperature(19.4, '°C')` → `19°C`; `formatTemperature(-0.6, '°C')` → `-1°C`; `formatTemperature(-0.4, '°C')` → `0°C` (nunca `-0°C`).
- [x] `formatPercent(92, '%')` → `92%`; `formatPercent(72.6, '%')` → `73%`.
- [x] `formatWindSpeed(5.8, 'km/h')` → `5,8 km/h`; `formatWindSpeed(12, 'km/h')` → `12,0 km/h`.
- [x] `formatDate('2026-10-13T09:45')` → `Terça-feira, 13 de outubro`.
- [x] `formatDate('2026-01-01T23:59')` → `Quinta-feira, 1 de janeiro`, mesmo com o fuso do navegador alterado (DevTools → Sensors → Location, ou fuso UTC-10 / UTC+14).
- [x] A implementação usa `Date.UTC(...)` + `timeZone: 'UTC'`, como descrito no PRD §4.6 (não usa `new Date(isoLocal)` direto).
- [x] `npm run build` passa.

---

## Fase 3 — Módulo de API

### [x] T06 — `getCityLocation` (geocodificação)

**Referências:** PRD §4.2 (validação de entrada, endpoints), RF02, RF03, RNF07, RNF08.

**O que fazer:**
- Criar `src/services/openMeteo.ts` e implementar `getCityLocation(name)`.
- URL montada com `URL` / `URLSearchParams` (`count=1`, `language=pt`, `format=json`).
- Validar entrada e resposta; qualquer falha (inclusive exceção de rede e `response.ok === false`) retorna `null`.
- Converter `country_code` → `countryCode`.

**Critérios de aprovação:**
- [x] `getCityLocation('')` e `getCityLocation('   ')` retornam `null` **sem** requisição na aba Network.
- [x] `getCityLocation('Rio de Janeiro')` retorna objeto com `name: 'Rio de Janeiro'`, `countryCode: 'BR'`, `latitude`/`longitude` numéricos e `timezone: 'America/Sao_Paulo'`.
- [x] `getCityLocation('xyzabc123')` retorna `null`.
- [x] Com a rede desligada (DevTools → Network → Offline), retorna `null` sem erro não tratado no console.
- [x] Na aba Network, a URL tem os parâmetros `name`, `count=1`, `language=pt` e `format=json`, com o nome codificado (ex.: `Rio+de+Janeiro` ou `Rio%20de%20Janeiro`).
- [x] A função nunca lança exceção.
- [x] `npm run build` passa.

---

### [x] T07 — `getCurrentWeather` (clima atual)

**Referências:** PRD §4.2, §4.3 (campos obrigatórios e fallback de unidades), RF03.

**O que fazer:**
- Implementar `getCurrentWeather(latitude, longitude, timezone)` em `src/services/openMeteo.ts`.
- Pedir exatamente os campos de `current` listados no PRD §4.2.
- Validar os campos obrigatórios (PRD §4.3) e mapear `snake_case` → `camelCase`, com `isDay = is_day === 1`.
- Ler `current_units`, com fallback (`°C`, `%`, `km/h`, `°`) para cada unidade que faltar.

**Critérios de aprovação:**
- [x] `getCurrentWeather(NaN, 10, 'UTC')`, `getCurrentWeather(10, Infinity, 'UTC')` e `getCurrentWeather(10, 10, '')` retornam `null` **sem** requisição.
- [x] `getCurrentWeather(-22.9, -43.2, 'America/Sao_Paulo')` retorna objeto com todos os campos de `CurrentWeather`, incluindo `units`.
- [x] `time` vem no formato local (`YYYY-MM-DDTHH:mm`), sem offset.
- [x] Se um campo obrigatório faltar na resposta, retorna `null` (verificável lendo o código: todos os 9 campos obrigatórios são checados com `typeof`).
- [x] Com a rede desligada, retorna `null` sem erro não tratado no console.
- [x] A função nunca lança exceção.
- [x] `npm run build` passa.

---

### [x] T08 — `searchCityWeather` (orquestração)

**Referências:** PRD §4.2 (assinaturas), RF02, RF03.

**O que fazer:**
- Implementar `searchCityWeather(name)` encadeando `getCityLocation` → `getCurrentWeather`, retornando `CityWeather | null`.

**Critérios de aprovação:**
- [x] `searchCityWeather('Rio de Janeiro')` retorna `{ location, weather }` preenchidos.
- [x] `searchCityWeather('xyzabc123')` retorna `null` e faz só **uma** requisição (a de geocodificação).
- [x] `searchCityWeather('')` retorna `null` sem requisições.
- [x] `src/services/openMeteo.ts` é o único arquivo do projeto com `fetch` ou `open-meteo.com` (conferir com busca no projeto).
- [x] `npm run build` passa.

---

## Fase 4 — Interface

### [x] T09 — Estrutura HTML e referências do DOM

**Referências:** PRD §4.1, §5.1, RF01, RNF06.

**O que fazer:**
- Montar a estrutura base da página (no `index.html` ou criada por `main.ts`, à escolha do agente):
  - `<form>` com `<label>` associado ao `<input>` (label pode ser visualmente oculto), placeholder "Digite o nome da cidade..." e botão `submit` "Buscar".
  - Container do card com `aria-live="polite"`.
- Criar `src/ui/elements.ts` exportando as referências: `searchForm`, `searchInput`, `searchButton` e `resultCard`. Se algum elemento não existir, lançar erro claro na inicialização.

**Critérios de aprovação:**
- [x] Clicar no `<label>` foca o input (associação `for`/`id` correta).
- [x] O card tem `aria-live="polite"`.
- [x] `elements.ts` não usa `!` sem verificação (non-null assertion) para os elementos.
- [x] A página carrega sem erros no console.
- [x] `npm run build` passa.

---

### [x] T10 — Estilos base: tokens, página e busca

**Referências:** PRD §5.1 (página, área superior, card), §5.2, §5.3.

**O que fazer:**
- Em `src/style.css`: tokens em `:root` (exatamente os do PRD §5.2), reset mínimo, estilos da página, do formulário de busca e do card vazio (fundo branco, raio, sombra, `max-width: 800px`).
- Classe utilitária para ocultar visualmente o label (ex.: `.sr-only`).

**Critérios de aprovação:**
- [x] Todos os tokens do PRD §5.2 existem em `:root` e as cores são usadas via `var(...)`.
- [x] Fundo da página cinza escuro; formulário centralizado, sem background, com input e botão na mesma linha.
- [x] Input com anel/borda `--color-accent` no foco; botão escurece no hover; estilo `:disabled` com opacidade reduzida e `cursor: not-allowed`.
- [x] Card branco centralizado, com largura máxima de 800px e cantos ≈24px.
- [x] `npm run build` passa.

---

### [x] T11 — Renderização dos estados vazio, carregando e não encontrado

**Referências:** PRD RF04, §5.5 (vazio, carregando, não encontrado), RNF06, RNF08.

**O que fazer:**
- Criar `src/ui/render.ts` exportando:
  - `renderEmpty(): void`
  - `renderLoading(): void`
  - `renderNotFound(term: string): void`
  - `setFormDisabled(disabled: boolean): void` (desabilita input e botão)
- `renderLoading` define `aria-busy="true"` no card; os demais removem/definem `false`.
- Adicionar o CSS desses estados (layout centralizado, altura mínima ≈320px, spinner em CSS puro).
- Em `main.ts`, chamar `renderEmpty()` no carregamento.

**Critérios de aprovação:**
- [x] Ao abrir o app, aparece o estado vazio (🌍, "Busque uma cidade", subtítulo do PRD) e **nenhuma** requisição na aba Network.
- [x] Chamando `renderLoading()` pelo console, aparece o spinner + "Buscando..." com a mesma altura do estado vazio (sem salto de layout).
- [x] `renderNotFound('<img src=x onerror=alert(1)>')` mostra o texto literalmente, sem executar nada (uso de `textContent`).
- [x] Os textos do estado não encontrado são exatamente os do PRD §5.5.
- [x] Emojis têm `aria-hidden="true"`.
- [x] `npm run build` passa.

---

### [x] T12 — Renderização do resultado

**Referências:** PRD RF05, §4.5 (seta e exibição do vento), §5.1, §5.4, §5.5 (resultado), RNF06, RNF08.

**O que fazer:**
- Em `src/ui/render.ts`, exportar `renderResult(data: CityWeather): void`.
- Montar sidebar (emoji da condição, temperatura, "Cidade, PAÍS", data, dia/noite, condição) e grid 2×2 de métricas (umidade, sensação, precipitação, vento), usando os utilitários de T03–T05.
- Unidades vêm de `data.weather.units` (nada fixo no código).
- Seta do vento: elemento `↑` com `transform: rotate(...)` usando `getArrowRotation`.
- CSS: sidebar ≈280px com fundo `--color-sidebar`, cards de métrica, tipografia do PRD §5.4, fade-in ≈200ms desativado com `prefers-reduced-motion: reduce`.

**Critérios de aprovação:**
- [x] Chamando `renderResult` pelo console com o retorno de `searchCityWeather('Rio de Janeiro')`, aparecem: emoji da condição, temperatura arredondada com unidade, `Rio de Janeiro, BR`, data no formato `Terça-feira, 13 de outubro`, `☀️ Dia` ou `🌙 Noite`, descrição da condição e as 4 métricas.
- [x] Vento exibido como `5,8 km/h` (exemplo) e, abaixo, seta + `O · 277°`; a seta aponta para onde o vento vai.
- [x] Cada métrica tem rótulo com emoji (💧, 🌡️, ☔, 💨) e o emoji tem `aria-hidden="true"`.
- [x] Nenhum dado da API é inserido com `innerHTML` (conferir no código).
- [x] Temperatura é o maior elemento da tela (≈64px, peso 700).
- [x] Com "Reduzir movimento" ativado (DevTools → Rendering → `prefers-reduced-motion: reduce`), não há animação.
- [x] `npm run build` passa.

---

### [x] T13 — Fluxo de busca no `main.ts` e buscas concorrentes

**Referências:** PRD RF01, RF02, RF04, RF06, §4.7.

**O que fazer:**
- Em `src/main.ts`, ligar o `submit` do formulário seguindo o fluxo do PRD §4.7 (com `preventDefault`).
- Usar um `requestId` (ou `AbortController`) para descartar respostas antigas.
- Desabilitar o formulário durante a busca e reabilitar ao final. Sempre reabilitar, mesmo que algo dê errado, e devolver o foco ao input.

**Critérios de aprovação:**
- [x] Buscar "Rio de Janeiro" (Enter ou botão) mostra loading e depois o resultado.
- [x] Buscar "xyzabc123" mostra "Nada encontrado" com o termo digitado.
- [x] Enviar com o campo vazio ou só com espaços não faz requisição e não muda o estado da tela.
- [x] Durante o loading, input e botão ficam desabilitados e o card tem `aria-busy="true"`.
- [x] Com a rede em "Slow 3G", disparar uma busca e logo outra (ex.: via console, chamando `searchForm.requestSubmit()` duas vezes com termos diferentes) mostra só o resultado da **última**.
- [x] Offline, a busca termina em "Nada encontrado", sem erro não tratado no console e com o formulário reabilitado.
- [x] A página não recarrega ao enviar o formulário.
- [x] `npm run build` passa.

---

### [x] T14 — Responsividade

**Referências:** PRD §5.6, RNF05.

**O que fazer:**
- Media queries para `< 640px` (card em coluna, sidebar no topo, largura total) e `< 400px` (grid de métricas em 1 coluna).
- Garantir que input ocupe o espaço disponível e o botão mantenha a largura do conteúdo.

**Critérios de aprovação:**
- [x] Em 375px (DevTools → modo dispositivo), o layout fica em coluna única e **não há scroll horizontal**, nos 4 estados.
- [x] Em 320px, nada é cortado nem transborda (inclusive nomes longos de cidade, ex.: "Santa Cruz de la Sierra").
- [x] Entre 400px e 639px, o grid de métricas continua 2×2; abaixo de 400px, vira 1 coluna.
- [x] Em ≥ 640px, sidebar à esquerda (≈280px) e grid à direita.
- [x] `npm run build` passa.

---

## Fase 5 — Revisão e validação

### [x] T15 — Revisão de acessibilidade e segurança

**Referências:** PRD RNF06, RNF07, RNF08.

**O que fazer:**
- Revisar o código e a página contra cada item de RNF06–RNF08 e corrigir o que faltar.

**Critérios de aprovação:**
- [x] Todo emoji decorativo tem `aria-hidden="true"` e está acompanhado de texto.
- [x] Contraste AA: textos sobre o fundo escuro e `--color-text-muted` sobre branco/sidebar passam no verificador de contraste do DevTools (ou Lighthouse).
- [x] Lighthouse → Acessibilidade sem falhas de `label`, contraste ou ARIA.
- [x] Busca no projeto por `innerHTML` não encontra uso com dados da API.
- [x] O foco é visível em input e botão ao navegar com Tab.
- [x] `npm run build` passa.

---

### [x] T16 — Validação final dos critérios de aceite

**Referências:** PRD §6 (todos os itens).

**O que fazer:**
- Executar os 9 critérios de aceite do PRD §6 e corrigir o que falhar.
- Conferir se a estrutura de arquivos bate com o PRD §4.1.

**Critérios de aprovação:**
- [x] Os 9 critérios do PRD §6 passam (registrar abaixo, em Pendências, qualquer item que não puder ser verificado).
- [x] A árvore de `src/` corresponde ao PRD §4.1 (sem arquivos extras do scaffold).
- [x] `package.json` tem apenas `vite` e `typescript` em `devDependencies` e nenhuma `dependencies`.
- [x] `npm run build` passa.

---

## Pendências

> Use esta seção para registrar dúvidas, divergências com o PRD ou itens que ficaram de fora.

- **Sem timeout nas requisições (T13):** `fetch` em `src/services/openMeteo.ts` não tem timeout. Se a rede travar sem falhar (observado uma vez durante os testes com throttling), o card fica em "Buscando..." e o formulário desabilitado até a requisição terminar. O PRD não pede timeout; avaliar adicionar `AbortSignal.timeout(...)` em `fetchJson`.
- **Contraste (resolvido na T15):** dois pares do PRD §5.2 não atingiam AA: texto branco sobre `--color-accent` (3,68:1) e `--color-text-muted` sobre `--color-sidebar` (4,43:1). Os tokens do PRD foram mantidos e criados dois derivados em `:root`: `--color-accent-strong: #2563eb` (fundo do botão, 5,17:1) e `--color-text-muted-strong: #4b5563` (data, dia/noite e condição na sidebar, 6,92:1). `--color-accent` continua no anel de foco e na seta do vento (contraste ≥ 3:1, suficiente para elementos não textuais). Divergência visual pequena em relação ao PRD §5.3/§5.4.
- **Animação no ambiente de teste (T12):** o Windows usado nos testes já reporta `prefers-reduced-motion: reduce`; o fade-in de 200ms foi verificado emulando `no-preference`.
- **Título da página (T15):** adicionado `<h1 class="sr-only">Clima</h1>` no `index.html` para a hierarquia de títulos (os títulos visíveis começam em `h2`).
- **Tipos (T16):** `src/types/weather.ts` usa `type` em vez de `interface` (PRD §4.3). Os campos e tipos são idênticos e o build passa; manter ou voltar para `interface` é só uma questão de estilo.
- **Verificação da Fase 5:** Lighthouse → Acessibilidade = 100 (estado inicial). axe-core (WCAG 2 A/AA + boas práticas) sem violações nos estados vazio, resultado e não encontrado. Os 9 critérios do PRD §6 foram verificados com Chrome headless (puppeteer-core e axe rodando fora do projeto, sem alterar o `package.json`), inclusive offline, em 375px e em 320px.
- **Nova paleta (pós-Fase 5):** a pedido do usuário, as cores trocaram para um tema "céu noturno": fundo azul-marinho em degradê (`--color-bg` #0b1d36 → `--color-bg-end` #173a66), sidebar azul-céu claro (#e6f0fb), destaque `--color-accent` #38bdf8 e botão/seta em `--color-accent-strong` #0369a1. Com isso, os valores dos tokens em `src/style.css` **divergem do PRD §5.2** (os nomes foram mantidos). Todos os pares de texto continuam AA e o axe segue sem violações. `--color-text-muted-strong` foi removido: `--color-text-muted` (#52637a) já tem 5,3:1 sobre a sidebar.
