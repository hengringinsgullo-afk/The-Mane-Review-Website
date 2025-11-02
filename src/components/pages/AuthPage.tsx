import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, Mail, Lock, Phone, Calendar, School, GraduationCap, Briefcase, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { authHelpers } from '../../lib/supabase';

interface AuthPageProps { onAuthSuccess?: (user: any) => void; onNavigate?: (page: string) => void; defaultTab?: 'login' | 'signup'; }

export function AuthPage({ onAuthSuccess, onNavigate, defaultTab = 'login' }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', fullName: '', phoneNumber: '', dateOfBirth: '', isStPaulsMember: false, memberType: '', studentForm: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const formatBrazilianPhone = (value: string) => value.replace(/\D/g, '').slice(0, 11);
  const validateBrazilianPhone = (phone: string) => phone.length === 11;

  const validateForm = (isSignup: boolean = false) => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) errors.email = 'Please enter a valid email address';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (isSignup) {
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      if (formData.fullName.trim().length < 3) errors.fullName = 'Please enter your full name';
      if (!validateBrazilianPhone(formData.phoneNumber)) errors.phoneNumber = 'Phone number must be exactly 11 digits';
      const dob = new Date(formData.dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (!formData.dateOfBirth || age < 13 || age > 100) errors.dateOfBirth = 'Please enter a valid date of birth';

    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors({});

    if (field === 'memberType' && value === 'staff') setFormData(prev => ({ ...prev, studentForm: '' }));
  };

  const handlePhoneChange = (value: string) => handleInputChange('phoneNumber', formatBrazilianPhone(value));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setShowResendEmail(false);
    try {
      const { data, error } = await authHelpers.signIn(formData.email.trim(), formData.password);
      if (error) {
        const errorMessage = error.message || 'Invalid email or password';
        console.log('Login error details:', { 
          message: errorMessage, 
          status: error.status,
          code: error.code 
        });
        
        // Show resend email option for invalid credentials (might be unverified email)
        if (errorMessage.toLowerCase().includes('invalid login') || 
            errorMessage.toLowerCase().includes('invalid credentials') ||
            errorMessage.toLowerCase().includes('invalid password')) {
          setShowResendEmail(true);
          throw new Error('Invalid email or password. If you just created an account, please check your email to verify your account first.');
        }
        throw new Error(errorMessage);
      }
      if (!data?.user) throw new Error('Login failed - please check your credentials');
      setSuccess('Login successful! Redirecting...');
      setIsLoading(false);
      setTimeout(() => { if (onAuthSuccess) onAuthSuccess(data.user); }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendConfirmationEmail = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsResendingEmail(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await authHelpers.resendConfirmationEmail(formData.email.trim());
      if (error) {
        const errorMessage = error.message || 'Failed to resend confirmation email';
        // Check if it's a rate limit or user not found error
        if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('too many')) {
          throw new Error('Too many requests. Please wait a few minutes before requesting another email.');
        } else if (errorMessage.toLowerCase().includes('user not found') || errorMessage.toLowerCase().includes('not found')) {
          throw new Error('No account found with this email address. Please sign up first.');
        } else if (errorMessage.toLowerCase().includes('already confirmed') || errorMessage.toLowerCase().includes('already verified')) {
          throw new Error('Your email is already verified. Please try logging in.');
        }
        throw new Error(errorMessage);
      }
      setSuccess('Confirmation email sent! Please check your inbox (and spam folder).');
      setShowResendEmail(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend confirmation email');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    setIsLoading(true);
    setError(null);
    try {
      let metadata: any = { full_name: formData.fullName };
      if (formData.email !== 'henriquegullo@themanereview.com') {
        metadata = { full_name: formData.fullName, phone_number: formData.phoneNumber, date_of_birth: formData.dateOfBirth, role: 'Student' };
      }
      const { data, error } = await authHelpers.signUp(formData.email.trim(), formData.password, metadata);
      if (error) {
        if (error.message.includes('User already registered')) throw new Error('This email is already registered. Please login instead.');
        else if (error.message.includes('Password')) throw new Error('Password must be at least 6 characters long.');
        else if (error.message.includes('Invalid email')) throw new Error('Please enter a valid email address.');
        throw error;
      }
      setSuccess(formData.email === 'henriquegullo@themanereview.com' ? 'Admin account created!' : 'Account created! Check your email to verify.');
      setActiveTab('login');
      setFormData({ email: '', password: '', confirmPassword: '', fullName: '', phoneNumber: '', dateOfBirth: '', isStPaulsMember: false, memberType: '', studentForm: '' });
    } catch (err) {
      setError(err instanceof Error ? `Signup failed: ${err.message}` : 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">The Mane Review</CardTitle>
          <CardDescription>Sign in or create an account to access exclusive content</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex w-full mb-6 gap-4 bg-transparent p-0">
              <TabsTrigger value="login" className="flex-1 rounded-xl" style={{ borderColor: '#000', borderWidth: '2px', borderStyle: 'solid', backgroundColor: activeTab === 'login' ? '#d1d5db' : 'transparent' }}>Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1 rounded-xl" style={{ borderColor: '#000', borderWidth: '2px', borderStyle: 'solid', backgroundColor: activeTab === 'signup' ? '#d1d5db' : 'transparent' }}>Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              {error && (<Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>)}
              {success && (<Alert className="border-green-600 text-green-600"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>)}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="flex-1" required /></div></div>
                <div className="space-y-2"><Label>Password</Label><div className="flex items-center gap-3"><Lock className="h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className="flex-1" required /></div></div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : ('Sign In')}</Button>
              </form>
              {showResendEmail && (
                <Alert className="border-blue-500 bg-blue-50">
                  <AlertDescription className="flex flex-col gap-2">
                    <span>Didn't receive the verification email?</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleResendConfirmationEmail}
                      disabled={isResendingEmail}
                      className="self-start"
                    >
                      {isResendingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend Confirmation Email'
                      )}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              <div className="text-center text-sm text-muted-foreground pt-2">Don't have an account? <button type="button" onClick={() => setActiveTab('signup')} className="text-primary hover:underline font-medium">Create one</button></div>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              {error && (<Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>)}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-3"><h3 className="text-base font-semibold">Basic Information</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Full Name</Label><div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><Input type="text" placeholder="John Doe" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className={validationErrors.fullName ? 'border-red-500' : ''} required /></div>{validationErrors.fullName && (<p className="text-xs text-red-500">{validationErrors.fullName}</p>)}</div><div className="space-y-2"><Label>Email</Label><div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={validationErrors.email ? 'border-red-500' : ''} required /></div>{validationErrors.email && (<p className="text-xs text-red-500">{validationErrors.email}</p>)}</div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Phone Number (11 digits)</Label><div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><Input type="tel" placeholder="11987654321" value={formData.phoneNumber} onChange={(e) => handlePhoneChange(e.target.value)} className={validationErrors.phoneNumber ? 'border-red-500' : ''} maxLength={11} required /></div>{validationErrors.phoneNumber && (<p className="text-xs text-red-500">{validationErrors.phoneNumber}</p>)}</div><div className="space-y-2"><Label>Date of Birth</Label><div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><Input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} className={validationErrors.dateOfBirth ? 'border-red-500' : ''} max={new Date().toISOString().split('T')[0]} required /></div>{validationErrors.dateOfBirth && (<p className="text-xs text-red-500">{validationErrors.dateOfBirth}</p>)}</div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Password</Label><div className="flex items-center gap-3"><Lock className="h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className={validationErrors.password ? 'border-red-500' : ''} required /></div>{validationErrors.password && (<p className="text-xs text-red-500">{validationErrors.password}</p>)}</div><div className="space-y-2"><Label>Confirm Password</Label><div className="flex items-center gap-3"><Lock className="h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className={validationErrors.confirmPassword ? 'border-red-500' : ''} required /></div>{validationErrors.confirmPassword && (<p className="text-xs text-red-500">{validationErrors.confirmPassword}</p>)}</div></div></div>

                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>) : ('Create Account')}</Button>
              </form>
              <div className="text-center text-sm text-muted-foreground pt-2">Already have an account? <button type="button" onClick={() => setActiveTab('login')} className="text-primary hover:underline font-medium">Sign in</button></div>
            </TabsContent>
          </Tabs>
          {onNavigate && (<div className="mt-6 pt-4 border-t border-border text-center"><Button variant="ghost" onClick={() => onNavigate('home')} className="text-sm">Continue as guest</Button></div>)}
        </CardContent>
      </Card>
    </div>
  );
}