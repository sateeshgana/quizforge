# Multi-Provider Free AI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken Gemini integration with OpenRouter (6 free models) and keep Groq (2 direct models), giving students and researchers 8 free model choices in a grouped scrollable list.

**Architecture:** `src/models.ts` holds all 8 model configs with `provider: 'groq' | 'openrouter'`; `generate-study.mts` routes by provider — Groq SDK for Groq models, plain `fetch` to OpenRouter API for the rest; `ModelSelector` becomes a grouped scrollable list with two sections.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest + Testing Library, Groq SDK, OpenRouter REST API (no extra package — plain fetch)

---

## File Map

| Action | Path | Change |
|---|---|---|
| Modify | `src/models.ts` | 8 models, `'openrouter'` provider union, add `resolveModelConfig()` |
| Modify | `netlify/functions/generate-study.mts` | Remove Gemini; add `generateWithOpenRouter`; route by `modelConfig.provider` |
| Modify | `netlify/functions/generate-study.test.ts` | Add `resolveModelConfig` tests; update imports |
| Modify | `src/components/ModelSelector.tsx` | Replace 2×2 grid with grouped scrollable list |
| Modify | `src/components/ModelSelector.test.tsx` | Update model names; add group header test |
| Modify | `.env.example` | Replace `GEMINI_API_KEY` with `OPENROUTER_API_KEY` |

---

## Task 1: Update model constants

**Files:**
- Modify: `src/models.ts`

- [ ] **Step 1: Replace the file contents**

```ts
export interface Model {
  id: string
  name: string
  badge: string
  context: string
  description: string
  provider: 'groq' | 'openrouter'
}

export const MODELS: Model[] = [
  { id: 'llama-3.1-8b-instant',                        name: 'Llama 3.1 8B',      badge: '⚡ Fastest',      context: '8k',   description: 'Best for quick results',    provider: 'groq'        },
  { id: 'llama-3.3-70b-versatile',                     name: 'Llama 3.3 70B',     badge: '🧠 Best Quality',  context: '128k', description: 'Most accurate study sets',  provider: 'groq'        },
  { id: 'qwen/qwen-2.5-72b-instruct:free',             name: 'Qwen 2.5 72B',      badge: '🆓 Smart',         context: '32k',  description: 'Strong reasoning, free',    provider: 'openrouter'  },
  { id: 'mistralai/mistral-7b-instruct:free',          name: 'Mistral 7B',        badge: '🆓 Fast',          context: '32k',  description: 'European AI, efficient',    provider: 'openrouter'  },
  { id: 'google/gemma-2-9b-it:free',                   name: 'Gemma 2 9B',        badge: '🆓 Google AI',     context: '8k',   description: 'Google open model',         provider: 'openrouter'  },
  { id: 'deepseek/deepseek-r1-distill-llama-70b:free', name: 'DeepSeek R1 70B',   badge: '🆓 Reasoning',     context: '32k',  description: 'Deep reasoning model',      provider: 'openrouter'  },
  { id: 'meta-llama/llama-3.1-8b-instruct:free',       name: 'Llama 3.1 8B',      badge: '🆓 Open Source',   context: '32k',  description: 'Meta open source model',    provider: 'openrouter'  },
  { id: 'microsoft/phi-3-mini-128k-instruct:free',     name: 'Phi-3 Mini',        badge: '🆓 Long Context',  context: '128k', description: 'Huge context window',       provider: 'openrouter'  },
]

export const DEFAULT_MODEL = MODELS[0].id

export function resolveModelConfig(model?: string): Model {
  return MODELS.find((m) => m.id === model) ?? MODELS[0]
}

export function resolveModel(model?: string): string {
  return resolveModelConfig(model).id
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/models.ts
git commit -m "feat: expand to 8 free models across Groq and OpenRouter"
```

---

## Task 2: Update backend — remove Gemini, add OpenRouter

**Files:**
- Modify: `netlify/functions/generate-study.test.ts`
- Modify: `netlify/functions/generate-study.mts`

- [ ] **Step 1: Write failing tests for `resolveModelConfig`**

