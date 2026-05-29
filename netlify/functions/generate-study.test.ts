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
