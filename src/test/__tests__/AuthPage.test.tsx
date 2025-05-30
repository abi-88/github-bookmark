import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils';
import AuthPage from '../../pages/auth/AuthPage';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/simple-toast';

// Mock the context hooks
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/ui/simple-toast', () => ({
  useToast: vi.fn(),
}));

// Create a separate mock for useNavigate
const mockNavigate = vi.fn();

// Mock the react-router-dom module
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

describe('AuthPage Component', () => {
  const mockLogin = vi.fn();
  const mockSignup = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth context values
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      signup: mockSignup,
    });

    // Mock toast
    (useToast as any).mockReturnValue({
      showToast: mockShowToast,
    });
  });

  it('renders login form by default', () => {
    render(<AuthPage />);
    
    // Should show login elements
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    
    // Signup field should not be present
    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument();
  });

  it('switches to signup form when signup button is clicked', async () => {
    render(<AuthPage />);
    
    // Click on signup link
    fireEvent.click(screen.getByText('Sign Up', { selector: 'button' }));
    
    // Should show signup elements
    await waitFor(() => {
      expect(screen.getByText('Create an Account')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByText('Sign Up', { selector: 'button[type="submit"]' })).toBeInTheDocument();
    });
  });

  it('submits login form and navigates on success', async () => {
    mockLogin.mockResolvedValue({ success: true });
    
    render(<AuthPage />);
    
    // Fill in form
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.submit(screen.getByText('Login').closest('form')!);
    
    // Wait for login to be called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('shows error toast when login fails', async () => {
    mockLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });
    
    render(<AuthPage />);
    
    // Fill in form
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.submit(screen.getByText('Login').closest('form')!);
    
    // Wait for login and toast
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockShowToast).toHaveBeenCalledWith('Invalid credentials', 'error');
    });
  });

  it('validates username on signup', async () => {
    render(<AuthPage />);
    
    // Switch to signup
    fireEvent.click(screen.getByText('Sign Up', { selector: 'button' }));
    
    // Fill in form except username
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    });
    
    // Submit form
    fireEvent.submit(screen.getByText('Sign Up', { selector: 'button[type="submit"]' }).closest('form')!);
    
    // Should show validation error
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Signup failed: Username is required', 'error');
    });
  });

  it('submits signup form and shows success message', async () => {
    mockSignup.mockResolvedValue({ success: true });
    
    render(<AuthPage />);
    
    // Switch to signup
    fireEvent.click(screen.getByText('Sign Up', { selector: 'button' }));
    
    // Fill in form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    });
    
    // Submit form
    fireEvent.submit(screen.getByText('Sign Up', { selector: 'button[type="submit"]' }).closest('form')!);
    
    // Wait for signup and toast
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
      expect(mockShowToast).toHaveBeenCalledWith('Signup successful! Your account has been created.', 'success');
    });
  });

  it('shows error toast when signup fails', async () => {
    mockSignup.mockResolvedValue({ success: false, message: 'Email already exists' });
    
    render(<AuthPage />);
    
    // Switch to signup
    fireEvent.click(screen.getByText('Sign Up', { selector: 'button' }));
    
    // Fill in form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    });
    
    // Submit form
    fireEvent.submit(screen.getByText('Sign Up', { selector: 'button[type="submit"]' }).closest('form')!);
    
    // Wait for signup and toast
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
      expect(mockShowToast).toHaveBeenCalledWith('Email already exists', 'error');
    });
  });

  it('handles forgot password click', async () => {
    render(<AuthPage />);
    
    // Click forgot password
    fireEvent.click(screen.getByText('Forgot Password?'));
    
    // Should show toast
    expect(mockShowToast).toHaveBeenCalledWith('Forgot Password', 'success');
  });
});
