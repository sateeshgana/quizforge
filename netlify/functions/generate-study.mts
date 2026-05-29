import Groq from 'groq-sdk'
import { randomUUID } from 'crypto'
import type { StudySet } from '../../src/types'
import { resolveModelConfig } from '../../src/models'

export { resolveModel, resolveModelConfig } from '../../src/models'

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
  const json = raw
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
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
  if (data.error) throw new Error(data.error.message ?? 'OpenRouter error')
  if (!response.ok) throw new Error('OpenRouter request failed')
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Model returned no content')
  return parseStudyResponse(content)
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
