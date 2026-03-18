# 🔊 Audiometry Screener — Behavioral Hearing Screening System

> Aplicação web completa de audiometria/triagem auditiva comportamental, otimizada para tablet em modo paisagem. Construída sobre um sistema legado iOS, agora como PWA moderna com persistência total.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Arquitetura Geral](#arquitetura-geral)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Schema do Banco de Dados](#schema-do-banco-de-dados)
6. [Camada de Serviços](#camada-de-serviços)
7. [Motor de Áudio (Web Audio API)](#motor-de-áudio-web-audio-api)
8. [TestModel e Algoritmo Adaptativo](#testmodel-e-algoritmo-adaptativo)
9. [Telas e Navegação](#telas-e-navegação)
10. [Internacionalização (i18n)](#internacionalização-i18n)
11. [Design System](#design-system)
12. [Resultados, Gráficos e CSV](#resultados-gráficos-e-csv)
13. [Assets Placeholder](#assets-placeholder)
14. [Constantes Configuráveis](#constantes-configuráveis)
15. [Desenvolvimento](#desenvolvimento)
16. [Deploy](#deploy)

---

## Visão Geral

A aplicação implementa um sistema completo de triagem auditiva comportamental com:

- **Calibração** por frequência e por canal (esquerdo/direito), com cálculo de fatores de correção
- **Protocolos salvos** (templates de configuração reutilizáveis)
- **Perfil de paciente** com persistência total de resultados por frequência e por orelha
- **Modo prática** (`is_practice = true`) e **modo teste real** (`is_practice = false`)
- **Modo adulto** (neutro, textual) e **modo infantil** (lúdico, emojis de animais)
- **Algoritmo adaptativo de limiar** com duas fases (inicial e fina)
- **Ensaios com três casos**: primeiro intervalo, segundo intervalo e silêncio (catch trial)
- **Suporte bilateral e unilateral** com tela de troca de orelha no meio do exame
- **Detecção de spam** para respostas repetitivas
- **Gráficos audiograma** (limiar por frequência) e **scatter plots** (histórico de ensaios com diferenciação acerto/erro/silêncio)
- **Exportação CSV** completa com todos os campos clínicos
- **Internacionalização PT/EN** em toda a interface

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite 5 |
| **Estilo** | Tailwind CSS 3 + shadcn/ui |
| **Roteamento** | React Router DOM 6 |
| **Estado** | React hooks + padrão de serviços |
| **Backend** | Lovable Cloud (PostgreSQL) |
| **Áudio** | Web Audio API (OscillatorNode, GainNode, StereoPannerNode, BufferSourceNode) |
| **Gráficos** | Recharts (LineChart, ScatterChart) |
| **Notificações** | Sonner |
| **Testes** | Vitest + Playwright |
| **i18n** | Módulo custom com dicionário PT/EN |

---

## Arquitetura Geral

A aplicação segue uma **arquitetura em camadas** com separação estrita de responsabilidades:

```
┌─────────────────────────────────────────────────────┐
│                    Camada de UI                     │
│  (11 páginas React + componentes shadcn/ui)         │
├─────────────────────────────────────────────────────┤
│                 Camada de Domínio                   │
│  TestModel (algoritmo adaptativo, motor de ensaios) │
├──────────────────┬──────────────────────────────────┤
│  Motor de Áudio  │       Camada de Serviços         │
│  CalibrationPlayer│ GlobalSettingService             │
│  AdultTestPlayer │ CalibrationService               │
│  ChildrenTestPlayer│ TestSettingService              │
│                  │ PatientProfileService             │
│                  │ CSVExport                         │
├──────────────────┴──────────────────────────────────┤
│              Camada de Persistência                 │
│  Supabase Client → PostgreSQL (6 tabelas)           │
├─────────────────────────────────────────────────────┤
│             Constantes e Tipos                      │
│  audio.ts · audiometry.ts · translations.ts         │
└─────────────────────────────────────────────────────┘
```

### Princípios de Design

1. **Database-first**: Schema e migrations criados antes de qualquer código de UI.
2. **Separação de domínios**: Calibração, protocolos, prática, teste adulto, teste infantil e resultados são módulos completamente independentes.
3. **Padrão de serviços**: Todo acesso ao banco passa por módulos de serviço dedicados — nenhuma chamada direta ao Supabase nos componentes.
4. **Isolamento de áudio**: Três players especializados sem estado compartilhado; cada um atende um caso de uso distinto.
5. **TestModel como motor**: Toda lógica clínica (algoritmo de limiar, gerenciamento de ensaios, detecção de spam) vive no `TestModel`, desacoplada da UI.

---

## Estrutura de Diretórios

```
src/
├── audio/                        # Players Web Audio API
│   ├── calibrationPlayer.ts      # Tom puro contínuo para calibração
│   ├── adultTestPlayer.ts        # Senoide pulsada para testes adultos
│   └── childrenTestPlayer.ts     # Playback WAV + fallback de síntese
├── components/
│   └── ui/                       # Biblioteca de componentes shadcn/ui
├── constants/
│   └── audio.ts                  # Todos os parâmetros de áudio/teste
├── hooks/                        # React hooks (use-mobile, use-toast)
├── i18n/
│   └── translations.ts           # Dicionário de tradução EN/PT
├── integrations/
│   └── supabase/
│       ├── client.ts             # Cliente Supabase (auto-gerado)
│       └── types.ts              # Tipos do banco (auto-gerado)
├── lib/
│   └── utils.ts                  # Funções utilitárias (cn)
├── models/
│   └── testModel.ts              # Motor central do teste e algoritmo adaptativo
├── pages/                        # Todas as telas da aplicação (11 páginas)
│   ├── Index.tsx                 # Tela inicial
│   ├── CalibrationPage.tsx       # Gerenciamento de calibração
│   ├── ProtocolSetupPage.tsx     # Configuração de protocolo e paciente
│   ├── PracticePage.tsx          # Wrapper do modo prática
│   ├── AdultInstructionPage.tsx  # Instrução pré-teste adulto
│   ├── ChildrenInstructionPage.tsx # Instrução pré-teste infantil
│   ├── AdultTestPage.tsx         # Execução do teste adulto
│   ├── ChildrenTestPage.tsx      # Execução do teste infantil
│   ├── EarSwitchPage.tsx         # Troca de orelha no meio do exame
│   ├── ResultsPage.tsx           # Resultados, gráficos e exportação CSV
│   └── NotFound.tsx              # Página 404
├── services/                     # CRUD e lógica de negócio
│   ├── globalSettingService.ts   # Singleton de configuração global
│   ├── calibrationService.ts     # CRUD calibrações + cálculo de correção
│   ├── testSettingService.ts     # CRUD protocolos/templates
│   ├── patientProfileService.ts  # CRUD perfis de paciente
│   └── csvExport.ts              # Geração e download de CSV
├── types/
│   └── audiometry.ts             # Definições de tipos do domínio
├── App.tsx                       # Componente raiz e roteamento
├── index.css                     # Tokens do design system (HSL)
└── main.tsx                      # Entry point

public/
├── Animal_Icons/                 # Placeholder: imagens de animais por frequência
├── Animal_Tones/                 # Placeholder: arquivos WAV por frequência
├── Shape_Icons/                  # Placeholder: ícones de formas para modo adulto
└── favicon.ico
```

---

## Schema do Banco de Dados

Seis tabelas em PostgreSQL via Lovable Cloud, todas com RLS habilitado.

### 1. `global_settings`

Linha singleton que gerencia o estado operacional atual da aplicação.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid (PK) | Auto-gerado |
| `current_test_count` | integer | Posição atual na sequência de teste |
| `total_test_count` | integer | Total de testes planejados |
| `is_testing_both` | boolean | Flag de modo bilateral |
| `is_testing_left` | boolean | Flag de orelha inicial |
| `test_frequency_sequence` | jsonb | Array de frequências `[250, 500, ...]` |
| `test_language` | text | `"English"` ou `"Portuguese"` |
| `active_calibration_setting_id` | uuid (FK) | → `calibration_settings.id` |
| `current_patient_profile_id` | uuid (FK) | → `patient_profiles.id` |
| `created_at` / `updated_at` | timestamptz | Gerenciados automaticamente |

### 2. `calibration_settings`

Perfis de calibração nomeados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid (PK) | Auto-gerado |
| `name` | text | Nome definido pelo usuário |
| `timestamp` | timestamptz | Hora de criação |
| `created_at` / `updated_at` | timestamptz | Gerenciados automaticamente |

### 3. `calibration_setting_values`

Dados de calibração por frequência (1:N a partir de `calibration_settings`).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid (PK) | Auto-gerado |
| `calibration_setting_id` | uuid (FK) | → `calibration_settings.id` |
| `frequency` | integer | Frequência em Hz |
| `expected_lv` | double | Nível de referência esperado (RETSPL) |
| `presentation_lv` | double | Nível de apresentação para tom de calibração |
| `measured_lv_l` | double | SPL medido — canal esquerdo |
| `measured_lv_r` | double | SPL medido — canal direito |
| `created_at` / `updated_at` | timestamptz | Gerenciados automaticamente |

**Fórmula do fator de correção:**
```
fatorCorreçãoEsquerdo = expected_lv - measured_lv_l
fatorCorreçãoDireito  = expected_lv - measured_lv_r
```

### 4. `test_settings`

Templates de protocolo (independentes, reutilizáveis entre pacientes).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid (PK) | Auto-gerado |
| `name` | text | Nome do protocolo |
| `frequency_sequence` | jsonb | Array de frequências do teste |
| `is_test_both` | boolean | Testar ambas as orelhas |
| `is_test_left_first` | boolean | Iniciar pela orelha esquerda |
| `timestamp` | timestamptz | Hora de criação |
| `created_at` / `updated_at` | timestamptz | Gerenciados automaticamente |

### 5. `patient_profiles`

Uma linha por sessão de exame do paciente.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid (PK) | Auto-gerado |
| `name` | text | Nome do paciente |
| `patient_group` | text | Grupo/classificação |
| `ear_order` | text | `left_first`, `right_first`, `left_only`, `right_only` |
| `frequency_order` | jsonb | Array de frequências do teste |
| `is_adult` | boolean | Modo adulto vs. infantil |
| `is_practice` | boolean | Prática vs. exame real |
| `timestamp` | timestamptz | Hora de início do exame |
| `end_time` | timestamptz | Hora de término do exame |
| `duration_seconds` | integer | Duração total do exame |
| `created_at` / `updated_at` | timestamptz | Gerenciados automaticamente |

### 6. `patient_profile_values`

Resultados por frequência e por orelha (1:N a partir de `patient_profiles`).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid (PK) | Auto-gerado |
| `patient_profile_id` | uuid (FK) | → `patient_profiles.id` |
| `frequency` | integer | Frequência em Hz |
| `threshold_l` / `threshold_r` | double | Limiar em dB (-1 = Sem Resposta / NR) |
| `results_l` / `results_r` | jsonb | Array de níveis dB apresentados |
| `responses_l` / `responses_r` | jsonb | Array de objetos detalhados de cada ensaio |
| `no_sound_count_l` / `no_sound_count_r` | integer | Contagem de ensaios silenciosos |
| `no_sound_correct_l` / `no_sound_correct_r` | integer | Respostas corretas em silêncio |
| `spam_count_l` / `spam_count_r` | integer | Contagem de detecção de spam |
| `start_time_l` / `start_time_r` | timestamptz | Hora de início por orelha |
| `end_time_l` / `end_time_r` | timestamptz | Hora de término por orelha |
| `duration_seconds_l` / `duration_seconds_r` | integer | Duração por orelha |
| `created_at` / `updated_at` | timestamptz | Gerenciados automaticamente |

### Formato do objeto em `responses_l` / `responses_r`

Cada entrada no array JSON contém:
```json
{
  "case": 0,           // 0=silêncio, 1=primeiro intervalo, 2=segundo intervalo
  "response": "first", // "first", "second" ou "no_sound"
  "correct": true,     // acerto ou erro
  "db": 50,            // nível apresentado
  "ts": "2026-03-18T..."  // timestamp
}
```

### Relacionamentos

```
global_settings ──FK──→ calibration_settings
global_settings ──FK──→ patient_profiles
calibration_settings ──1:N──→ calibration_setting_values
patient_profiles ──1:N──→ patient_profile_values
test_settings (independente — usado como template)
```

### Seed / Dados Iniciais

- Uma linha de `global_settings` é criada automaticamente no primeiro acesso via `globalSettingService.getOrCreate()`.
- Sequência padrão de frequências: `[250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000]`
- Níveis esperados padrão (RETSPL) e níveis de apresentação estão definidos em `src/constants/audio.ts`.

---

## Camada de Serviços

Todos os serviços ficam em `src/services/` e fornecem operações CRUD sobre o cliente Supabase.

### `globalSettingService`

| Método | Descrição |
|--------|-----------|
| `getOrCreate()` | Garante existência da linha singleton e retorna |
| `update(id, updates)` | Atualização genérica |
| `setLanguage(id, language)` | Alterna EN/PT |
| `setFrequencySequence(id, sequence)` | Atualiza sequência de frequências |
| `setActiveCalibration(id, calibrationId)` | Define calibração ativa |
| `setCurrentPatient(id, patientId)` | Define paciente atual |
| `setTestProgress(id, current, total)` | Atualiza contadores de progresso |
| `setEarConfig(id, isBoth, isLeft)` | Configura modo de teste de orelha |

### `calibrationService`

| Método | Descrição |
|--------|-----------|
| `list()` | Lista todas as calibrações |
| `getWithValues(id)` | Calibração + valores por frequência |
| `create(name)` | Nova calibração com linhas de frequência padrão |
| `updateName(id, name)` | Renomear |
| `updateValue(valueId, updates)` | Atualizar valor individual de frequência |
| `clearMeasured(calibrationId)` | Resetar níveis medidos para 0 |
| `fillDefaultPresentation(calibrationId)` | Preencher com níveis padrão |
| `delete(id)` | Remover calibração (cascade nos valores) |
| `getCorrectionFactors(values, frequency)` | Calcular correção esquerda/direita |

### `testSettingService`

| Método | Descrição |
|--------|-----------|
| `list()` | Lista todos os protocolos |
| `get(id)` | Protocolo individual |
| `create(name, freqSequence, isTestBoth, isTestLeftFirst)` | Novo protocolo |
| `update(id, updates)` | Modificar protocolo |
| `delete(id)` | Remover protocolo |

### `patientProfileService`

| Método | Descrição |
|--------|-----------|
| `list()` | Lista todos os perfis (descendente por timestamp) |
| `getWithValues(id)` | Perfil + valores por frequência |
| `create(name, group, earOrder, freqOrder, isAdult, isPractice)` | Novo perfil com linhas de valor |
| `updateValue(valueId, updates)` | Atualizar dados de resultado por frequência |
| `endExam(profileId)` | Definir `end_time` e `duration_seconds` |
| `delete(id)` / `deleteAll()` | Remover perfis |

### `csvExport`

| Função | Descrição |
|--------|-----------|
| `generateCSV(profiles)` | Gera string CSV a partir de array de `PatientProfileWithValues` |
| `downloadCSV(csv, filename)` | Dispara download no browser |

---

## Motor de Áudio (Web Audio API)

Três players independentes em `src/audio/`, todos usando a Web Audio API.

### `CalibrationPlayer`

Gera um **tom puro contínuo** para fins de calibração.

| Método | Descrição |
|--------|-----------|
| `play(frequency, db, channel)` | Inicia tom com panorama estéreo (left/right/both) |
| `updateVolume(db)` | Altera volume em tempo real |
| `updateFrequency(freq)` | Altera frequência em tempo real |
| `stop()` | Para o tom atual |
| `dispose()` | Fecha o AudioContext |

Apenas uma frequência toca por vez — chamar `play()` para o tom anterior.

### `AdultTestPlayer`

Gera **tons senoidais pulsados** com envelope ataque-sustentação-liberação para testes auditivos adultos.

| Método | Descrição |
|--------|-----------|
| `updateFreq(freq)` | Define frequência |
| `updateVolume(db, isLeft)` | Define nível e orelha |
| `setCorrection(left, right)` | Aplica fatores de correção da calibração |
| `playFirstInterval()` | Toca sequência pulsada (retorna Promise) |
| `playSecondInterval()` | Toca após gap inter-intervalos |
| `stop()` / `dispose()` | Para e limpa |

**Parâmetros do envelope:**
- Ataque: 35ms (rampa de subida)
- Sustentação: 250ms no amplitude alvo
- Liberação: 35ms (rampa de descida)
- Pulsos: 3 por intervalo
- Gap inter-pulso: 370ms
- Gap inter-intervalos: 700ms

### `ChildrenTestPlayer`

Toca **arquivos WAV pré-gravados** por frequência para testes infantis, com fallback de síntese.

| Método | Descrição |
|--------|-----------|
| `preloadFrequency(freq)` | Carrega e decodifica `/Animal_Tones/{freq}Hz.wav` |
| `playFirstInterval()` / `playSecondInterval()` | Toca WAV ou fallback sintetizado |
| `setCorrection(left, right)` | Aplica fatores de correção |

- Aplica **Z_FACTOR** por frequência (tabela configurável)
- Mesmo sistema de correção que o player adulto

**Parâmetros infantis:**
- Pulsos: 2 por intervalo
- Gap inter-pulso: 500ms

### Conversão dB → Amplitude

```
ampDB = dB - DB_SYSTEM_MAX        // DB_SYSTEM_MAX = 105
amplitude = 10^(ampDB / 20)
// Limitado ao máximo de 1.0
```

---

## TestModel e Algoritmo Adaptativo

`src/models/testModel.ts` — o motor central do teste, desacoplado da UI.

### Inicialização

```typescript
model.initialize(frequencies, earOrder, isAdult, isPractice, profileId, profileValues, calibrationValues)
```

### Apresentação de Ensaios

Cada ensaio apresenta um de três casos:

| Caso | Descrição |
|------|-----------|
| **0** | Silêncio (ensaio de captura / catch trial) |
| **1** | Som no primeiro intervalo |
| **2** | Som no segundo intervalo |

**Seleção de caso** usa randomização balanceada:
- Evita repetir o mesmo caso mais de 2 vezes consecutivas
- Peso maior para casos sub-representados
- No modo prática, cicla por `[1, 2, 0]` para clareza instrucional

### Algoritmo Adaptativo de Limiar

**Nível inicial**: 50 dB

**Fase 1 — Inicial (antes da primeira reversão):**
- Correto → desce **20 dB**
- Incorreto → sobe **20 dB**

**Fase 2 — Fina (após primeira reversão):**
- Correto → desce **10 dB**
- Incorreto → sobe **5 dB**

**Reversão** é detectada quando a direção de mudança de nível se inverte (subida→descida ou descida→subida).

### Critérios de Encerramento

Uma frequência é encerrada quando qualquer uma destas condições é atendida:

1. **Confirmado no mínimo**: Limiar confirmado em 0 dB (mínimo do sistema) após reversão
2. **Sem Resposta (NR)**: 3 falhas no nível máximo (105 dB) → limiar registrado como **-1**
3. **Consistência ascendente**: ≥3 reversões com ≥2 confirmações ascendentes
4. **Modo prática**: Após 6 ensaios por frequência

### Registro de Cada Ensaio

```typescript
{
  frequency: number,        // frequência testada
  ear: "left" | "right",   // orelha
  db: number,              // nível apresentado
  casePresented: 0 | 1 | 2, // caso sorteado
  userResponse: "first" | "second" | "no_sound", // resposta do usuário
  correct: boolean,         // acerto ou erro
  timestamp: string          // ISO timestamp
}
```

### Progressão de Frequência e Orelha

1. Completar todas as frequências para a orelha atual
2. Se bilateral (`left_first` ou `right_first`): exibir tela de troca de orelha
3. Após confirmação da troca: resetar para primeira frequência, orelha oposta
4. Após todas as frequências em ambas as orelhas: marcar exame como completo, navegar para resultados

### Detecção de Spam

- Rastreia pressionamentos consecutivos do mesmo botão
- Após **5 respostas idênticas consecutivas**: incrementa `spam_count`, exibe toast de aviso
- `spam_count` é persistido por frequência por orelha

### Persistência de Dados

Ao encerrar uma frequência, o `TestModel` persiste em `patient_profile_values`:

| Campo | Conteúdo |
|-------|----------|
| `threshold_l` / `threshold_r` | Limiar final (ou -1 para NR) |
| `results_l` / `results_r` | Array de todos os níveis dB apresentados |
| `responses_l` / `responses_r` | Array de objetos detalhados de cada ensaio |
| `no_sound_count_*` / `no_sound_correct_*` | Estatísticas de ensaios silenciosos |
| `spam_count_*` | Contador de spam |
| `start_time_*` / `end_time_*` / `duration_seconds_*` | Dados de temporização |

---

## Telas e Navegação

### Fluxo de Navegação

```
┌──────────────┐
│  Tela Inicial │──→ /calibration
│       /       │──→ /protocol (Start)
│               │──→ /practice (Practice)
│               │──→ /results (View Results)
└───────┬───────┘
        │
   ┌────▼─────┐      ┌───────────────────┐
   │ Protocol │──→   │ Instrução Adulto  │──→ /test/adult
   │ /protocol│      │ /instruction/adult │
   │          │      └───────────────────┘
   │          │      ┌───────────────────┐
   │          │──→   │ Instrução Infantil│──→ /test/children
   │          │      │ /instruction/child│
   └──────────┘      └───────────────────┘

   /test/adult ─── ou ──→ /ear-switch ──→ /test/adult (ou /test/children)
   /test/children          │
                           ▼
                       /results
```

### Detalhe das Telas

| # | Rota | Página | Propósito |
|---|------|--------|-----------|
| 1 | `/` | `Index.tsx` | Tela inicial com Start, Practice, Calibration, View Results. Bloqueia Start/Practice se não há calibração ativa. Toggle de idioma PT/EN. |
| 2 | `/calibration` | `CalibrationPage.tsx` | Grade por frequência: tocar tom, ajustar níveis esperado/apresentação/medido por canal. CRUD de calibrações. Seletor de canal (L/R/Both). |
| 3 | `/protocol` | `ProtocolSetupPage.tsx` | Campos nome/grupo do paciente. Construtor de sequência de frequências (adicionar/remover/limpar). Seletor de ordem de orelha (4 modos). CRUD de protocolos (salvar/carregar/excluir). Iniciar teste adulto ou infantil. |
| 4 | `/practice` | `PracticePage.tsx` | Encapsula `ProtocolSetupPage` com `isPractice=true`. Cria perfis com `is_practice=true`. |
| 5 | `/instruction/adult` | `AdultInstructionPage.tsx` | Instruções textuais + pré-visualização dos botões de intervalo. Tom neutro. |
| 6 | `/instruction/children` | `ChildrenInstructionPage.tsx` | Instruções lúdicas com emojis de animais. Tom infantil. |
| 7 | `/test/adult` | `AdultTestPage.tsx` | Dois alvos grandes de intervalo ("Primeiro"/"Segundo") + botão Silêncio. Barra de progresso, exibição de frequência/orelha/dB. Controles Repetir e Pausar. |
| 8 | `/test/children` | `ChildrenTestPage.tsx` | Dois alvos grandes com emojis de animais + 🤔 Silêncio. Pares de animais aleatórios por ensaio. Texto mínimo. Barra de progresso. Repetir/Pausar. |
| 9 | `/ear-switch` | `EarSwitchPage.tsx` | Mensagem explícita para trocar o lado do fone. Botão Continuar. |
| 10 | `/results` | `ResultsPage.tsx` | Sidebar com lista de pacientes. Tabela de limiares (linhas clicáveis). Scatter plots de histórico por frequência (acerto/erro/silêncio). Audiogramas de linha (esquerdo/direito). Excluir paciente. Exportar CSV. |

---

## Internacionalização (i18n)

Definida em `src/i18n/translations.ts` com dois idiomas:

- **English** (`"English"`)
- **Portuguese** (`"Portuguese"`)

A função `t(key, language)` retorna a string traduzida. O idioma ativo é armazenado em `global_settings.test_language` e alternável a partir da tela inicial e da tela de protocolo.

### Cobertura

Todo o texto da UI é traduzido, incluindo:

| Categoria | Exemplos |
|-----------|----------|
| Navegação | Start/Iniciar, Practice/Prática, Calibration/Calibração, View Results/Ver Resultados |
| Instruções de teste | Adulto neutro, infantil lúdico |
| Botões de controle | Repeat/Repetir, Pause/Pausar, No Sound/Silêncio, Resume/Continuar |
| Labels de resultados | Threshold/Limiar, Reliability/Confiabilidade, NR |
| Mensagens de troca de orelha | Switch Earphone/Trocar Fone |
| Avisos de spam | Mensagem completa em ambos os idiomas |
| Mensagens de erro | Calibração ausente, dados inexistentes |

---

## Design System

### Tokens (index.css)

Todas as cores usam valores HSL definidos como custom properties CSS:

| Token | Propósito |
|-------|-----------|
| `--primary` (217 91% 55%) | Cor principal de ação (azul) |
| `--secondary` (215 16% 46%) | Ações secundárias (azul-cinza) |
| `--destructive` (0 72% 51%) | Ações de exclusão/erro (vermelho) |
| `--stimulus-purple` (274 71% 56%) | Indicador de estímulo |
| `--stimulus-orange` (24 95% 53%) | Acento modo infantil / aviso |
| `--stimulus-green` (142 76% 37%) | Acento modo infantil / sucesso |
| `--panel-left` (199 85% 85%) | Indicador orelha esquerda |
| `--panel-right` (0 77% 87%) | Indicador orelha direita |

### Variantes de Botão

Variantes customizadas para uso em tablet:

| Variante | Caso de Uso |
|----------|-------------|
| `default` | Ações primárias |
| `destructive` | Operações de exclusão |
| `warning` | Fundo `stimulus-orange` (Repetir, Calibração) |
| `success` | Fundo `stimulus-green` (Ver Resultados) |
| `tablet` | Extra-grande (h-16, text-4xl) para tela inicial |
| `touch` | Alvos de toque grandes (h-14, text-2xl) para controles de teste |

### Tipografia

- **Corpo**: Inter (sans-serif)
- **Monoespaçada**: JetBrains Mono (exibição de dados, labels de frequência)

---

## Resultados, Gráficos e CSV

### Tabela de Limiares

Exibe dados por frequência em uma tabela clicável:
- Frequência (Hz)
- Limiar esquerdo (dB ou "NR")
- Limiar direito (dB ou "NR")
- Confiabilidade E/D (razão de acertos em silêncio + indicador de spam)

Clicar em uma linha de frequência expande os **gráficos de histórico de ensaios**.

### Gráficos de Histórico de Ensaios (por frequência)

Dois scatter plots (orelha esquerda, orelha direita) mostrando:
- Eixo X: Número do ensaio
- Eixo Y: Nível dB (invertido, convenção audiográfica)
- Codificação por cor:
  - 🟢 **Verde**: Resposta correta (acerto)
  - 🔴 **Vermelho**: Resposta incorreta (erro)
  - ⚫ **Cinza**: Ensaio silencioso (catch trial)

Navegação: Botões Anterior/Próximo para mover entre frequências.

### Gráficos de Audiograma

Dois gráficos de linha (orelha esquerda, orelha direita):
- Eixo X: Frequência (Hz)
- Eixo Y: Limiar (dB), escala invertida (-10 a 110)
- Valores NR mostrados como lacunas (null)

### Exportação CSV

Exporta todos os dados de pacientes com colunas:

| Coluna | Descrição |
|--------|-----------|
| Patient Name | Nome do paciente |
| Patient Group | Grupo |
| Is Adult | Adult ou Children |
| Is Practice | Practice ou Test |
| Ear Order | Ordem de orelha |
| Frequency Order | Sequência de frequências (separada por `;`) |
| Start Time / End Time | Timestamps do exame |
| Duration (s) | Duração total |
| Frequency (Hz) | Frequência individual |
| Threshold Left / Right (dB) | Limiar (ou "NR" quando -1) |
| No Sound Count L/R | Contagem de ensaios silenciosos |
| No Sound Correct L/R | Acertos em silêncio |
| Spam Count L/R | Contagem de spam |
| Duration Left / Right (s) | Duração por orelha |

---

## Assets Placeholder

Os seguintes diretórios contêm arquivos placeholder para assets substituíveis:

### `public/Animal_Tones/`
Arquivos WAV para áudio do modo infantil, nomeados `{frequência}Hz.wav`:
- `250Hz.wav`, `500Hz.wav`, `750Hz.wav`, `1000Hz.wav`, `1500Hz.wav`, `2000Hz.wav`, `3000Hz.wav`, `4000Hz.wav`, `6000Hz.wav`, `8000Hz.wav`
- Atualmente arquivos `.placeholder` — substituir por gravações WAV reais
- O `ChildrenTestPlayer` faz fallback para tons sintetizados quando WAV não está disponível

### `public/Animal_Icons/`
Assets de imagem para alvos do teste infantil, nomeados `{frequência}Hz.png`:
- Atualmente arquivos `.placeholder` — substituir por ilustrações de animais reais
- A UI atualmente usa emojis como fallback (🐶, 🐱, 🐰, etc.)

### `public/Shape_Icons/`
Assets de formas para elementos visuais do modo adulto:
- `circle.svg`, `square.svg`, `triangle.svg`, `diamond.svg`
- Atualmente arquivos `.placeholder` — substituir por ícones SVG reais

---

## Constantes Configuráveis

Todos os parâmetros de áudio e teste são definidos em `src/constants/audio.ts`:

### Parâmetros Gerais

| Constante | Valor | Descrição |
|-----------|-------|-----------|
| `DEFAULT_FREQUENCIES` | `[250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000]` | Frequências padrão de teste |
| `DB_SYSTEM_MAX` | 105 | Nível dB máximo apresentável |
| `DB_SYSTEM_MIN` | 0 | Nível dB mínimo apresentável |
| `DB_DEFAULT` | 70 | Nível dB padrão |
| `DB_START` | 50 | dB inicial do algoritmo de limiar |

### Parâmetros de Envelope

| Constante | Valor | Descrição |
|-----------|-------|-----------|
| `RAMP_TIME` | 0.1s | Tempo geral de rampa |
| `RAMP_TIMESTEP` | 0.01s | Passo de tempo da rampa |
| `ATTACK_TIME` | 0.035s | Duração do ataque |
| `HOLD_TIME` | 0.25s | Duração da sustentação |
| `RELEASE_TIME` | 0.035s | Duração da liberação |
| `PLAY_GAP_TIME` | 0.7s | Gap entre intervalos |
| `PLAYER_STOP_DELAY` | 0.04s | Delay pós-stop |

### Parâmetros de Pulso

| Constante | Valor | Descrição |
|-----------|-------|-----------|
| `NUM_OF_PULSE_ADULT` | 3 | Pulsos por intervalo (adulto) |
| `PULSE_TIME_ADULT` | 0.37s | Gap inter-pulso (adulto) |
| `NUM_OF_PULSE_CHILDREN` | 2 | Pulsos por intervalo (infantil) |
| `PULSE_TIME_CHILDREN` | 0.5s | Gap inter-pulso (infantil) |
| `ANIMATE_SCALE` | 0.8 | Fator de escala da animação visual |

### Parâmetros do Algoritmo

| Constante | Valor | Descrição |
|-----------|-------|-----------|
| `STEP_INITIAL_DOWN` | 20 dB | Fase inicial: passo de descida (correto) |
| `STEP_INITIAL_UP` | 20 dB | Fase inicial: passo de subida (incorreto) |
| `STEP_FINE_DOWN` | 10 dB | Fase fina: passo de descida (correto) |
| `STEP_FINE_UP` | 5 dB | Fase fina: passo de subida (incorreto) |
| `MAX_FAILURES_AT_MAX` | 3 | Falhas no máximo antes de NR |
| `SPAM_THRESHOLD` | 5 | Limite de respostas consecutivas idênticas |

### Tabelas Configuráveis

| Tabela | Descrição |
|--------|-----------|
| `DEFAULT_EXPECTED_LEVELS` | Valores RETSPL por frequência |
| `DEFAULT_PRESENTATION_LEVELS` | Níveis de apresentação padrão por frequência |
| `Z_FACTORS` | Fatores de correção de frequência para modo infantil (atualmente todos 0, configurável) |

---

## Desenvolvimento

### Pré-requisitos

- Node.js 18+ ou Bun
- Projeto Lovable Cloud (auto-configurado)

### Instalar e Executar

```bash
npm install    # ou bun install
npm run dev    # inicia servidor Vite
```

### Testes

```bash
npm run test         # Testes unitários Vitest
npx playwright test  # Testes E2E
```

### Lint

```bash
npm run lint
```

---

## Deploy

A aplicação é publicada pelo sistema de deploy integrado do Lovable:

- **Frontend**: Clique em "Publish" → "Update" no editor Lovable
- **Backend** (banco de dados, edge functions): Deploy automático a cada mudança
- **URL publicada**: `https://audible-rebuild-project.lovable.app`

---

*Documentação atualizada em 18/03/2026 — Audiometry Screener v2.0*
