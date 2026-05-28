import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlashcardDeck } from './FlashcardDeck'
import { vi } from 'vitest'
import type { Flashcard } from '../types'

const cards: Flashcard[] = [
  { id: '1', front: 'What is React?', back: 'A UI library' },
  { id: '2', front: 'What is TypeScript?', back: 'Typed JavaScript' },
]

describe('FlashcardDeck', () => {
  it('shows front of first card', () => {
    render(<FlashcardDeck cards={cards} progress={{}} onRecord={vi.fn()} />)
    expect(screen.getByText('What is React?')).toBeInTheDocument()
  })

  it('reveals back when card is clicked', async () => {
    render(<FlashcardDeck cards={cards} progress={{}} onRecord={vi.fn()} />)
    await userEvent.click(screen.getByText('What is React?'))
    expect(screen.getByText('A UI library')).toBeInTheDocument()
  })

  it('calls onRecord when confidence button clicked', async () => {
    const onRecord = vi.fn()
    render(<FlashcardDeck cards={cards} progress={{}} onRecord={onRecord} />)
    await userEvent.click(screen.getByText('What is React?')) // reveal back
    await userEvent.click(screen.getByRole('button', { name: /easy/i }))
    expect(onRecord).toHaveBeenCalledWith('1', 'easy')
  })
})
