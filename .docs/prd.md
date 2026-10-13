# PRD — Clima

> Documento de requisitos do produto, derivado de [brain-dump.md](./brain-dump.md).

## 1. Visão geral

**Clima** é uma aplicação web de página única em que o usuário digita o nome de uma cidade e vê as condições climáticas atuais daquele local: temperatura, sensação térmica, umidade, probabilidade de precipitação, vento, condição do tempo e se é dia ou noite.

Os dados vêm da API pública **Open-Meteo** (sem chave de API), em duas etapas — geocodificação e previsão — que para o usuário aparecem como uma única busca.

### Objetivos

- Consultar o clima atual de qualquer cidade a partir do nome.
- Apresentar as informações de forma clara, com estados bem definidos (vazio, carregando, resultado, não encontrado).
- Isolar todo o acesso à API em um único módulo, sem chamadas diretas à API espalhadas pelo projeto.

### Fora de escopo

- Previsão para os próximos dias/horas (apenas condições **atuais**).
- Geolocalização automática do usuário.
- Autocomplete/sugestões de cidades (a busca usa sempre o primeiro resultado).
- Histórico de buscas, favoritos ou persistência.
- Troca de unidades (°C/°F, km/h/mph).

---

## 2. Requisitos funcionais

### RF01 — Busca de cidade

- Campo de texto para o nome da cidade, dentro de um `<form>`.
- A busca é disparada ao pressionar **Enter** ou clicar no botão **Buscar** (submit do formulário).
- O texto é normalizado com `trim()`. Se ficar vazio, nada acontece (nenhuma requisição é feita).
- Durante a busca, o campo e o botão ficam desabilitados.

### RF02 — Fluxo de busca (duas requisições, uma ação)

1. O usuário envia o nome da cidade.
2. O app chama a função de geocodificação do módulo Open-Meteo e obtém `name`, `latitude`, `longitude`, `country_code` e `timezone`.
3. Com esses dados, chama a função de clima e obtém as condições atuais.
4. O resultado é exibido.

Para o usuário, os passos 2 e 3 são **uma única operação com um único loading**.

### RF03 — Regras de "não encontrado"

O app exibe o estado **Não encontrado** quando qualquer um destes casos ocorrer:

- A geocodificação não retorna resultados (`results` ausente ou vazio).
- O resultado da geocodificação não tem algum dos campos obrigatórios.
- A cidade é encontrada, mas a requisição de clima falha ou não traz os campos obrigatórios.
- Ocorre erro de rede ou a resposta HTTP não é `ok`.

Não há mensagem de erro técnica separada; todas as falhas se comportam como "nada encontrado".

### RF04 — Estados da interface

| Estado              | Quando                                   | O que mostra                                                                  |
| ------------------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| **Vazio** (inicial) | Ao abrir o app, antes de qualquer busca  | Ilustração/emoji + texto convidando a buscar uma cidade                        |
| **Carregando**      | Enquanto as duas requisições acontecem   | Indicador de loading no card; campo e botão desabilitados                      |
| **Resultado**       | Busca concluída com sucesso              | Sidebar + área principal com os dados                                          |
| **Não encontrado**  | Qualquer caso do RF03                    | Emoji + mensagem "Nenhuma informação encontrada para "{termo}""                |

O campo de busca fica sempre visível, em todos os estados.

### RF05 — Informações exibidas

**Sidebar (esquerda):**

| Informação           | Origem                               | Formato                                                  |
| -------------------- | ------------------------------------ | -------------------------------------------------------- |
| Temperatura          | `current.temperature_2m`             | Número arredondado + unidade (`19°C`), em destaque        |
| Cidade, país         | geocoding `name`, `country_code`     | `Rio de Janeiro, BR`                                     |
| Dia atual            | `current.time` (já no fuso da cidade) | `terça-feira, 13 de outubro` (locale `pt-BR`)            |
| Dia/noite            | `current.is_day`                     | `☀️ Dia` (1) ou `🌙 Noite` (0)                            |
| Condição do tempo    | `current.weather_code`               | Emoji + descrição em português (ver seção 4.4)           |

