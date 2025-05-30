import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../utils';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';

// Mock navigate function
const mockNavigate = vi.fn();

// Mock the hooks and components
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/layout/Header', () => ({
  Header: ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => (
    <header data-testid="header" data-active-tab={activeTab}>
      <button onClick={() => onTabChange('bookmarks')}>Change Tab</button>
    </header>
  ),
}));

vi.mock('../../components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for useAuth
    (useAuth as any).mockReturnValue({ user: null });
  });

  it('renders header, main content, and footer', () => {
    render(
      <Layout activeTab="search" onTabChange={vi.fn()}>
        <div data-testid="content">Test Content</div>
      </Layout>
    );
    
    // Check if all components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('passes activeTab and onTabChange to Header', () => {
    const handleTabChange = vi.fn();
    
    render(
      <Layout activeTab="search" onTabChange={handleTabChange}>
        <div>Test Content</div>
      </Layout>
    );
    
    // Check if activeTab is passed correctly
    expect(screen.getByTestId('header').getAttribute('data-active-tab')).toBe('search');
    
    // Simulate tab change
    screen.getByText('Change Tab').click();
    
    // Check if onTabChange is called
    expect(handleTabChange).toHaveBeenCalledWith('bookmarks');
  });

  it('navigates to home when user is authenticated', () => {
    // Mock authenticated user
    (useAuth as any).mockReturnValue({ user: { id: '123', email: 'test@example.com' } });
    
    render(
      <Layout activeTab="search" onTabChange={vi.fn()}>
        <div>Test Content</div>
      </Layout>
    );
    
    // Check if navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('does not navigate when user is not authenticated', () => {
    // Mock unauthenticated user
    (useAuth as any).mockReturnValue({ user: null });
    
    render(
      <Layout activeTab="search" onTabChange={vi.fn()}>
        <div>Test Content</div>
      </Layout>
    );
    
    // Check that navigation didn't occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
