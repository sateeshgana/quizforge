import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizPanel } from './QuizPanel'
import type { QuizQuestion } from '../types'

const questions: QuizQuestion[] = [{
  id: '1',
  question: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  answer: 'B',
  explanation: 'Basic arithmetic: 2 + 2 = 4',
}]

describe('QuizPanel', () => {
  it('shows the question', () => {
    render(<QuizPanel questions={questions} />)
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('shows all 4 options', () => {
    render(<QuizPanel questions={questions} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('shows correct feedback after selecting right answer', async () => {
    render(<QuizPanel questions={questions} />)
    await userEvent.click(screen.getByText('4'))
    expect(screen.getByText(/correct/i)).toBeInTheDocument()
  })

  it('shows explanation after any answer', async () => {
    render(<QuizPanel questions={questions} />)
    await userEvent.click(screen.getByText('3'))
    expect(screen.getByText(/basic arithmetic/i)).toBeInTheDocument()
  })
})
