export interface Flashcard {
  id: string
  front: string
  back: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: [string, string, string, string]  // exactly 4 options
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export interface StudySet {
  flashcards: Flashcard[]
  quiz: QuizQuestion[]
  summary: string[]  // 3–5 bullet strings
}

export type Confidence = 'easy' | 'hard' | 'again'

export interface CardProgress {
  [cardId: string]: {
    confidence: Confidence
    reviewedAt: number
  }
}
