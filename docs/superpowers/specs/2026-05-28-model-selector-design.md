# Model Selector UI — Design Spec

**Date:** 2026-05-28
**Status:** Approved

## Overview

Add a UI model selector to QuizForge so users can choose from all available free Groq models before generating a study set. The selector appears as a 2×2 radio card grid between the textarea and the Generate button, showing speed/quality badges and context window size per model.

## Models

All models are free-tier on Groq:

| Model ID | Display Name | Badge | Context | Description |
|---|---|---|---|---|
| `llama-3.1-8b-instant` | Llama 3.1 8B | ⚡ Fastest | 8k | Best for quick results |
| `gemma2-9b-it` | Gemma 2 9B | ⚡ Fast | 8k | Strong instruction following |
| `mixtral-8x7b-32768` | Mixtral 8×7B | 📄 Long Context | 32k | Best for large texts |
| `llama-3.3-70b-versatile` | Llama 3.3 70B | 🧠 Best Quality | 128k | Most accurate study sets |

Default: `llama-3.1-8b-instant`

## Architecture

### Data flow

```
App.tsx [selectedModel state]
  → TextInput (renders ModelSelector)
      → onModelChange → App state
  → generate(text, model) → useStudyGenerator
      → POST /api/generate-study { text, model }
          → generate-study.mts reads model, passes to Groq
```

### Files

**New:**
- `src/models.ts` — model config array and `DEFAULT_MODEL` constant
- `src/components/ModelSelector.tsx` — radio card grid component

**Modified:**
- `src/components/TextInput.tsx` — add `selectedModel` + `onModelChange` props; render `ModelSelector` between textarea and button row
- `src/hooks/useStudyGenerator.ts` — `generate(text, model)` signature; passes model in POST body
- `src/App.tsx` — add `selectedModel` state; pass to `TextInput` and `generate()`
- `netlify/functions/generate-study.mts` — read `model` from request body; fall back to `llama-3.1-8b-instant` if absent

## UI Layout

```
┌─────────────────────────────────────────┐
│  [ textarea ]                           │
│                                         │
│  Choose model:                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ ⚡ Fastest    │  │ ⚡ Fast       │    │
│  │ Llama 3.1 8B │  │ Gemma 2 9B   │    │
│  │ 8k · Quick   │  │ 8k · Instruct│    │
│  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ 📄 Long Ctx  │  │ 🧠 Quality   │    │
│  │ Mixtral 8×7B │  │ Llama 3.3 70B│    │
│  │ 32k · Large  │  │128k · Accurate│   │
│  └──────────────┘  └──────────────┘    │
│                                         │
│  42 words          [✨ Generate]        │
└─────────────────────────────────────────┘
```

- Selected card: indigo border + subtle indigo background tint
- Unselected card: gray-800 background, gray-700 border
- Keyboard-navigable as a radio group (role="radiogroup")
- No new npm dependencies — uses existing Tailwind + TypeScript stack

## Component Interface

```ts
// src/models.ts
export type Model = { id: string; name: string; badge: string; context: string; description: string }
export const MODELS: Model[]
export const DEFAULT_MODEL: string

// ModelSelector props
interface ModelSelectorProps {
  selected: string
  onChange: (id: string) => void
}

// TextInput props (additions)
interface TextInputProps {
  // ... existing props
  selectedModel: string
  onModelChange: (id: string) => void
}

// useStudyGenerator
generate(text: string, model: string): Promise<void>

// generate-study.mts request body
{ text: string; model?: string }
```

## Error Handling

- Backend defaults to `llama-3.1-8b-instant` if `model` is missing or unrecognised — prevents breakage from stale clients
- No frontend validation needed beyond existing 20-word minimum

## Out of Scope

- Paid/non-free models
- Persisting model preference across sessions
- Per-model rate limit display
