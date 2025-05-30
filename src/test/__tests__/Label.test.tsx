import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils';
import { Label } from '../../components/ui/label';
import React from 'react';

describe('Label Component', () => {
  it('renders a label element with children', () => {
    render(<Label>Email</Label>);
    
    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('applies the default styles', () => {
    render(<Label>Username</Label>);
    
    const label = screen.getByText('Username');
    expect(label).toHaveClass('text-sm font-medium leading-none');
  });

  it('applies custom className', () => {
    render(<Label className="custom-class">Password</Label>);
    
    const label = screen.getByText('Password');
    expect(label).toHaveClass('custom-class');
  });

  it('forwards HTML attributes to the label element', () => {
    render(<Label htmlFor="email-input">Email Address</Label>);
    
    const label = screen.getByText('Email Address');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('forwards ref to the label element', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Reference Label</Label>);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('LABEL');
    expect(ref.current?.textContent).toBe('Reference Label');
  });

  it('renders with proper aria attributes when required', () => {
    render(
      <Label aria-required="true" aria-label="Required field">
        Required Field
      </Label>
    );
    
    const label = screen.getByText('Required Field');
    expect(label).toHaveAttribute('aria-required', 'true');
    expect(label).toHaveAttribute('aria-label', 'Required field');
  });

  it('renders with custom HTML attributes', () => {
    render(
      <Label htmlFor="test-input" data-testid="test-label">
        Test Label
      </Label>
    );
    
    const label = screen.getByTestId('test-label');
    expect(label).toHaveAttribute('for', 'test-input');
    expect(label.textContent).toBe('Test Label');
  });
});
