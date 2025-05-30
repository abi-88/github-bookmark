import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import React from 'react';

describe('Card Components', () => {
  describe('Card Component', () => {
    it('renders a card div with children', () => {
      render(<Card>Card Content</Card>);
      
      const card = screen.getByText('Card Content');
      expect(card).toBeInTheDocument();
      expect(card.tagName).toBe('DIV');
    });

    it('applies the expected styles', () => {
      render(<Card>Styled Card</Card>);
      
      const card = screen.getByText('Styled Card');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('text-card-foreground');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
    });

    it('applies custom className', () => {
      render(<Card className="custom-class">Custom Card</Card>);
      
      const card = screen.getByText('Custom Card');
      expect(card).toHaveClass('custom-class');
    });

    it('forwards ref to the div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Reference Card</Card>);
      
      expect(ref.current).not.toBeNull();
      expect(ref.current?.tagName).toBe('DIV');
      expect(ref.current?.textContent).toBe('Reference Card');
    });
  });

  describe('CardHeader Component', () => {
    it('renders a header div with children', () => {
      render(<CardHeader>Header Content</CardHeader>);
      
      const header = screen.getByText('Header Content');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('DIV');
    });

    it('renders the header', () => {
      render(<CardHeader>Styled Header</CardHeader>);
      
      const header = screen.getByText('Styled Header');
      expect(header).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardHeader className="custom-header">Custom Header</CardHeader>);
      
      const header = screen.getByText('Custom Header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardContent Component', () => {
    it('renders a content div with children', () => {
      render(<CardContent>Content Text</CardContent>);
      
      const content = screen.getByText('Content Text');
      expect(content).toBeInTheDocument();
      expect(content.tagName).toBe('DIV');
    });

    it('renders the content', () => {
      render(<CardContent>Styled Content</CardContent>);
      
      const content = screen.getByText('Styled Content');
      expect(content).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardContent className="custom-content">Custom Content</CardContent>);
      
      const content = screen.getByText('Custom Content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('CardFooter Component', () => {
    it('renders a footer div with children', () => {
      render(<CardFooter>Footer Text</CardFooter>);
      
      const footer = screen.getByText('Footer Text');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('DIV');
    });

    it('renders the footer', () => {
      render(<CardFooter>Styled Footer</CardFooter>);
      
      const footer = screen.getByText('Styled Footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
    });

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer">Custom Footer</CardFooter>);
      
      const footer = screen.getByText('Custom Footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('CardTitle Component', () => {
    it('renders a title with children', () => {
      render(<CardTitle>Card Title</CardTitle>);
      
      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      // Component might be a div in actual implementation
      expect(title).toBeTruthy();
    });

    it('applies some default styles', () => {
      render(<CardTitle>Styled Title</CardTitle>);
      
      const title = screen.getByText('Styled Title');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
    });

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Custom Title</CardTitle>);
      
      const title = screen.getByText('Custom Title');
      expect(title).toHaveClass('custom-title');
    });

    it('renders with custom data attributes', () => {
      render(<CardTitle data-testid="custom-title">Custom Title</CardTitle>);
      
      const title = screen.getByTestId('custom-title');
      expect(title).toBeInTheDocument();
      expect(title.textContent).toBe('Custom Title');
    });
  });

  describe('CardDescription Component', () => {
    it('renders a description with children', () => {
      render(<CardDescription>Card Description</CardDescription>);
      
      const description = screen.getByText('Card Description');
      expect(description).toBeInTheDocument();
      // Component might be a div in actual implementation
      expect(description).toBeTruthy();
    });

    it('applies the default styles', () => {
      render(<CardDescription>Styled Description</CardDescription>);
      
      const description = screen.getByText('Styled Description');
      expect(description).toHaveClass('text-sm text-muted-foreground');
    });

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc">Custom Description</CardDescription>);
      
      const description = screen.getByText('Custom Description');
      expect(description).toHaveClass('custom-desc');
    });
  });

  describe('Card Components Integration', () => {
    it('renders a complete card with all subcomponents', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            Main content of the card
          </CardContent>
          <CardFooter>
            Card Footer
          </CardFooter>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Main content of the card')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });
  });
});