Add to `netlify/functions/generate-study.test.ts` (keep all existing tests, add this block):

```ts
import { buildStudyPrompt, parseStudyResponse, resolveModel, resolveModelConfig } from './generate-study.mts'
import { DEFAULT_MODEL } from '../../src/models.ts'

// ... existing describe blocks unchanged ...

describe('resolveModelConfig', () => {
  it('returns the full Model object for a valid Groq id', () => {
    const result = resolveModelConfig('llama-3.3-70b-versatile')
    expect(result.id).toBe('llama-3.3-70b-versatile')
    expect(result.provider).toBe('groq')
  })

  it('returns the full Model object for a valid OpenRouter id', () => {
    const result = resolveModelConfig('qwen/qwen-2.5-72b-instruct:free')
    expect(result.id).toBe('qwen/qwen-2.5-72b-instruct:free')
    expect(result.provider).toBe('openrouter')
  })

  it('falls back to MODELS[0] when model is undefined', () => {
    const result = resolveModelConfig(undefined)
    expect(result.id).toBe(DEFAULT_MODEL)
  })

  it('falls back to MODELS[0] when model id is unrecognised', () => {
    const result = resolveModelConfig('gpt-4')
    expect(result.id).toBe(DEFAULT_MODEL)
  })
})
```

Full updated `netlify/functions/generate-study.test.ts`:

```ts
import { buildStudyPrompt, parseStudyResponse, resolveModel, resolveModelConfig } from './generate-study.mts'
import { DEFAULT_MODEL } from '../../src/models.ts'

describe('buildStudyPrompt', () => {
  it('includes the source text in the prompt', () => {
    const prompt = buildStudyPrompt('Newton discovered gravity')
    expect(prompt).toContain('Newton discovered gravity')
  })

  it('asks for flashcards, quiz, and summary', () => {
    const prompt = buildStudyPrompt('some text')
    expect(prompt.toLowerCase()).toContain('flashcard')
    expect(prompt.toLowerCase()).toContain('quiz')
    expect(prompt.toLowerCase()).toContain('summary')
  })
})

describe('parseStudyResponse', () => {
  it('parses valid JSON into StudySet', () => {
    const raw = JSON.stringify({
      flashcards: [{ front: 'Q', back: 'A' }],
      quiz: [{
        question: 'What?',
        options: ['A option', 'B option', 'C option', 'D option'],
        answer: 'A',
        explanation: 'Because A',
      }],
      summary: ['Point one', 'Point two'],
    })
    const result = parseStudyResponse(raw)
    expect(result.flashcards[0].front).toBe('Q')
    expect(result.quiz[0].answer).toBe('A')
    expect(result.summary).toHaveLength(2)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseStudyResponse('not json')).toThrow()
  })
})

describe('resolveModel', () => {
  it('returns a valid model id unchanged', () => {
    expect(resolveModel('llama-3.3-70b-versatile')).toBe('llama-3.3-70b-versatile')
  })

  it('falls back to DEFAULT_MODEL when model is undefined', () => {
    expect(resolveModel(undefined)).toBe(DEFAULT_MODEL)
  })

  it('falls back to DEFAULT_MODEL when model id is not in MODELS list', () => {
    expect(resolveModel('gpt-4-turbo')).toBe(DEFAULT_MODEL)
  })
})

describe('resolveModelConfig', () => {
  it('returns the full Model object for a valid Groq id', () => {
    const result = resolveModelConfig('llama-3.3-70b-versatile')
    expect(result.id).toBe('llama-3.3-70b-versatile')
    expect(result.provider).toBe('groq')
  })

  it('returns the full Model object for a valid OpenRouter id', () => {
    const result = resolveModelConfig('qwen/qwen-2.5-72b-instruct:free')
    expect(result.id).toBe('qwen/qwen-2.5-72b-instruct:free')
    expect(result.provider).toBe('openrouter')
  })

  it('falls back to MODELS[0] when model is undefined', () => {
    const result = resolveModelConfig(undefined)
    expect(result.id).toBe(DEFAULT_MODEL)
  })

  it('falls back to MODELS[0] when model id is unrecognised', () => {
    const result = resolveModelConfig('gpt-4')
    expect(result.id).toBe(DEFAULT_MODEL)
  })
})
```