**Área principal:**

| Informação                    | Origem                                               | Formato                     |
| ----------------------------- | ---------------------------------------------------- | --------------------------- |
| Umidade relativa              | `current.relative_humidity_2m`                       | `92%`                       |
| Sensação térmica              | `current.apparent_temperature`                       | `21°C`                      |
| Probabilidade de precipitação | `current.precipitation_probability`                  | `73%`                       |
| Vento                         | `current.wind_speed_10m` + `current.wind_direction_10m` | `5.8 km/h` + seta + `O 277°` |

As unidades exibidas vêm de `current_units`, e não ficam fixas no código.

### RF06 — Buscas concorrentes

Se o usuário fizer uma nova busca antes da anterior terminar, só o resultado da **última** busca é exibido. Respostas antigas são descartadas, com um identificador de requisição ou `AbortController`.

---

## 3. Requisitos de sistema (não funcionais)

- **RNF01 — Stack:** Vite + Vanilla + TypeScript, sem framework de UI.
- **RNF02 — Sem dependências de runtime:** apenas `vite` e `typescript` como devDependencies. CSS puro, ícones com emojis.
- **RNF03 — Tipagem:** o código passa em `tsc` com o `tsconfig.json` atual (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` — ou seja, **sem `enum`** e sem parameter properties em classes).
- **RNF04 — Navegadores:** versões recentes de Chrome, Firefox, Safari e Edge (`fetch`, `Intl.DateTimeFormat`, CSS custom properties).
- **RNF05 — Responsividade:** funciona de 320px até desktop.
- **RNF06 — Acessibilidade:** `label` associado ao input (pode ser visualmente oculto), `aria-live="polite"` na região de resultado, `aria-busy` durante o loading, emojis decorativos com `aria-hidden="true"` acompanhados de texto, contraste mínimo AA.
- **RNF07 — Idioma:** interface em português (`<html lang="pt-BR">`); a geocodificação usa `language=pt`.
- **RNF08 — Segurança:** dados vindos da API são inseridos com `textContent` (ou escapados), nunca concatenados em `innerHTML` sem tratamento. O nome da cidade é codificado com `encodeURIComponent` na URL.

---

## 4. Detalhes técnicos

### 4.1 Estrutura de arquivos

```
clima/
├── index.html                # lang="pt-BR", título "Clima"
├── src/
│   ├── main.ts               # bootstrap: monta a UI e liga o formulário
│   ├── style.css             # estilos globais (CSS puro)
│   ├── services/
│   │   └── openMeteo.ts      # ÚNICO ponto de acesso à API Open-Meteo
│   ├── types/
│   │   └── weather.ts        # tipos/interfaces compartilhados
│   ├── utils/
│   │   ├── weatherCode.ts    # mapa WMO code → { emoji, descrição }
│   │   ├── wind.ts           # graus → ponto cardeal
│   │   └── format.ts         # formatação de data, números e unidades
│   └── ui/
│       ├── render.ts         # renderização dos estados (vazio, loading, resultado, não encontrado)
│       └── elements.ts       # referências aos elementos do DOM
```

Remover os arquivos de exemplo do scaffold: `src/counter.ts`, `src/assets/*` e o conteúdo de demo em `main.ts`/`style.css`.

### 4.2 Módulo `services/openMeteo.ts`

É a única camada que faz `fetch` na Open-Meteo. O restante do projeto só importa as funções daqui.

Toda função valida os parâmetros de entrada e a resposta. Se algum parâmetro estiver ausente ou inválido, ou se a resposta não tiver os campos obrigatórios, a função **retorna `null`**, sem lançar exceção. Erros de rede são capturados internamente e também viram `null`.

```ts
// Assinaturas
export async function getCityLocation(name: string): Promise<CityLocation | null>;
export async function getCurrentWeather(
  latitude: number,
  longitude: number,
  timezone: string
): Promise<CurrentWeather | null>;

// Orquestra as duas chamadas — é a função usada pela UI
export async function searchCityWeather(name: string): Promise<CityWeather | null>;
```

**Validação de entrada:**

- `getCityLocation`: `name` precisa ser string não vazia após `trim()`.
- `getCurrentWeather`: `latitude` e `longitude` precisam ser `number` finitos; `timezone` precisa ser string não vazia.

**Endpoints:**

```
GET https://geocoding-api.open-meteo.com/v1/search
    ?name={encodeURIComponent(name)}&count=1&language=pt&format=json

GET https://api.open-meteo.com/v1/forecast
    ?latitude={lat}&longitude={lon}
    &current=precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation,weather_code
    &timezone={encodeURIComponent(timezone)}
```

As URLs devem ser montadas com `URL` / `URLSearchParams`.

### 4.3 Tipos (`types/weather.ts`)

```ts
export interface CityLocation {
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;   // country_code
  timezone: string;
}

export interface WeatherUnits {
  temperature: string;            // temperature_2m
  relativeHumidity: string;       // relative_humidity_2m
  apparentTemperature: string;    // apparent_temperature
  windSpeed: string;              // wind_speed_10m
  windDirection: string;          // wind_direction_10m
  precipitationProbability: string;
}

export interface CurrentWeather {
  time: string;                   // ISO local da cidade, ex. "2026-06-17T09:45"
  temperature: number;
  relativeHumidity: number;
  apparentTemperature: number;
  isDay: boolean;                 // is_day === 1
  windSpeed: number;
  windDirection: number;
  precipitationProbability: number;
  precipitation?: number;         // opcional, não exibido
  weatherCode: number;
  units: WeatherUnits;
}

export interface CityWeather {
  location: CityLocation;
  weather: CurrentWeather;
}
```

**Campos obrigatórios na resposta de clima** (se algum faltar, o resultado é `null`):
`time`, `temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `is_day`, `wind_speed_10m`, `wind_direction_10m`, `precipitation_probability`, `weather_code`.

> `weather_code` foi incluído como obrigatório porque é exibido na sidebar, embora não esteja na lista do brain-dump. `precipitation` é pedido na URL, mas é opcional e não é exibido.

Os campos de `current_units` correspondentes também são lidos. Se uma unidade faltar, usar fallback (`°C`, `%`, `km/h`, `°`).

### 4.4 Weather codes (`utils/weatherCode.ts`)

Mapa `Record<number, { emoji: string; label: string }>`. Código desconhecido → `{ emoji: '🌡️', label: 'Condição desconhecida' }`.

| Código | Emoji | Descrição (pt-BR)                    |
| ------ | ----- | ------------------------------------ |
| 0      | ☀️ / 🌙* | Céu limpo                         |
| 1      | 🌤️ / 🌙* | Predominantemente limpo           |
| 2      | ⛅    | Parcialmente nublado                 |
| 3      | ☁️    | Nublado                              |
| 45     | 🌫️    | Neblina                              |
| 48     | 🌫️    | Neblina com geada                    |
| 51     | 🌦️    | Garoa fraca                          |
| 53     | 🌦️    | Garoa moderada                       |
| 55     | 🌦️    | Garoa intensa                        |
| 56     | 🌧️    | Garoa congelante fraca               |
| 57     | 🌧️    | Garoa congelante intensa             |
| 61     | 🌧️    | Chuva fraca                          |
| 63     | 🌧️    | Chuva moderada                       |
| 65     | 🌧️    | Chuva forte                          |
| 66     | 🌧️    | Chuva congelante fraca               |
| 67     | 🌧️    | Chuva congelante forte               |
| 71     | 🌨️    | Neve fraca                           |
| 73     | 🌨️    | Neve moderada                        |
| 75     | ❄️    | Neve forte                           |
| 77     | 🌨️    | Grãos de neve                        |
| 80     | 🌦️    | Pancadas de chuva fracas             |
| 81     | 🌧️    | Pancadas de chuva moderadas          |
| 82     | ⛈️    | Pancadas de chuva violentas          |
| 85     | 🌨️    | Pancadas de neve fracas              |
| 86     | ❄️    | Pancadas de neve fortes              |
| 95     | ⛈️    | Trovoada fraca ou moderada           |
| 96     | ⛈️    | Trovoada com granizo fraco           |
| 99     | ⛈️    | Trovoada com granizo forte           |

\* Para os códigos 0 e 1, quando `isDay` for `false`, usar 🌙 no lugar do sol.

### 4.5 Vento (`utils/wind.ts`)

- **Ponto cardeal:** 8 setores de 45°: `N, NE, L, SE, S, SO, O, NO`, com índice `Math.round(deg / 45) % 8`.
- **Seta:** um elemento `↑` com `transform: rotate(...)`. Como `wind_direction_10m` indica de onde o vento **vem**, a seta aponta para onde ele **vai**: `rotate(${(deg + 180) % 360}deg)`.
- **Exibição:** `5.8 km/h` em destaque; abaixo, seta + `O · 277°`.

### 4.6 Formatação (`utils/format.ts`)

- **Temperaturas:** `Math.round()` + unidade (`19°C`).
- **Percentuais:** inteiro + unidade (`92%`).
- **Velocidade do vento:** uma casa decimal, com vírgula como separador decimal (`toLocaleString('pt-BR')`): `5,8 km/h`.
- **Data:** `current.time` já vem no horário local da cidade e sem offset. Para não depender do fuso do navegador, interpretar ano/mês/dia a partir da string e formatar com `Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })` sobre `Date.UTC(...)`. Primeira letra em maiúscula.

### 4.7 Fluxo na UI (`main.ts`)

```
submit → trim(nome) → vazio? sair
       → requestId++ ; renderLoading()
       → resultado = await searchCityWeather(nome)
       → requestId mudou? descartar
       → resultado ? renderResult(resultado) : renderNotFound(nome)
       → reabilitar formulário
```

---

## 5. Instruções visuais (design e UX)

### 5.1 Layout geral

```
┌───────────────────────── fundo cinza escuro ─────────────────────────┐
│                                                                      │
│               [ 🔍  Digite o nome da cidade...   ][Buscar]           │  ← topo, centralizado, sem background
│                                                                      │
│        ┌──────────────── card branco, max 800px ────────────────┐    │
│        │ ┌── sidebar ──┐ ┌──────── área principal ────────────┐ │    │
│        │ │    ⛅        │ │ ┌───────────┐  ┌───────────┐       │ │    │
│        │ │   19°C      │ │ │ Umidade   │  │ Sensação  │       │ │    │
│        │ │ Rio de      │ │ │   92%     │  │   21°C    │       │ │    │
│        │ │ Janeiro, BR │ │ └───────────┘  └───────────┘       │ │    │
│        │ │ Terça-feira,│ │ ┌───────────┐  ┌───────────┐       │ │    │
│        │ │ 13 de out.  │ │ │ Precipit. │  │ Vento     │       │ │    │
│        │ │ ☀️ Dia       │ │ │   73%     │  │ 5,8 km/h  │       │ │    │
│        │ │ Parcialmente│ │ │           │  │ ↗ O·277°  │       │ │    │
│        │ │ nublado     │ │ └───────────┘  └───────────┘       │ │    │
│        │ └─────────────┘ └────────────────────────────────────┘ │    │
│        └────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

- **Página:** fundo cinza escuro, conteúdo centralizado horizontalmente, com padding vertical generoso (≈48px) e laterais mínimas de 16px.
- **Área superior:** sem background. Contém só o formulário de busca, centralizado, com largura máxima igual à do card (800px).
- **Card:** fundo branco, `border-radius` bem arredondado (≈24px), `max-width: 800px`, `width: 100%`, centralizado, sombra suave, `overflow: hidden`. Sidebar e área principal ficam dentro dele.
- **Sidebar:** à esquerda, com ≈280px de largura e fundo levemente diferenciado do branco (cinza muito claro ou um gradiente suave), conteúdo empilhado e centralizado.
- **Área principal:** grid 2×2 de cards de métrica, com espaçamento de ≈16px.

### 5.2 Tokens de design (CSS custom properties em `:root`)

```css
:root {
  --color-bg:          #1f2329;  /* fundo da página — cinza escuro */
  --color-surface:     #ffffff;  /* card */
  --color-sidebar:     #f3f5f8;
  --color-metric:      #f7f8fa;  /* cards de métrica */
  --color-text:        #1f2329;
  --color-text-muted:  #6b7280;
  --color-text-invert: #f3f4f6;  /* textos sobre o fundo escuro */
  --color-accent:      #3b82f6;  /* botão, foco */
  --color-input-bg:    #2b3038;

  --radius-card:   24px;
  --radius-metric: 16px;
  --radius-input:  12px;

  --font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
```

### 5.3 Busca

- O input e o botão ficam lado a lado, em uma linha.
- **Input:** fundo `--color-input-bg`, texto claro, placeholder "Digite o nome da cidade...", borda sutil, com borda/anel em `--color-accent` no foco.
- **Botão:** "Buscar", fundo `--color-accent`, texto branco. No hover, o fundo escurece levemente. Desabilitado, fica com opacidade reduzida e `cursor: not-allowed`.

### 5.4 Tipografia e hierarquia

- **Temperatura (sidebar):** ≈64px, peso 700. É o maior elemento da tela.
- **Cidade:** ≈20px, peso 600.
- **Data, dia/noite e condição:** ≈14–16px, cor `--color-text-muted`.
- **Emoji da condição:** ≈56px, acima da temperatura.
- **Cards de métrica:** rótulo pequeno em `--color-text-muted` (≈13px, maiúsculas e com letter-spacing) e valor grande (≈28px, peso 600). Um emoji pequeno ao lado do rótulo: 💧 umidade, 🌡️ sensação, ☔ precipitação, 💨 vento.

### 5.5 Estados visuais

- **Vazio:** o card aparece com conteúdo centralizado (sem sidebar/grid): emoji 🌍 grande, título "Busque uma cidade" e o subtítulo "Digite o nome de uma cidade para ver o clima atual". Altura mínima ≈320px.
- **Carregando:** o card mostra um spinner em CSS (anel girando) e o texto "Buscando...". A altura mínima é a mesma do estado vazio, para evitar salto de layout.
- **Não encontrado:** mesmo layout do vazio, com o emoji 🔍, o título "Nada encontrado" e o subtítulo "Não encontramos informações para "{termo}". Verifique o nome e tente novamente."
- **Resultado:** layout completo da seção 5.1, com um fade-in curto (≈200ms). A animação respeita `prefers-reduced-motion`.

### 5.6 Responsividade

- **Abaixo de 640px:** o card passa para coluna única: a sidebar fica no topo, com largura total, e a área principal abaixo.
- **Grid de métricas:** continua 2×2 até 400px. Abaixo disso, vira uma coluna.
- **Busca:** o input ocupa a largura disponível e o botão mantém a largura do conteúdo.

---

## 6. Critérios de aceite

1. Ao abrir o app, aparece o estado vazio, e nenhuma requisição é feita.
2. Ao buscar "Rio de Janeiro", aparecem o loading e depois o resultado com "Rio de Janeiro, BR", a temperatura, a data, dia/noite, a condição e as 4 métricas.
3. Ao buscar "xyzabc123", aparece o estado "Nada encontrado".
4. Com a rede desligada, qualquer busca termina em "Nada encontrado", sem erro não tratado no console.
5. Uma busca com o campo vazio ou só com espaços não dispara requisição.
6. Nenhum arquivo fora de `services/openMeteo.ts` chama `fetch` ou contém URLs da Open-Meteo.
7. Chamar `getCurrentWeather(NaN, 10, 'UTC')` ou `getCityLocation('')` retorna `null` sem fazer requisição.
8. Em 375px de largura, o layout fica em coluna única e não há scroll horizontal.
9. `npm run build` termina sem erros de TypeScript.
