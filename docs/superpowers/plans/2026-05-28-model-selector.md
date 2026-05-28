# Model Selector UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 2×2 radio card grid below the textarea that lets users pick from four free Groq models before generating a study set.

**Architecture:** A new `src/models.ts` holds model config; a new `ModelSelector` component renders the cards; `TextInput` composes `ModelSelector`; `useStudyGenerator` forwards the chosen model in the POST body; the Netlify function reads `model` from the request body and validates it via a `resolveModel` helper.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest + Testing Library, Groq SDK, Netlify Functions v2

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/models.ts` | Model config array, `DEFAULT_MODEL`, `Model` type |
| Create | `src/components/ModelSelector.tsx` | Radio card grid UI |
| Create | `src/components/ModelSelector.test.tsx` | Component tests |
| Create | `src/components/TextInput.test.tsx` | TextInput integration test |
| Modify | `src/components/TextInput.tsx` | Add `selectedModel` + `onModelChange` props; render `ModelSelector` |
| Modify | `src/hooks/useStudyGenerator.ts` | Add `model` param to `generate()` |
| Modify | `src/hooks/useStudyGenerator.test.ts` | Test model is sent in POST body |
| Modify | `src/App.tsx` | Add `selectedModel` state; pass to `TextInput` and `generate()` |
| Modify | `netlify/functions/generate-study.mts` | Export `resolveModel` helper; read `model` from body |
| Modify | `netlify/functions/generate-study.test.ts` | Test `resolveModel` |

---

## Task 1: Model constants

**Files:**
- Create: `src/models.ts`

- [ ] **Step 1: Create the file**

```ts
// src/models.ts
export interface Model {
  id: string
  name: string
  badge: string
  context: string
  description: string
}

