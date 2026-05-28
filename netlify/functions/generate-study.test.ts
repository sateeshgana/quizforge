import { buildStudyPrompt, parseStudyResponse } from './generate-study.mts'

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
