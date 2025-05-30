import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../utils';
import { Outlet, Navigate } from 'react-router-dom';
import PrivateRoute from '../../components/layout/PrivateRoute';
import { useAuth } from '../../context/AuthContext';

// Mock the hooks and components
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Create a mock for Outlet component
vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Protected Content</div>,
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Redirecting...</div>,
}));

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders outlet when user is authenticated', () => {
    // Mock authenticated user
    (useAuth as any).mockReturnValue({ 
      user: { id: '123', email: 'test@example.com' },
      isAuthenticated: true 
    });
    
    render(<PrivateRoute />);
    
    // Should render the outlet (protected content)
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Should not render Navigate component
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
  
  it('redirects to auth page when user is not authenticated', () => {
    // Mock unauthenticated user
    (useAuth as any).mockReturnValue({ 
      user: null,
      isAuthenticated: false 
    });
    
    render(<PrivateRoute />);
    
    // Should not render the outlet
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    
    // Should render Navigate component with redirect to /auth
    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate.getAttribute('data-to')).toBe('/auth');
  });
});
