import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import Chip from './Chip'

describe('Chip', () => {
  it('renders with children', () => {
    render(<Chip>Category</Chip>)
    expect(screen.getByText('Category')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Chip>Primary</Chip>)
    const chip = screen.getByText('Primary')
    expect(chip).toHaveClass('bg-primary-50', 'text-primary-700')
  })

  it('applies secondary variant', () => {
    render(<Chip variant="secondary">Secondary</Chip>)
    const chip = screen.getByText('Secondary')
    expect(chip).toHaveClass('bg-secondary-50')
  })

  it('applies accent variant', () => {
    render(<Chip variant="accent">Accent</Chip>)
    const chip = screen.getByText('Accent')
    expect(chip).toHaveClass('bg-accent-50')
  })

  it('applies success variant', () => {
    render(<Chip variant="success">Success</Chip>)
    const chip = screen.getByText('Success')
    expect(chip).toHaveClass('bg-green-50', 'text-green-700')
  })

  it('applies warning variant', () => {
    render(<Chip variant="warning">Warning</Chip>)
    const chip = screen.getByText('Warning')
    expect(chip).toHaveClass('bg-yellow-50', 'text-yellow-700')
  })

  it('applies danger variant', () => {
    render(<Chip variant="danger">Danger</Chip>)
    const chip = screen.getByText('Danger')
    expect(chip).toHaveClass('bg-red-50', 'text-red-700')
  })

  it('applies info variant', () => {
    render(<Chip variant="info">Info</Chip>)
    const chip = screen.getByText('Info')
    expect(chip).toHaveClass('bg-blue-50', 'text-blue-700')
  })

  it('applies custom className', () => {
    render(<Chip className="custom-chip">Chip</Chip>)
    const chip = screen.getByText('Chip')
    expect(chip).toHaveClass('custom-chip')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<Chip ref={ref}>Chip</Chip>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('spreads additional props', () => {
    render(<Chip data-testid="test-chip">Chip</Chip>)
    expect(screen.getByTestId('test-chip')).toBeInTheDocument()
  })
})
