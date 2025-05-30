import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../components/ui/simple-toast";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const {success,message} = await login(email, password);
        if (success) {
          navigate("/home");
        } else {
          showToast(message||"Login failed: Invalid email or password", "error");
        }
      } else {
        if (!username.trim()) {
          showToast("Signup failed: Username is required", "error");
          setIsLoading(false);
          return;
        }
        
        const {success,message} = await signup(username, email, password);
        if (success) {
          showToast("Signup successful! Your account has been created.", "success");
          setIsLogin(true);
        } else {
          showToast(message||"Signup failed: Email already exists", "error");
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showToast("An error occurred during authentication", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-auto p-4">
  <div className="w-[50vw] flex items-center justify-center">
    <Card className="border-none w-[60%]" 
    style={{
    boxShadow: '0 0 20px 0 #646cff',
  }}>
      <CardHeader className="text-center p-6">
        <CardTitle className="text-2xl font-bold">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Enter your information to create an account"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                className="h-12 border-none bg-gray-700"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 border-none bg-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {isLogin && (
                <Button
                type="button"
                onClick={()=>{showToast("Forgot Password", "success")}}
                  variant="link"
                  className="p-0 h-auto text-xs text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="h-12 border-none bg-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full transition-colors hover:bg-[#535bf2] bg-[#646cff] h-12 mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center px-4">
        <div className="text-sm text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <Button
            variant="link"
            className="pl-1 text-blue-600 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  </div>
</div>
);
};

export default AuthPage;