export const MODELS: Model[] = [
  { id: 'llama-3.1-8b-instant',    name: 'Llama 3.1 8B',  badge: '⚡ Fastest',      context: '8k',   description: 'Best for quick results' },
  { id: 'gemma2-9b-it',            name: 'Gemma 2 9B',     badge: '⚡ Fast',          context: '8k',   description: 'Strong instruction following' },
  { id: 'mixtral-8x7b-32768',      name: 'Mixtral 8×7B',   badge: '📄 Long Context', context: '32k',  description: 'Best for large texts' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B',  badge: '🧠 Best Quality', context: '128k', description: 'Most accurate study sets' },
]

export const DEFAULT_MODEL = MODELS[0].id
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/models.ts
git commit -m "feat: add model config constants"
```

---

## Task 2: Backend — accept and validate model param

**Files:**
- Modify: `netlify/functions/generate-study.mts`
- Modify: `netlify/functions/generate-study.test.ts`

- [ ] **Step 1: Write failing tests for `resolveModel`**

Add to `netlify/functions/generate-study.test.ts`:

```ts
import { buildStudyPrompt, parseStudyResponse, resolveModel } from './generate-study.mts'
import { DEFAULT_MODEL } from '../../src/models.ts'

// ... existing tests unchanged ...

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
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npm test`
Expected: FAIL — `resolveModel is not exported`

- [ ] **Step 3: Add `resolveModel` and update the handler**

Replace the handler block in `netlify/functions/generate-study.mts`. The full file after changes:

```ts
import Groq from 'groq-sdk'
import { randomUUID } from 'crypto'
import type { StudySet } from '../../src/types'
import { MODELS, DEFAULT_MODEL } from '../../src/models'

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

export function resolveModel(model?: string): string {
  const validIds = new Set(MODELS.map((m) => m.id))
  return model && validIds.has(model) ? model : DEFAULT_MODEL
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
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: resolveModel(model),
      messages: [{ role: 'user', content: buildStudyPrompt(text) }],
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const studySet = parseStudyResponse(raw)

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

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npm test`
Expected: all tests PASS including the three new `resolveModel` tests

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/generate-study.mts netlify/functions/generate-study.test.ts
git commit -m "feat: backend accepts and validates model param"
```

---

## Task 3: Update `useStudyGenerator` to forward model

**Files:**
- Modify: `src/hooks/useStudyGenerator.ts`
- Modify: `src/hooks/useStudyGenerator.test.ts`

- [ ] **Step 1: Write a failing test**

Add to the `describe('useStudyGenerator')` block in `src/hooks/useStudyGenerator.test.ts`:

```ts
it('sends the chosen model in the request body', async () => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => mockStudySet })
  const { result } = renderHook(() => useStudyGenerator())
  await act(async () => {
    await result.current.generate(
      'some text longer than 50 chars here yes this is long enough',
      'llama-3.3-70b-versatile',
    )
  })
  const body = JSON.parse(mockFetch.mock.calls[0][1].body)
  expect(body.model).toBe('llama-3.3-70b-versatile')
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npm test`
Expected: FAIL — `generate` only accepts one argument; `body.model` is `undefined`

- [ ] **Step 3: Update the hook**

Replace `src/hooks/useStudyGenerator.ts` with:

```ts
import { useState, useCallback } from 'react'
import type { StudySet } from '../types'
import { DEFAULT_MODEL } from '../models'

export function useStudyGenerator() {
  const [studySet,  setStudySet]  = useState<StudySet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const generate = useCallback(async (text: string, model: string = DEFAULT_MODEL) => {
    setIsLoading(true); setError(null); setStudySet(null)
    try {
      const res  = await fetch('/api/generate-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Request failed')
      else         setStudySet(data as StudySet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => { setStudySet(null); setError(null) }, [])

  return { studySet, isLoading, error, generate, reset }
}
```

- [ ] **Step 4: Run all tests to confirm they pass**

Run: `npm test`
Expected: all tests PASS — existing tests still pass because `model` defaults to `DEFAULT_MODEL`

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useStudyGenerator.ts src/hooks/useStudyGenerator.test.ts
git commit -m "feat: useStudyGenerator forwards model to API"
```

---

## Task 4: Create `ModelSelector` component

**Files:**
- Create: `src/components/ModelSelector.tsx`
- Create: `src/components/ModelSelector.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/ModelSelector.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ModelSelector } from './ModelSelector'
import { MODELS } from '../models'

describe('ModelSelector', () => {
  it('renders all four model names', () => {
    render(<ModelSelector selected={MODELS[0].id} onChange={vi.fn()} />)
    MODELS.forEach((m) => expect(screen.getByText(m.name)).toBeInTheDocument())
  })

  it('marks only the selected card as aria-checked true', () => {
    render(<ModelSelector selected={MODELS[1].id} onChange={vi.fn()} />)
    const radios = screen.getAllByRole('radio')
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with the model id when a card is clicked', async () => {
    const onChange = vi.fn()
    render(<ModelSelector selected={MODELS[0].id} onChange={onChange} />)
    await userEvent.click(screen.getByText('Gemma 2 9B'))
    expect(onChange).toHaveBeenCalledWith('gemma2-9b-it')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npm test`
Expected: FAIL — `ModelSelector` does not exist

- [ ] **Step 3: Create the component**

Create `src/components/ModelSelector.tsx`:

```tsx
import { MODELS } from '../models'

interface Props {
  selected: string
  onChange: (id: string) => void
}

export function ModelSelector({ selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-gray-400">Choose model</span>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Model selection">
        {MODELS.map((m) => {
          const isSelected = m.id === selected
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(m.id)}
              className={`flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/40 text-gray-100'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span className="text-xs font-medium text-indigo-400">{m.badge}</span>
              <span className="text-sm font-semibold">{m.name}</span>
              <span className="text-xs text-gray-500">{m.context} · {m.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npm test`
Expected: all tests PASS including all three `ModelSelector` tests

- [ ] **Step 5: Commit**

```bash
git add src/components/ModelSelector.tsx src/components/ModelSelector.test.tsx
git commit -m "feat: add ModelSelector radio card grid component"
```

---

## Task 5: Update `TextInput` to include `ModelSelector`

**Files:**
- Modify: `src/components/TextInput.tsx`
- Create: `src/components/TextInput.test.tsx`

- [ ] **Step 1: Write a failing test**

Create `src/components/TextInput.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { TextInput } from './TextInput'
import { DEFAULT_MODEL, MODELS } from '../models'

describe('TextInput', () => {
  const baseProps = {
    value: '',
    onChange: vi.fn(),
    onGenerate: vi.fn(),
    isLoading: false,
    selectedModel: DEFAULT_MODEL,
    onModelChange: vi.fn(),
  }

  it('renders the model selector with all model names', () => {
    render(<TextInput {...baseProps} />)
    MODELS.forEach((m) => expect(screen.getByText(m.name)).toBeInTheDocument())
  })

  it('disables the generate button when word count is below 20', () => {
    render(<TextInput {...baseProps} value="too short" />)
    expect(screen.getByRole('button', { name: /generate/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npm test`
Expected: FAIL — `TextInput` does not accept `selectedModel` / `onModelChange` props

- [ ] **Step 3: Update `TextInput`**

Replace `src/components/TextInput.tsx` with:

```tsx
import { clsx } from 'clsx'
import { ModelSelector } from './ModelSelector'

interface Props {
  value: string
  onChange: (v: string) => void
  onGenerate: () => void
  isLoading: boolean
  selectedModel: string
  onModelChange: (id: string) => void
}

export function TextInput({ value, onChange, onGenerate, isLoading, selectedModel, onModelChange }: Props) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const canGenerate = wordCount >= 20 && !isLoading

  return (
    <div className="flex flex-col gap-3">
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={10}
        placeholder="Paste your lecture notes, textbook chapter, or any text here…"
        className="w-full rounded-xl bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <ModelSelector selected={selectedModel} onChange={onModelChange} />
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs', wordCount < 20 ? 'text-amber-400' : 'text-gray-500')}>
          {wordCount} words{wordCount < 20 ? ' — need at least 20' : ''}
        </span>
        <button type="button" onClick={onGenerate} disabled={!canGenerate}
          className={clsx('px-5 py-2 rounded-lg text-sm font-medium transition-colors',
            canGenerate ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed')}>
          {isLoading ? 'Generating…' : '✨ Generate Study Set'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run all tests to confirm they pass**

Run: `npm test`
Expected: all tests PASS including both new `TextInput` tests

- [ ] **Step 5: Commit**

```bash
git add src/components/TextInput.tsx src/components/TextInput.test.tsx
git commit -m "feat: TextInput renders ModelSelector between textarea and button"
```

---

## Task 6: Wire up `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `App.tsx`**

Replace `src/App.tsx` with:

```tsx
import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { TextInput }     from './components/TextInput'
import { FlashcardDeck } from './components/FlashcardDeck'
import { QuizPanel }     from './components/QuizPanel'
import { SummaryPanel }  from './components/SummaryPanel'
import { ExportButton }  from './components/ExportButton'
import { useStudyGenerator } from './hooks/useStudyGenerator'
import { useCardProgress }   from './hooks/useCardProgress'
import { DEFAULT_MODEL } from './models'

type Tab = 'flashcards' | 'quiz' | 'summary'

export default function App() {
  const [text,          setText]          = useState('')
  const [tab,           setTab]           = useState<Tab>('flashcards')
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const { studySet, isLoading, error, generate } = useStudyGenerator()
  const { progress, record }                      = useCardProgress()

  const TABS: { id: Tab; label: string }[] = [
    { id: 'flashcards', label: `Flashcards${studySet ? ` (${studySet.flashcards.length})` : ''}` },
    { id: 'quiz',       label: `Quiz${studySet ? ` (${studySet.quiz.length})` : ''}` },
    { id: 'summary',    label: 'Summary' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <BookOpen size={22} className="text-indigo-400" />
        <span className="font-bold text-lg">QuizForge</span>
        <span className="text-xs text-gray-500">AI-powered study sets</span>
      </header>

      <main className="max-w-3xl mx-auto p-6 flex flex-col gap-8">
        {!studySet ? (
          <TextInput
            value={text}
            onChange={setText}
            onGenerate={() => generate(text, selectedModel)}
            isLoading={isLoading}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                {TABS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTab(t.id)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <ExportButton flashcards={studySet.flashcards} />
                <button type="button" onClick={() => generate(text, selectedModel)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 text-xs">
                  Regenerate
                </button>
              </div>
            </div>

            {tab === 'flashcards' && <FlashcardDeck cards={studySet.flashcards} progress={progress} onRecord={record} />}
            {tab === 'quiz'       && <QuizPanel questions={studySet.quiz} />}
            {tab === 'summary'    && <SummaryPanel bullets={studySet.summary} />}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-300 text-sm">{error}</div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: all tests PASS

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire model selection state in App"
```

---

## Done

All six tasks complete. The model selector is fully wired: user picks a model in the UI → stored in App state → passed to `generate()` → sent in the POST body → validated by `resolveModel` → forwarded to Groq.
