import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import Input from './Input'

describe('Input', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('shows required indicator when required', () => {
    render(<Input label="Email" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />)
    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveTextContent('Invalid email')
  })

  it('displays helper text', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />)
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
  })

  it('does not show helper text when error is present', () => {
    render(
      <Input
        label="Email"
        helperText="Helper text"
        error="Error message"
      />
    )
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<Input error="Error message" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-danger-600')
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    
    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello')
    
    expect(input).toHaveValue('Hello')
  })

  it('calls onChange handler', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    
    await user.type(input, 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('applies disabled styles to label', () => {
    render(<Input label="Disabled Input" disabled />)
    const label = screen.getByText('Disabled Input')
    expect(label).toHaveClass('opacity-50')
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input error="Error" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('associates error with input via aria-describedby', () => {
    render(<Input label="Email" error="Invalid email" />)
    const input = screen.getByRole('textbox')
    const errorId = input.getAttribute('aria-describedby')
    
    expect(errorId).toBeTruthy()
    const error = document.getElementById(errorId!)
    expect(error).toHaveTextContent('Invalid email')
  })

  it('associates helper text with input via aria-describedby', () => {
    render(<Input label="Password" helperText="Helper text" />)
    const input = screen.getByRole('textbox')
    const helperId = input.getAttribute('aria-describedby')
    
    expect(helperId).toBeTruthy()
    const helper = document.getElementById(helperId!)
    expect(helper).toHaveTextContent('Helper text')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('spreads additional props', () => {
    render(<Input data-testid="test-input" maxLength={10} />)
    const input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" />)
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
    
    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })
})
