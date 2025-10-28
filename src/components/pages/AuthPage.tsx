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
      if (formData.isStPaulsMember && !formData.memberType) errors.memberType = 'Please select if you are staff or student';
      if (formData.isStPaulsMember && formData.memberType === 'student' && !formData.studentForm) errors.studentForm = 'Please select your form';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors({});
    if (field === 'isStPaulsMember' && !value) setFormData(prev => ({ ...prev, memberType: '', studentForm: '' }));
    if (field === 'memberType' && value === 'staff') setFormData(prev => ({ ...prev, studentForm: '' }));
  };

  const handlePhoneChange = (value: string) => handleInputChange('phoneNumber', formatBrazilianPhone(value));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await authHelpers.signIn(formData.email.trim(), formData.password);
      if (error) throw new Error(error.message || 'Invalid email or password');
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    setIsLoading(true);
    setError(null);
    try {
      let metadata: any = { full_name: formData.fullName };
      if (formData.email !== 'henriquegullo@themanereview.com') {
        metadata = { full_name: formData.fullName, phone_number: formData.phoneNumber, date_of_birth: formData.dateOfBirth, is_st_pauls_member: formData.isStPaulsMember, member_type: formData.memberType || null, student_form: formData.studentForm || null, role: formData.memberType === 'staff' ? 'Contributor' : 'Student' };
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
              <div className="text-center text-sm text-muted-foreground pt-2">Don't have an account? <button type="button" onClick={() => setActiveTab('signup')} className="text-primary hover:underline font-medium">Create one</button></div>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              {error && (<Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>)}
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-3"><h3 className="text-base font-semibold">Basic Information</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Full Name</Label><div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><Input type="text" placeholder="John Doe" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className={validationErrors.fullName ? 'border-red-500' : ''} required /></div>{validationErrors.fullName && (<p className="text-xs text-red-500">{validationErrors.fullName}</p>)}</div><div className="space-y-2"><Label>Email</Label><div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={validationErrors.email ? 'border-red-500' : ''} required /></div>{validationErrors.email && (<p className="text-xs text-red-500">{validationErrors.email}</p>)}</div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Phone Number (11 digits)</Label><div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><Input type="tel" placeholder="11987654321" value={formData.phoneNumber} onChange={(e) => handlePhoneChange(e.target.value)} className={validationErrors.phoneNumber ? 'border-red-500' : ''} maxLength={11} required /></div>{validationErrors.phoneNumber && (<p className="text-xs text-red-500">{validationErrors.phoneNumber}</p>)}</div><div className="space-y-2"><Label>Date of Birth</Label><div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><Input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} className={validationErrors.dateOfBirth ? 'border-red-500' : ''} max={new Date().toISOString().split('T')[0]} required /></div>{validationErrors.dateOfBirth && (<p className="text-xs text-red-500">{validationErrors.dateOfBirth}</p>)}</div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label>Password</Label><div className="flex items-center gap-3"><Lock className="h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} className={validationErrors.password ? 'border-red-500' : ''} required /></div>{validationErrors.password && (<p className="text-xs text-red-500">{validationErrors.password}</p>)}</div><div className="space-y-2"><Label>Confirm Password</Label><div className="flex items-center gap-3"><Lock className="h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className={validationErrors.confirmPassword ? 'border-red-500' : ''} required /></div>{validationErrors.confirmPassword && (<p className="text-xs text-red-500">{validationErrors.confirmPassword}</p>)}</div></div></div>
                <div className="space-y-3 border-t pt-4 mt-4"><h3 className="text-base font-semibold">St. Paul's School</h3><div className="flex items-center space-x-2"><Checkbox id="stPauls" checked={formData.isStPaulsMember} onCheckedChange={(checked) => handleInputChange('isStPaulsMember', checked)} /><Label htmlFor="stPauls" className="flex items-center gap-2 cursor-pointer"><School className="h-4 w-4" /><span>I am a member of St. Paul's School</span></Label></div>{formData.isStPaulsMember && (<div className="space-y-4 pl-6 border-l-2 border-primary/20"><div className="space-y-2"><Label>Member Type</Label><Select value={formData.memberType} onValueChange={(value) => handleInputChange('memberType', value)}><SelectTrigger className={validationErrors.memberType ? 'border-red-500' : ''}><SelectValue placeholder="Select member type" /></SelectTrigger><SelectContent><SelectItem value="staff"><div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>Staff</span></div></SelectItem><SelectItem value="student"><div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /><span>Student</span></div></SelectItem></SelectContent></Select>{validationErrors.memberType && (<p className="text-xs text-red-500">{validationErrors.memberType}</p>)}</div>{formData.memberType === 'student' && (<div className="space-y-2"><Label>Student Form</Label><Select value={formData.studentForm} onValueChange={(value) => handleInputChange('studentForm', value)}><SelectTrigger className={validationErrors.studentForm ? 'border-red-500' : ''}><SelectValue placeholder="Select your form" /></SelectTrigger><SelectContent>{['Form 3', 'Form 4', 'Form 5', 'Lower 6', 'Upper 6'].map((form) => (<SelectItem key={form} value={form}>{form}</SelectItem>))}</SelectContent></Select>{validationErrors.studentForm && (<p className="text-xs text-red-500">{validationErrors.studentForm}</p>)}</div>)}</div>)}</div>
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