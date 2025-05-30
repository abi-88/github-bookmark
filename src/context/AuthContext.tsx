import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../client/supabase';
import type { ReactNode } from 'react';

type User = {
  username: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<{success:boolean,message?:string}>;
  signup: (username: string, email: string, password: string) => Promise<{success:boolean,message?:string}>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session:', error.message);
          return;
        }
        if (data.session?.user && data.session.user?.access_token) {
          const userData = {
            username: data.session.user.user_metadata?.username || data.session.user.email?.split('@')[0] || '',
            email: data.session.user.email || '',
            ...data.session.user
          };
          
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user data from session:', error);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userData = {
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
          email: session.user.email || ''
        };
        
        setUser(userData);
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{success:boolean, message?:string}> => {
    try {
      // Sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Error during login:', error.message);
        return {success:false, message:error?.message||'Login failed'};
      }
      
      if (data.user) {
        // Create a user object from Supabase user data
        const loggedInUser = {
          username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || '',
          email: data.user.email || ''
        };
        
        // Update state with user info
        setUser(loggedInUser);
        setIsAuthenticated(true);
        return {success:true, message:"User logged in successfully"};
      }
    } catch (error) {
      console.error('Error during login:', error);
      return {success:false, message:error?.message||"Login failed"};
    }
    
    return {success:false, message:'Login failed'};
  };

  const signup = async (username: string, email: string, password: string): Promise<{success:boolean,message?:string}> => {
    try {
      // Register with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });
      
      if (error) {
        console.error('Error during registration:', error.message);
        return {success:false, message:error.message};
      }
      
      if (data.user) {
        // Create user object
        const loggedInUser = {
          username,
          email
        };
        
        // Update state with user info
        setUser(loggedInUser);
        setIsAuthenticated(true);
        
        return {success:true, message:'User registered successfully'};
      }
      
      return {success:false, message:"Registration failed"};
    } catch (error) {
      console.error('Error during registration:', error);
      return {success:false, message:error instanceof Error ? error.message : "Registration failed"};
    }
  };

  const logout = async () => {
    try {
      // Sign out with Supabase auth
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during logout:', error.message);
        return;
      }
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
