# Aud·It — Documentação Completa do Protótipo

> Aplicação web de teste auditivo otimizada para tablet em modo paisagem.

---

## 1. Visão Geral

**Aud·It** é um aplicativo de audiometria tonal que permite configurar protocolos de teste, executar sessões de avaliação auditiva (modo adulto e infantil), calibrar equipamentos e visualizar resultados em audiogramas.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Recharts · shadcn/ui

---

## 2. Estrutura de Páginas

| Rota | Página | Descrição |
|---|---|---|
| `/` | `Index.tsx` | Tela inicial com logo e navegação principal |
| `/protocol` | `ProtocolSetupPage.tsx` | Configuração do protocolo de teste |
| `/test` | `TestPage.tsx` | Interface de prática/teste auditivo |
| `/calibration` | `CalibrationPage.tsx` | Calibração de equipamento |
| `/results` | `ResultsPage.tsx` | Visualização de resultados e audiogramas |

---

## 3. Módulos e Funcionalidades

### 3.1 Tela Inicial (`/`)

- Logo "Aud·It" centralizado
- 4 botões de navegação:
  - **Start** → `/protocol`
  - **Practice** → `/test` (usa frequências padrão: 250, 1000, 2000, 4000, 8000 Hz)
  - **Calibration** → `/calibration`
  - **View Results** → `/results`

### 3.2 Configuração de Protocolo (`/protocol`)

#### Elementos:
- **Grade de frequências:** 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000 Hz
- **Sequência de teste:** exibe frequências selecionadas em ordem (ex: `3000 Hz ► 4000 Hz ► 6000 Hz`)
- **Ordem de orelhas:** L. Ear Only | R. Ear Only | L. Ear → R. Ear | R. Ear → L. Ear
- **Idioma:** English | Portuguese
- **Modo:** Adult Test | Children Test

#### Ações:
| Botão | Função |
|---|---|
| Remove Last | Remove a última frequência da sequência |
| Clear All | Limpa todas as frequências |
| Save Protocol | Abre popup para salvar (grupo + nome do paciente) |
| Load Protocol | Abre popup para carregar protocolo salvo |
| Delete Current Protocol | Remove protocolo que corresponde à sequência atual |
| Adult Test | Define modo adulto e navega para `/test` |
| Children Test | Define modo infantil e navega para `/test` |

#### Validações:
- Tentativa de salvar ou iniciar teste sem frequência selecionada exibe popup: **"There is no frequency selected!"**

#### Popups:
1. **Erro** — "There is no frequency selected!" + botão Confirm
2. **Load Protocol** — "Select a different setting" + lista de protocolos salvos + Cancel/Confirm
3. **Save Protocol** — campos Patient's Group e Patient's Name + Cancel/Confirm

### 3.3 Teste / Prática (`/test`)

#### Layout (3 colunas):
- **Esquerda:** instrução textual — *"Please tap the shape that makes sounds, or tap 'No Sound' if you don't hear any sound"*
- **Centro:** 2 estímulos visuais empilhados + botão "Start Testing!"
- **Direita:** botão "No Sound" (semi-circular) + botão "Pause"

#### Estímulos Visuais:
| Modo | Visual |
|---|---|
| Adult | Trapézio roxo (`clip-path`), Retângulo laranja, Oval verde — alternados por rodada |
| Children | Emoji ilustrativo (🕊️) |

#### Fluxo de Simulação:
1. Usuário toca **Start Testing!**
2. Sistema escolhe aleatoriamente `correctTarget`: `"top"`, `"bottom"` ou `"no_sound"`
3. Usuário responde tocando forma superior, inferior ou "No Sound"
4. Resposta correta = acerto; incorreta = erro
5. Avança para próxima frequência da sequência
6. Ao completar todas as frequências, gera `HearingResult` e salva no paciente selecionado
7. **Test Progress** atualiza em porcentagem

