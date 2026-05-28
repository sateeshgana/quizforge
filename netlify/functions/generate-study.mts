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
