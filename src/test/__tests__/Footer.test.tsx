import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils';
import { Footer } from '../../components/layout/Footer';

describe('Footer Component', () => {
  it('renders the footer element', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('border-t');
  });
  
  it('displays the copyright text with current year', () => {
    render(<Footer />);
    
    // Should display the copyright notice
    const copyrightText = screen.getByText(/©/);
    expect(copyrightText).toBeInTheDocument();
    
    // Should include the current year
    const currentYear = new Date().getFullYear().toString();
    expect(copyrightText.textContent).toContain(currentYear);
  });
  
  it('displays the GitHub Bookmark text', () => {
    render(<Footer />);
    
    // Be more specific to get the span element only
    const logoText = screen.getAllByText(/GitHub Bookmark/i)[0];
    expect(logoText).toBeInTheDocument();
    expect(logoText.tagName).toBe('SPAN');
  });
  
  it('has the correct layout structure', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer.firstChild).toHaveClass('container');
    
    // Check for flex layout in the container
    const container = footer.firstChild as HTMLElement;
    expect(container.firstChild).toHaveClass('flex');
  });
});