#### Controles:
| Botão | Função |
|---|---|
| Start Testing! | Inicia sequência de teste |
| No Sound | Responde que não ouviu som |
| Pause / Resume | Pausa/retoma o teste |
| Repeat | Reapresenta a rodada atual |
| Protocol Setup | Navega para `/protocol` |
| Return to Title | Navega para `/` |

### 3.4 Calibração (`/calibration`)

#### Tabela por frequência (10 colunas: 250–8000 Hz):
| Linha | Editável |
|---|---|
| Expected Sound Pressure Level for 70 dB HL (dB SPL) | ❌ Somente leitura |
| Presentation Level (dBHL) | ✅ |
| Left Measured Level for 70 dB HL (dB SPL) | ✅ |
| Right Measured Level for 70 dB HL (dB SPL) | ✅ |

#### Toggle On/Off por frequência

#### Ações:
| Botão | Função |
|---|---|
| Set Volume | (placeholder — futuro hardware) |
| Load Default P. Level | Restaura valores padrão de apresentação |
| Clear Measured Level | Zera Left/Right Measured para 0 |
| Save as New | (placeholder) |
| Save to Current | (placeholder) |
| Load Other | (placeholder) |
| Delete Current | (placeholder) |

#### Indicador: `Current Setting: [nome do perfil]`

### 3.5 Resultados (`/results`)

#### Layout (2 colunas):
- **Esquerda:** botão "Export All Patient Data" + lista de pacientes
- **Direita:** resumo textual + 2 audiogramas (Left / Right) + botões de exclusão

#### Resumo textual:
- `Current Frequency: X Hz`
- `dB Threshold: (L) X (R) X`
- `Reliability: (L) X/X (R) X/X`

#### Audiogramas:
- **Painel superior (azul claro):** orelha esquerda — linha azul
- **Painel inferior (rosa claro):** orelha direita — linha vermelha
- Eixo X: frequência (Hz) | Eixo Y: nível (dB)
- Sem dados: exibe *"No chart data available."*

#### Ações:
| Botão | Função |
|---|---|
| Export All Patient Data | (placeholder) |
| Delete All Patient Profiles | (placeholder) |
| Delete Current Patient Profile | (placeholder) |

---

## 4. Estrutura de Dados

### Tipos (`src/types/audit.ts`)

```typescript
type AppLanguage = "English" | "Portuguese";
type TestMode = "adult" | "children";
type EarOrder = "L. Ear Only" | "R. Ear Only" | "L. Ear -> R. Ear" | "R. Ear -> L. Ear";

interface Protocol {
  id: string;
  patientGroup: string;
  patientName: string;
  frequencies: number[];
  earOrder: EarOrder;
  language: AppLanguage;
  mode: TestMode;
}

interface CalibrationRow {
  frequency: number;
  expected: number;
  presentation: number;
  leftMeasured: number;
  rightMeasured: number;
  enabled: boolean;
}

interface CalibrationProfile {
  id: string;
  name: string;
  rows: CalibrationRow[];
}

interface HearingResult {
  id: string;
  frequencySummary: string;
  thresholdSummary: string;
  reliabilitySummary: string;
  points: { frequency: number; left: number; right: number }[];
}

interface Patient {
  id: string;
  name: string;
  group: string;
  results: HearingResult[];
}

interface TestRound {
  frequency: number;
  visual: "trapezoid" | "rectangle" | "oval" | "illustrated";
  correctTarget: "top" | "bottom" | "no_sound";
}
```

### Entidades para futura persistência (DB):
| Entidade | Descrição |
|---|---|
| `patients` | Dados do paciente (nome, grupo) |
| `protocols` | Protocolos salvos com configurações |
| `calibration_profiles` | Perfis de calibração com valores por frequência |
| `hearing_results` | Resultados de sessões de teste |
| `result_points` | Pontos individuais do audiograma (freq, left, right) |

---