- [ ] **Step 2: Run tests to confirm `resolveModelConfig` tests fail**

Run: `npm test`
Expected: FAIL — `resolveModelConfig is not exported from generate-study.mts`

- [ ] **Step 3: Replace `generate-study.mts`**

```ts
import Groq from 'groq-sdk'
import { randomUUID } from 'crypto'
import type { StudySet } from '../../src/types'

export { resolveModel, resolveModelConfig } from '../../src/models'
import { resolveModelConfig } from '../../src/models'

export function buildStudyPrompt(text: string): string {
  return `You are a study assistant. Given the following text, generate study materials in JSON format.

Text:
"""
${text}
"""

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "flashcards": [
    { "front": "question or term", "back": "answer or definition" }
  ],
  "quiz": [
    {
      "question": "multiple choice question",
      "options": ["A option text", "B option text", "C option text", "D option text"],
      "answer": "A",
      "explanation": "brief explanation of why this is correct"
    }
  ],
  "summary": ["key point 1", "key point 2", "key point 3"]
}

Requirements:
- Generate exactly 10 flashcards
- Generate exactly 5 quiz questions with 4 options each
- Generate 3–5 summary bullet points
- answer must be exactly one of: "A", "B", "C", or "D"
`
}

export function parseStudyResponse(raw: string): StudySet {
  const json = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  const parsed = JSON.parse(json)

  return {
    flashcards: parsed.flashcards.map((f: { front: string; back: string }) => ({
      id: randomUUID(),
      front: f.front,
      back: f.back,
    })),
    quiz: parsed.quiz.map((q: {
      question: string
      options: [string, string, string, string]
      answer: string
      explanation: string
    }) => ({
      id: randomUUID(),
      question: q.question,
      options: q.options as [string, string, string, string],
      answer: q.answer as 'A' | 'B' | 'C' | 'D',
      explanation: q.explanation,
    })),
    summary: parsed.summary as string[],
  }
}

async function generateWithGroq(text: string, modelId: string): Promise<StudySet> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const completion = await groq.chat.completions.create({
    model: modelId,
    messages: [{ role: 'user', content: buildStudyPrompt(text) }],
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  })
  return parseStudyResponse(completion.choices[0]?.message?.content ?? '{}')
}

async function generateWithOpenRouter(text: string, modelId: string): Promise<StudySet> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set. Add it to your .env file.')
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://quizforge.netlify.app',
      'X-Title': 'QuizForge',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: buildStudyPrompt(text) }],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    }),
  })
  const data = await response.json() as {
    choices?: Array<{ message: { content: string } }>
    error?: { message: string }
  }
  if (!response.ok) throw new Error(data.error?.message ?? 'OpenRouter request failed')
  return parseStudyResponse(data.choices?.[0]?.message?.content ?? '{}')
}

export default async (req: Request) => {
  if (req.method !== 'POST')
    return new Response('Method Not Allowed', { status: 405 })

  let body: { text?: string; model?: string }
  try { body = await req.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }) }

  const { text, model } = body
  if (!text || text.trim().length < 50)
    return new Response(JSON.stringify({ error: 'text must be at least 50 characters' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })

  try {
    const modelConfig = resolveModelConfig(model)
    const studySet = modelConfig.provider === 'openrouter'
      ? await generateWithOpenRouter(text, modelConfig.id)
      : await generateWithGroq(text, modelConfig.id)

    return new Response(JSON.stringify(studySet), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = { path: '/api/generate-study' }
```

- [ ] **Step 4: Run all tests to confirm they pass**

Run: `npm test`
Expected: all tests PASS including the 4 new `resolveModelConfig` tests

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/generate-study.mts netlify/functions/generate-study.test.ts
git commit -m "feat: replace Gemini with OpenRouter, route by provider"
```

---

## Task 3: Redesign ModelSelector as grouped scrollable list

**Files:**
- Modify: `src/components/ModelSelector.test.tsx`
- Modify: `src/components/ModelSelector.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/components/ModelSelector.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ModelSelector } from './ModelSelector'
import { MODELS } from '../models'

