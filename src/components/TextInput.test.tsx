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
