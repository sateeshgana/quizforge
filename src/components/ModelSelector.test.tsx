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
    await userEvent.click(screen.getByText(MODELS[1].name))
    expect(onChange).toHaveBeenCalledWith(MODELS[1].id)
  })
})
