import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '../utils';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { supabase } from '../../client/supabase';

// Mock the supabase client
vi.mock('../../client/supabase', () => {
  // Create mock functions with proper implementations
  const getSessionMock = vi.fn();
  const signInWithPasswordMock = vi.fn();
  const signUpMock = vi.fn();
  const signOutMock = vi.fn();
  const onAuthStateChangeMock = vi.fn();
  
  // Create a function to reset all mocks before each test
  beforeEach(() => {
    // Reset the implementations
    getSessionMock.mockReset();
    signInWithPasswordMock.mockReset();
    signUpMock.mockReset();
    signOutMock.mockReset();
    
    // Mock onAuthStateChange to return proper initial state
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
      callback('INITIAL_SESSION', null);
      return {
        data: {
          subscription: {
            id: 'subscription-id',
            callback: vi.fn(),
            unsubscribe: vi.fn()
          }
        }
      };
    });
  });
  
  return {
    supabase: {
      auth: {
        getSession: getSessionMock,
        signInWithPassword: signInWithPasswordMock,
        signUp: signUpMock,
        signOut: signOutMock,
        onAuthStateChange: onAuthStateChangeMock
      }
    }
  };
});

// Create a complete mock user that matches Supabase User type
const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  user_metadata: { username: 'testuser' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2021-09-12T12:00:00.000Z',
  updated_at: '2021-09-12T12:00:00.000Z',
  role: 'authenticated',
  confirmed_at: '2021-09-12T12:00:00.000Z',
  last_sign_in_at: '2021-09-12T12:00:00.000Z',
  phone: '',
  identities: []
};

// Create a mock session with all required properties
const mockSession = {
  user: mockUser,
  access_token: 'valid.access.token',
  refresh_token: 'valid.refresh.token',
  expires_in: 3600,
  token_type: 'bearer'
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when useAuth is used outside of AuthProvider', () => {
    // Silence error logs for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Try to use useAuth outside of provider
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  describe('AuthProvider', () => {
    it('initializes with null user and not authenticated', async () => {
      // Mock getSession to return no session
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });

    it('loads user from session if available', async () => {
      // Need to mock the implementation before the hook is rendered
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: mockSession
        },
        error: null,
      });

      // Set up the auth state change callback
      const mockOnAuthStateChange = vi.fn().mockImplementation((callback) => {
        // Immediately trigger the callback with a signed in event
        setTimeout(() => {
          callback('SIGNED_IN', mockSession);
        }, 0);
        
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
              id: 'subscription-id',
              callback: vi.fn()
            }
          }
        };
      });
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(mockOnAuthStateChange);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual({
          username: 'testuser',
          email: 'test@example.com',
        });
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it('handles error when checking session', async () => {
      // Mock console.error to prevent logs
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock getSession to return an error
      (supabase.auth.getSession as any).mockResolvedValue({
        data: {},
        error: { message: 'Session error' },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error checking session:', 'Session error'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('successfully logs in a user', async () => {
      // Mock getSession for initial render
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Mock login success
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password');
      });

      expect(loginResult).toEqual({
        success: true,
        message: 'User logged in successfully',
      });
      
      expect(result.current.user).toEqual({
        username: 'testuser',
        email: 'test@example.com',
      });
      
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('handles sign-in errors', async () => {
      // Mock console.error to prevent logs
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock getSession for initial render
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Mock login failure
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue({ 
        name: 'AuthError',
        message: 'Invalid credentials',
        status: 400,
        code: 'invalid_credentials',
        __isAuthError: true
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password');
      });

      expect(loginResult).toEqual({
        success: false,
        message: 'Invalid credentials',
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('signup', () => {
    it('successfully registers a new user', async () => {
      // Mock getSession for initial render
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Mock signup success
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      let signupResult;
      await act(async () => {
        signupResult = await result.current.signup('testuser', 'test@example.com', 'password');
      });

      expect(signupResult).toEqual({
        success: true,
        message: 'User registered successfully',
      });
      
      expect(result.current.user).toEqual({
        username: 'testuser',
        email: 'test@example.com',
      });
      
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('returns failure when signup fails', async () => {
      // Mock console.error to prevent logs
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock getSession for initial render
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Mock signup failure
      (supabase.auth.signUp as any).mockResolvedValue({
        data: {},
        error: { message: 'Email already in use' },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      let signupResult;
      await act(async () => {
        signupResult = await result.current.signup('testuser', 'test@example.com', 'password');
      });

      expect(signupResult).toEqual({
        success: false,
        message: 'Email already in use',
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('successfully logs out a user', async () => {
      // Setup an initial state with logged in user
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: mockUser,
            access_token: 'test-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'bearer'
          }
        },
        error: null,
      });
      
      // Mock the auth state change to simulate a user sign-in
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        // Call the callback with SIGNED_IN event and mock session data
        setTimeout(() => {
          callback('SIGNED_IN', mockSession);
        }, 0);
        
        return {
          data: {
            subscription: {
              id: 'subscription-id',
              callback: vi.fn(),
              unsubscribe: vi.fn()
            }
          }
        };
      });

      // Mock logout success
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // First verify the user is authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Then simulate logout - update the mock to trigger SIGNED_OUT event
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
        // Immediately trigger SIGNED_OUT
        setTimeout(() => {
          callback('SIGNED_OUT', null);
        }, 0);
        return {
          data: {
            subscription: {
              id: 'subscription-id',
              callback: vi.fn(),
              unsubscribe: vi.fn()
            }
          }
        };
      });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      // Verify logged out state
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('handles error during logout', async () => {
      // Mock console.error to prevent logs
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Setup initial authenticated state
      // Setup initial session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: mockSession
        },
        error: null
      });

      // Mock the auth state change to simulate a user sign-in
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
        // Call the callback with SIGNED_IN event and mock session data
        callback('SIGNED_IN', mockSession);
        return {
          data: {
            subscription: {
              id: 'subscription-id',
              callback: vi.fn(),
              unsubscribe: vi.fn()
            }
          }
        };
      });

      // Mock logout failure
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: { message: 'Logout error' },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // First verify the user is authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Attempt logout
      await act(async () => {
        await result.current.logout();
      });

      // User should still be authenticated since logout failed
      expect(result.current.isAuthenticated).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Error during logout:', 'Logout error');

      consoleSpy.mockRestore();
    });
  });
});