## 5. Gerenciamento de Estado

Centralizado em `src/context/AuditContext.tsx` via React Context + `useMemo`.

### Estado Global:
| Campo | Tipo | Descrição |
|---|---|---|
| `language` | `AppLanguage` | Idioma da interface |
| `mode` | `TestMode` | Modo adulto ou infantil |
| `earOrder` | `EarOrder` | Ordem de teste das orelhas |
| `selectedFrequencies` | `number[]` | Frequências selecionadas no protocolo |
| `protocols` | `Protocol[]` | Protocolos salvos |
| `calibrationProfiles` | `CalibrationProfile[]` | Perfis de calibração |
| `selectedCalibrationId` | `string` | Perfil de calibração ativo |
| `patients` | `Patient[]` | Lista de pacientes com resultados |
| `selectedPatientId` | `string` | Paciente selecionado |
| `currentRound` | `TestRound \| null` | Rodada atual do teste |
| `progress` | `number` | Progresso do teste (0-100%) |
| `isTesting` | `boolean` | Teste em andamento |
| `isPaused` | `boolean` | Teste pausado |

### Ações disponíveis:
| Ação | Descrição |
|---|---|
| `toggleFrequency(freq)` | Adiciona/remove frequência da sequência |
| `removeLastFrequency()` | Remove última frequência |
| `clearFrequencies()` | Limpa toda a sequência |
| `setLanguage(lang)` | Altera idioma |
| `setMode(mode)` | Altera modo (adult/children) |
| `setEarOrder(order)` | Altera ordem de orelhas |
| `saveProtocol(group, name)` | Salva protocolo atual |
| `loadProtocol(id)` | Carrega protocolo salvo |
| `deleteCurrentProtocol()` | Remove protocolo correspondente |
| `updateCalibrationValue(freq, key, value)` | Edita valor de calibração |
| `toggleCalibrationEnabled(freq)` | Liga/desliga frequência na calibração |
| `clearMeasuredLevels()` | Zera níveis medidos |
| `loadDefaultPresentation()` | Restaura valores padrão |
| `startTesting()` | Inicia sessão de teste |
| `pauseTesting()` | Pausa/retoma teste |
| `repeatRound()` | Repete rodada atual |
| `respondToRound(target)` | Registra resposta do usuário |

---

## 6. Fluxos de Navegação

```
┌─────────────┐
│   Home (/)   │
└──┬──┬──┬──┬─┘
   │  │  │  │
   │  │  │  └──► /results      (View Results)
   │  │  └─────► /calibration  (Calibration)
   │  └────────► /test          (Practice — frequências padrão)
   └───────────► /protocol      (Start — configuração)
                     │
                     └──► /test  (Adult Test / Children Test)
```

### Fluxo Principal:
1. Home → **Start** → Protocol Setup
2. Selecionar frequências → configurar orelha/idioma/modo
3. (Opcional) Save Protocol
4. **Adult Test** ou **Children Test** → Test Page
5. **Start Testing!** → responder rodadas → resultado salvo automaticamente
6. **Return to Title** → Home
7. **View Results** → audiogramas do paciente

---

## 7. Design System

### Cores semânticas (HSL):
| Token | Valor | Uso |
|---|---|---|
| `--background` | `210 20% 96%` | Fundo geral |
| `--foreground` | `222 47% 11%` | Texto principal |
| `--primary` | `217 91% 55%` | Botões principais (azul) |
| `--destructive` | `0 84% 60%` | Ações destrutivas (vermelho) |
| `--stimulus-purple` | `274 71% 56%` | Trapézio (teste) |
| `--stimulus-orange` | `24 95% 53%` | Retângulo (teste) |
| `--stimulus-green` | `142 76% 37%` | Oval (teste) |
| `--panel-left` | `199 85% 85%` | Audiograma esquerdo |
| `--panel-right` | `0 77% 87%` | Audiograma direito |

