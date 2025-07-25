
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  
  const { login, signup, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!email || !password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (isSignupMode) {
        await signup(email, password);
        toast({
          title: "Signup Successful",
          description: "Account created! You can now login.",
        });
        setIsSignupMode(false);
      } else {
        await login(email, password);
        
        toast({
          title: "Login Successful",
          description: "Welcome to MansaLuxeRealty Admin Panel",
        });

        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: isSignupMode ? "Signup Failed" : "Login Failed", 
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">
            MansaLuxeRealty
          </CardTitle>
          <CardDescription>
            Admin Panel - Please sign in to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="onakpoyanufuoma@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (isSignupMode ? 'Creating Account...' : 'Signing In...') : (isSignupMode ? 'Create Account' : 'Sign In')}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              className="w-full" 
              onClick={() => setIsSignupMode(!isSignupMode)}
            >
              {isSignupMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </Button>
          </form>

          {/* Login Credentials Helper */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">{isSignupMode ? 'Steps to Create Admin:' : 'Admin Login Steps:'}</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              {isSignupMode ? (
                <>
                  <p>1. Create account with email: onakpoyanufuoma@gmail.com</p>
                  <p>2. Use any password you want</p>
                  <p>3. Then switch to "Sign In" mode</p>
                  <p>4. Login with the same credentials</p>
                </>
              ) : (
                <>
                  <p><strong>Use existing admin email:</strong></p>
                  <p>onakpoyanufuoma@gmail.com</p>
                  <p>(Create this account first with Sign Up)</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
