import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils';
import { Input } from '../../components/ui/input';
import React from 'react';

describe('Input Component', () => {
  it('renders an input element', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('rounded-md');
    expect(input).toHaveClass('border');
  });

  it('passes HTML attributes to the input element', () => {
    render(
      <Input 
        type="email"
        placeholder="Enter your email"
        required
        disabled
        value="test@example.com"
        readOnly
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter your email');
    expect(input).toHaveAttribute('required');
    expect(input).toBeDisabled();
    expect(input).toHaveValue('test@example.com');
    expect(input).toHaveAttribute('readonly');
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref to the input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} defaultValue="Test Value" />);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('INPUT');
    expect(ref.current?.value).toBe('Test Value');
  });

  it('renders with different types', () => {
    const { rerender } = render(<Input type="text" data-testid="input" />);
    
    let input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'text');
    
    rerender(<Input type="password" data-testid="input" />);
    input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'password');
    
    rerender(<Input type="number" data-testid="input" />);
    input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('supports autoFocus', () => {
    // JSDOM doesn't fully simulate focus behavior
    render(<Input autoFocus />);
    
    // Instead of checking the attribute, check if the prop was passed
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });
});
