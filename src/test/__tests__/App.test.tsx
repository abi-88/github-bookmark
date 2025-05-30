import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../utils';
import App from '../../App';
import { useAuth } from '../../context/AuthContext';

// Mock the auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the bookmark context
vi.mock('../../context/BookmarkContext', () => ({
  BookmarkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the components
vi.mock('../../pages/auth/AuthPage', () => ({
  default: () => <div data-testid="auth-page">Auth Page</div>,
}));

vi.mock('../../pages/home/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('../../components/layout/PrivateRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="private-route">{children}</div>,
}));

vi.mock('../../components/ui/simple-toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-provider">{children}</div>,
}));

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders auth page when user is not authenticated', () => {
    // Mock user not authenticated
    (useAuth as any).mockReturnValue({ user: null });
    
    render(<App />);
    
    // Should render auth page
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
  });

  it('redirects to auth page from root path', () => {
    (useAuth as any).mockReturnValue({ user: null });
    
    render(<App />);
    
    // Initial render should redirect from / to /auth
    expect(window.location.pathname).toBe('/auth');
  });

  it('renders the app with all providers', () => {
    (useAuth as any).mockReturnValue({ user: null });
    
    render(<App />);
    
    // Should render all providers
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
  });
});