### Tipografia:
- **Corpo:** system sans-serif
- **Dados/números:** JetBrains Mono (`.font-data`)

### Tamanhos de botão:
| Variant | Classe | Uso |
|---|---|---|
| `tablet` | `h-20 px-10 text-4xl` | Botões de ação principal |
| `touch` | `h-16 px-8 text-3xl` | Botões de toque em grids |

### Variantes de botão:
| Variant | Uso |
|---|---|
| `default` | Ação principal (azul) |
| `secondary` | Ação secundária (cinza) |
| `destructive` | Exclusão (vermelho) |
| `warning` | Atenção (amarelo) — ex: Repeat |
| `success` | Positivo (verde) — ex: Pause |

---

## 8. Componentes Reutilizáveis

| Componente | Origem | Uso |
|---|---|---|
| `Button` | shadcn/ui customizado | Todas as telas |
| `Input` | shadcn/ui | Calibração, Save Protocol |
| `Dialog` | shadcn/ui | Popups de erro, load, save |
| `NavLink` | Custom | (disponível para navegação) |
| `LineChart` | Recharts | Audiogramas em Results |

---

## 9. Dados Mock Iniciais

### Pacientes pré-carregados:
| ID | Nome | Grupo | Resultados |
|---|---|---|---|
| `p-1` | `[church] p07` | Adult | 1 resultado com 5 pontos |
| `p-2` | `[aa] rr` | Adult | Sem resultados |

### Perfil de calibração padrão:
- Nome: `phonne`
- 10 frequências com valores Expected, Presentation, Left/Right Measured
- Todas as frequências iniciam desabilitadas (`enabled: false`)

---

## 10. Requisitos Não-Funcionais

| Requisito | Status |
|---|---|
| Otimizado para tablet landscape | ✅ |
| Botões touch-friendly (≥ 48px) | ✅ |
| Estado gerenciado via Context API | ✅ |
| Preparado para exportação GitHub | ✅ |
| Estrutura para migração Android/Kotlin | ✅ (separação clara de lógica/UI) |
| Persistência via DB | 🔲 Preparado (atualmente in-memory) |
| Hardware auditivo real | 🔲 Modo simulado implementado |
| Internacionalização completa | 🔲 Estrutura pronta (toggle existe) |

---

## 11. Inferências e Decisões

| Ambiguidade | Decisão adotada |
|---|---|
| Algoritmo de threshold real | Simulação simplificada com acerto/erro |
| Cálculo de dB por orelha | Valores gerados proporcionalmente ao índice da frequência |
| Reliability | Calculada como razão de acertos sobre total de respostas |
| Interação com audiograma | Somente visualização (sem toque nos pontos) |
| Hardware de áudio | Substituído por escolha aleatória de target |
| "Set Volume" na calibração | Placeholder sem funcionalidade |
| Export/Delete em Results | Placeholders sem funcionalidade |

---

## 12. Estrutura de Arquivos

```
src/
├── App.tsx                          # Rotas e providers
├── main.tsx                         # Entry point
├── index.css                        # Design tokens + utilitários
├── context/
│   └── AuditContext.tsx             # Estado global (322 linhas)
├── types/
│   └── audit.ts                     # Tipos TypeScript
├── pages/
│   ├── Index.tsx                    # Home
│   ├── ProtocolSetupPage.tsx        # Configuração de protocolo
│   ├── TestPage.tsx                 # Interface de teste
│   ├── CalibrationPage.tsx          # Calibração
│   ├── ResultsPage.tsx             # Resultados e audiogramas
│   └── NotFound.tsx                # 404
├── components/
│   ├── NavLink.tsx                  # Link de navegação
│   └── ui/                         # shadcn/ui components
└── hooks/
    ├── use-mobile.tsx
    └── use-toast.ts
```

---

*Documento gerado em 13/03/2026 — Protótipo Aud·It v1.0*
