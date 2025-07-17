import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Crown, Mail, Lock, Key, AlertTriangle, ChevronLeft, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'twoFactor' | 'reset'>('login');
  
  // Two-factor authentication state
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const { login, verifyTwoFactor, resetPassword, isAuthenticated, isTwoFactorPending } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/admin/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Form validation
      if (!email || !password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Attempt login
      const result = await login(email, password);
      
      if (result.requiresTwoFactor) {
        // Show 2FA screen if needed
        setActiveTab('twoFactor');
        toast({
          title: "Verification Required",
          description: "Please enter the verification code sent to your device",
        });
      } else {
        // Success message if no 2FA needed
        toast({
          title: "Login Successful",
          description: "Welcome to MansaLuxeRealty Admin Panel",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTwoFactorVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!twoFactorCode) {
        toast({
          title: "Validation Error",
          description: "Please enter the verification code",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      await verifyTwoFactor(twoFactorCode);
      
      toast({
        title: "Verification Successful",
        description: "Welcome to MansaLuxeRealty Admin Panel",
      });
      
      // Navigation will be handled by the ProtectedRoute component
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!resetEmail) {
        toast({
          title: "Validation Error",
          description: "Please enter your email address",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      await resetPassword(resetEmail);
      setResetSuccess(true);
      
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for further instructions",
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Failed",
        description: "We couldn't process your request. Please try again.",
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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="twoFactor" disabled={!isTwoFactorPending}>2FA</TabsTrigger>
              <TabsTrigger value="reset">Reset Password</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@mansaluxerealty.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto text-xs text-muted-foreground"
                      onClick={() => setActiveTab('reset')}
                    >
                      Forgot password?
                    </Button>
                  </div>
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
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            {/* Two-Factor Authentication Form */}
            <TabsContent value="twoFactor">
              <div className="space-y-4">
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Two-Factor Authentication</AlertTitle>
                  <AlertDescription>
                    Please enter the verification code sent to your device.
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleTwoFactorVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder="123456"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveTab('login')}
                      className="flex-1"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify Code'}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
            
            {/* Password Reset Form */}
            <TabsContent value="reset">
              {resetSuccess ? (
                <div className="space-y-4">
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Password Reset Email Sent</AlertTitle>
                    <AlertDescription>
                      Please check your email for instructions to reset your password.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={() => {
                      setActiveTab('login');
                      setResetSuccess(false);
                    }}
                  >
                    Return to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Password Reset</AlertTitle>
                    <AlertDescription>
                      Enter your email address and we'll send you instructions to reset your password.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="admin@mansaluxerealty.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveTab('login')}
                      className="flex-1"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {/* Development Helper */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Development Mode:</p>
            <p className="text-xs text-muted-foreground">
              Use any email and password to login (placeholder authentication)
            </p>
            {activeTab === 'twoFactor' && (
              <p className="text-xs text-muted-foreground mt-1">
                Use any code (e.g. 123456) to pass 2FA verification
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}