describe('ModelSelector', () => {
  it('renders all eight model names', () => {
    render(<ModelSelector selected={MODELS[0].id} onChange={vi.fn()} />)
    MODELS.forEach((m) => expect(screen.getByText(m.name)).toBeInTheDocument())
  })

  it('renders provider group headers', () => {
    render(<ModelSelector selected={MODELS[0].id} onChange={vi.fn()} />)
    expect(screen.getByText('Groq')).toBeInTheDocument()
    expect(screen.getByText(/OpenRouter/i)).toBeInTheDocument()
  })

  it('marks only the selected model as aria-checked true', () => {
    render(<ModelSelector selected={MODELS[1].id} onChange={vi.fn()} />)
    const radios = screen.getAllByRole('radio')
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with the model id when a row is clicked', async () => {
    const onChange = vi.fn()
    render(<ModelSelector selected={MODELS[0].id} onChange={onChange} />)
    await userEvent.click(screen.getByText('Qwen 2.5 72B'))
    expect(onChange).toHaveBeenCalledWith('qwen/qwen-2.5-72b-instruct:free')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npm test`
Expected: FAIL — "Groq" group header not found; model names for OpenRouter models not found

- [ ] **Step 3: Replace `ModelSelector.tsx`**

```tsx
import { MODELS } from '../models'
import type { Model } from '../models'

interface Props {
  selected: string
  onChange: (id: string) => void
}

function ModelRow({ m, isSelected, onChange }: { m: Model; isSelected: boolean; onChange: (id: string) => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected ? 'true' : 'false'}
      onClick={() => onChange(m.id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all border-l-4 ${
        isSelected
          ? 'border-sky-500 bg-sky-50 text-sky-800'
          : 'border-transparent text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className="text-xs font-semibold w-28 flex-shrink-0">{m.badge}</span>
      <span className="font-medium flex-1">{m.name}</span>
      <span className="text-xs text-gray-400 flex-shrink-0">{m.context}</span>
    </button>
  )
}

export function ModelSelector({ selected, onChange }: Props) {
  const groqModels = MODELS.filter((m) => m.provider === 'groq')
  const openrouterModels = MODELS.filter((m) => m.provider === 'openrouter')

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500 font-medium">Choose model</span>
      <div
        className="max-h-64 overflow-y-auto flex flex-col gap-2 border border-gray-200 rounded-xl bg-white p-2 shadow-sm"
        role="radiogroup"
        aria-label="Model selection"
      >
        <div role="group">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Groq</p>
          {groqModels.map((m) => (
            <ModelRow key={m.id} m={m} isSelected={m.id === selected} onChange={onChange} />
          ))}
        </div>
        <div role="group">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">OpenRouter (free)</p>
          {openrouterModels.map((m) => (
            <ModelRow key={m.id} m={m} isSelected={m.id === selected} onChange={onChange} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run all tests to confirm they pass**

Run: `npm test`
Expected: all tests PASS including all 4 new `ModelSelector` tests

- [ ] **Step 5: Commit**

```bash
git add src/components/ModelSelector.tsx src/components/ModelSelector.test.tsx
git commit -m "feat: ModelSelector grouped scrollable list with Groq and OpenRouter sections"
```

---

## Task 4: Update env config and type-check

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Update `.env.example`**

Replace the file contents with:

```
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

- [ ] **Step 2: Run full test suite and type-check**

Run: `npm test`
Expected: all tests PASS

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: replace GEMINI_API_KEY with OPENROUTER_API_KEY in env example"
```

---

## Done

All 4 tasks complete. QuizForge now offers 8 free models: 2 via Groq (direct, lowest latency) and 6 via OpenRouter (one key, free tier). The ModelSelector shows them in a grouped scrollable list. Students and researchers can switch models freely when they hit rate limits.

**To use OpenRouter:** get a free key at [openrouter.ai/keys](https://openrouter.ai/keys) and add `OPENROUTER_API_KEY=sk-or-...` to `.env`.
