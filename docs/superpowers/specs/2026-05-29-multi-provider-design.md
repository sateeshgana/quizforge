# Multi-Provider Free AI Integration — Design Spec

**Date:** 2026-05-29
**Status:** Approved

## Goal

Expand QuizForge's model selector from 4 models (Groq + broken Gemini) to 8 fully-free models across two providers — Groq (direct, lowest latency) and OpenRouter (single key, 50+ free model catalog). Drop Gemini. Target audience: students and researchers who need zero-cost, reliable AI study tools.

## Model Lineup

| # | Provider | Model ID | Display Name | Badge | Context |
|---|---|---|---|---|---|
| 1 | Groq | `llama-3.1-8b-instant` | Llama 3.1 8B | ⚡ Fastest | 8k |
| 2 | Groq | `llama-3.3-70b-versatile` | Llama 3.3 70B | 🧠 Best Quality | 128k |
| 3 | OpenRouter | `qwen/qwen-2.5-72b-instruct:free` | Qwen 2.5 72B | 🆓 Smart | 32k |
| 4 | OpenRouter | `mistralai/mistral-7b-instruct:free` | Mistral 7B | 🆓 Fast | 32k |
| 5 | OpenRouter | `google/gemma-2-9b-it:free` | Gemma 2 9B | 🆓 Google AI | 8k |
| 6 | OpenRouter | `deepseek/deepseek-r1-distill-llama-70b:free` | DeepSeek R1 70B | 🆓 Reasoning | 32k |
| 7 | OpenRouter | `meta-llama/llama-3.1-8b-instruct:free` | Llama 3.1 8B | 🆓 Open Source | 32k |
| 8 | OpenRouter | `microsoft/phi-3-mini-128k-instruct:free` | Phi-3 Mini | 🆓 Long Context | 128k |

Default model: `llama-3.1-8b-instant` (Groq, fastest).

## Architecture

### Provider Routing

```
POST /api/generate-study { text, model }
         ↓
   resolveModelConfig(model) → Model object
         ↓
   model.provider === 'groq'       → generateWithGroq()
   model.provider === 'openrouter' → generateWithOpenRouter()
```

### Groq (unchanged)
- SDK: `groq-sdk`
- Env: `GROQ_API_KEY`
- JSON mode: `response_format: { type: 'json_object' }`

### OpenRouter (new)
- No extra SDK — plain `fetch` to `https://openrouter.ai/api/v1/chat/completions`
- Env: `OPENROUTER_API_KEY`
- Required headers: `HTTP-Referer: https://quizforge.netlify.app`, `X-Title: QuizForge`
- JSON mode: `response_format: { type: 'json_object' }` (supported by all listed models)
- Error: throw with `data.error?.message` if response not ok

### Gemini — Removed
- Delete `generateWithGemini()`, remove `@google/generative-ai` import
- Remove `GEMINI_API_KEY` from `.env.example`
- Remove `gemini-*` model IDs from `src/models.ts`

## Data Layer Changes

### `src/models.ts`

Add `resolveModelConfig(modelId?: string): Model` that returns the full `Model` object (so the handler can read `provider` directly). Keep existing `resolveModel()` for backward compatibility with tests.

```ts
export function resolveModelConfig(model?: string): Model {
  return MODELS.find((m) => m.id === model) ?? MODELS[0]
}

export function resolveModel(model?: string): string {
  return resolveModelConfig(model).id
}
```

## UI Changes

### `ModelSelector` — Grouped Scrollable List

Replace the 2×2 card grid with a grouped list. Layout:

```
┌─────────────────────────────────────────┐
│ Choose model                            │
│                                         │
│  — Groq —————————————————————          │
│  ● Llama 3.1 8B    8k  ⚡ Fastest      │  ← selected (sky left-border + bg)
│    Llama 3.3 70B  128k 🧠 Best Quality │
│                                         │
│  — OpenRouter (free) —————————         │
│    Qwen 2.5 72B    32k 🆓 Smart        │
│    Mistral 7B      32k 🆓 Fast         │
│    Gemma 2 9B       8k 🆓 Google AI    │
│    DeepSeek R1     32k 🆓 Reasoning    │
│    Llama 3.1 8B    32k 🆓 Open Source  │
│    Phi-3 Mini     128k 🆓 Long Context │
└─────────────────────────────────────────┘
```

- Each row: compact `button` with `role="radio"` and `aria-checked`
- Selected: left `border-l-4 border-sky-500 bg-sky-50` accent
- Groups: `<div role="group">` with a small `<p>` label (gray, uppercase, text-xs)
- Container: `max-h-72 overflow-y-auto` so it scrolls without pushing the generate button off screen
- No 2×2 grid — single column list

## Files Changed

| Action | File | Change |
|---|---|---|
| Modify | `src/models.ts` | Replace Gemini models with 6 OpenRouter models; add `resolveModelConfig()` |
| Modify | `netlify/functions/generate-study.mts` | Remove Gemini; add `generateWithOpenRouter()`; route by `provider` |
| Modify | `netlify/functions/generate-study.test.ts` | Add tests for `resolveModelConfig()`; update model IDs |
| Modify | `src/components/ModelSelector.tsx` | Replace 2×2 grid with grouped scrollable list |
| Modify | `src/components/ModelSelector.test.tsx` | Update model names/IDs in tests |
| Modify | `.env.example` | Replace `GEMINI_API_KEY` with `OPENROUTER_API_KEY` |

No new npm packages needed — OpenRouter uses plain `fetch`.

## Error Handling

- Missing `OPENROUTER_API_KEY`: throw `'OPENROUTER_API_KEY is not set'`
- OpenRouter non-2xx response: throw `data.error?.message ?? 'OpenRouter request failed'`
- Model quota/rate limit: error surfaces in the existing red error banner in the UI — user switches to a different model

## Out of Scope

- Automatic failover between providers
- Per-user API key input (BYOK)
- OpenRouter model catalog browsing (curated list only)
- Cerebras / SambaNova / other providers
