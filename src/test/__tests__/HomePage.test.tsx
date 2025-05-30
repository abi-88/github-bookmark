import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '../utils';
import HomePage from '../../pages/home/HomePage';

// Mock the components used in HomePage
vi.mock('../../components/github/GithubTabs', () => ({
  GithubTabs: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="github-tabs" data-active-tab={activeTab}>
      Github Tabs Component
    </div>
  ),
}));

// Create a mock for Layout that actually updates the activeTab state when clicked
vi.mock('../../components/layout/Layout', () => ({
  Layout: ({ children, activeTab, onTabChange }: { 
    children: React.ReactNode, 
    activeTab: string, 
    onTabChange: (tab: string) => void 
  }) => {
    // Immediately call onTabChange with 'bookmarks' when rendered in test
    // This simulates the effect of the click handler changing the tab
    React.useEffect(() => {
      if (activeTab === 'search' && onTabChange) {
        setTimeout(() => onTabChange('bookmarks'), 0);
      }
    }, []);

    return (
      <div data-testid="layout" data-active-tab={activeTab}>
        {children}
      </div>
    );
  },
}));

describe('HomePage Component', () => {
  it('renders with default active tab', () => {
    render(<HomePage />);
    
    // Check if Layout and GithubTabs are rendered
    const layout = screen.getByTestId('layout');
    const githubTabs = screen.getByTestId('github-tabs');
    
    expect(layout).toBeInTheDocument();
    expect(githubTabs).toBeInTheDocument();
    
    // Check if default active tab is 'search'
    expect(layout.getAttribute('data-active-tab')).toBe('search');
    expect(githubTabs.getAttribute('data-active-tab')).toBe('search');
  });
  
  it('changes active tab when onTabChange is called', async () => {
    render(<HomePage />);
    
    // Wait for the async tab change to happen (implemented in our Layout mock)
    await vi.waitFor(() => {
      const tabs = screen.getByTestId('github-tabs');
      expect(tabs.getAttribute('data-active-tab')).toBe('bookmarks');
    });
    
    // Check the layout was updated as well
    expect(screen.getByTestId('layout').getAttribute('data-active-tab')).toBe('bookmarks');
  });
});
