import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar,
  School,
  GraduationCap,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield
} from 'lucide-react';
import { authHelpers, supabase } from '../../lib/supabase';
import { authSimple } from '../../lib/supabase-simple';
import { AdminSetupGuide } from '../ui/admin-setup-guide';

interface AuthPageProps {
  onAuthSuccess?: (user: any) => void;
  onNavigate?: (page: string) => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthPage({ onAuthSuccess, onNavigate, defaultTab = 'login' }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  // Update active tab when defaultTab prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    isStPaulsMember: false,
    memberType: '',
    studentForm: ''
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Check if user is already authenticated on mount and listen for auth changes
  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout | null = null;

    const checkAuthStatus = async () => {
      try {
        const session = await authHelpers.getSession();
        if (session?.user) {
          console.log('User already authenticated, redirecting...', session.user.email);
          setSuccess('Already logged in! Redirecting...');
          setIsLoading(false);

          // Call onAuthSuccess callback if provided
          if (onAuthSuccess) {
            onAuthSuccess(session.user);
          }

          // Navigate to home page
          if (onNavigate) {
            redirectTimeout = setTimeout(() => {
              onNavigate('home');
            }, 500);
          } else {
            redirectTimeout = setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    // Check initial auth status
    checkAuthStatus();

    // Listen for auth state changes
    let hasProcessedLogin = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthPage: Auth state change detected:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user && !hasProcessedLogin) {
        console.log('AuthPage: User signed in via auth state change');
        hasProcessedLogin = true;
        
        setIsLoading(false);
        setSuccess('Login successful! Redirecting...');
        setError(null);

        // Call onAuthSuccess callback and let App.tsx handle navigation
        if (onAuthSuccess) {
          console.log('AuthPage: Calling onAuthSuccess from auth state change');
          onAuthSuccess(session.user);
        } else if (onNavigate) {
          // Only navigate directly if no onAuthSuccess handler
          redirectTimeout = setTimeout(() => {
            console.log('AuthPage: Auth state change navigating to home (no onAuthSuccess)');
            onNavigate('home');
          }, 500);
        } else {
          redirectTimeout = setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    });

    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
      subscription.unsubscribe();
    };
  }, [onAuthSuccess, onNavigate]);

  // Brazilian phone number formatting and validation
  const formatBrazilianPhone = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Apply Brazilian phone format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const validateBrazilianPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    // Brazilian phones are 10 or 11 digits (with area code)
    return numbers.length === 10 || numbers.length === 11;
  };

  const validateForm = (isSignup: boolean = false) => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isSignup) {
      // Confirm password
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      // Full name
      if (formData.fullName.trim().length < 3) {
        errors.fullName = 'Please enter your full name';
      }

      // Phone number
      if (!validateBrazilianPhone(formData.phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid Brazilian phone number';
      }

      // Date of birth
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (!formData.dateOfBirth || age < 13 || age > 100) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }

      // St. Paul's validation
      if (formData.isStPaulsMember) {
        if (!formData.memberType) {
          errors.memberType = 'Please select if you are staff or student';
        }
        if (formData.memberType === 'student' && !formData.studentForm) {
          errors.studentForm = 'Please select your form';
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear member type and student form if not St. Paul's member
    if (field === 'isStPaulsMember' && !value) {
      setFormData(prev => ({
        ...prev,
        memberType: '',
        studentForm: ''
      }));
    }

    // Clear student form if switching from student to staff
    if (field === 'memberType' && value === 'staff') {
      setFormData(prev => ({
        ...prev,
        studentForm: ''
      }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatBrazilianPhone(value);
    handleInputChange('phoneNumber', formatted);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Attempting login with:', formData.email);
      // Use simple auth to avoid hanging
      const { data, error } = await authSimple.signIn(
        formData.email,
        formData.password
      );

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Auth error details:', {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name
        });
        
        // Handle specific Supabase errors
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (error.message?.includes('Email not confirmed')) {
          throw new Error('Please confirm your email before logging in.');
        } else if (error.message?.includes('rate limit')) {
          throw new Error('Too many login attempts. Please try again later.');
        }
        
        throw error;
      }

      if (!data || !data.user) {
        console.error('No user data returned from successful auth');
        throw new Error('Authentication succeeded but no user data was returned.');
      }

      console.log('Login successful, user data:', {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role
      });
      
      setSuccess('Login successful! Redirecting...');
      
      // Stop loading state
      setIsLoading(false);
      
      // Call onAuthSuccess callback if provided
      // Let App.tsx handle the navigation
      if (onAuthSuccess) {
        console.log('Calling onAuthSuccess to let App handle navigation');
        onAuthSuccess(data.user);
      } else {
        // Fallback: if no onAuthSuccess, try to navigate directly
        console.log('No onAuthSuccess callback, navigating directly');
        if (onNavigate) {
          setTimeout(() => {
            onNavigate('home');
          }, 500);
        } else {
          // Last resort: reload the page
          console.log('No navigation methods available, reloading page');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }

    } catch (err) {
        console.error('Login error:', err);
        setIsLoading(false); // Make sure to stop loading on error
        const errorMessage = err instanceof Error ? err.message : 'Failed to login';
        
        // Special handling for admin account
        if (formData.email === 'henriquegullo@themanereview.com' && errorMessage.includes('Invalid login credentials')) {
          setError('Admin account not found. Please create the account using the "Create Admin Account" button below.');
          setShowAdminSetup(true);
        } else {
          setError(errorMessage);
        }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsLoading(true);
    setError(null);

    try {
      // Start with minimal metadata for admin account
      let metadata: any = {
        full_name: formData.fullName
      };

      // Only add additional fields for non-admin accounts
      if (formData.email !== 'henriquegullo@themanereview.com') {
        metadata = {
          full_name: formData.fullName,
          phone_number: formData.phoneNumber.replace(/\D/g, ''), // Store only numbers
          date_of_birth: formData.dateOfBirth,
          is_st_pauls_member: formData.isStPaulsMember,
          member_type: formData.memberType || null,
          student_form: formData.studentForm || null,
          role: formData.memberType === 'staff' ? 'Contributor' : 'Student'
        };
      }

      console.log('Attempting signup with metadata:', metadata);

      const { data, error } = await authHelpers.signUp(
        formData.email,
        formData.password,
        metadata
      );

      if (error) {
        console.error('Signup error details:', error);
        
        // Check for specific Supabase errors
        if (error.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please login instead.');
        } else if (error.message.includes('Password')) {
          throw new Error('Password must be at least 6 characters long.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        
        throw error;
      }

      if (formData.email === 'henriquegullo@themanereview.com') {
        setSuccess('Admin account created successfully! You can now login with your credentials.');
      } else {
        setSuccess('Account created successfully! Please check your email to verify your account.');
      }
      setActiveTab('login');
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phoneNumber: '',
        dateOfBirth: '',
        isStPaulsMember: false,
        memberType: '',
        studentForm: ''
      });

    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof Error) {
        setError(`Signup failed: ${err.message}`);
      } else {
        setError('Failed to create account. Please check the console for details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const studentForms = [
    'Form 3',
    'Form 4', 
    'Form 5',
    'Lower 6',
    'Upper 6'
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">The Mane Review</CardTitle>
          <CardDescription>
            Sign in or create an account to access exclusive content
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full mb-6 gap-4 bg-transparent p-0">
              <TabsTrigger 
                value="login"
                className="flex-1 transition-colors duration-200"
                style={{ 
                  borderColor: '#000', 
                  borderWidth: '2px', 
                  borderStyle: 'solid',
                  backgroundColor: activeTab === 'login' ? '#d1d5db' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'login') {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'login') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="flex-1 transition-colors duration-200"
                style={{ 
                  borderColor: '#000', 
                  borderWidth: '2px', 
                  borderStyle: 'solid',
                  backgroundColor: activeTab === 'signup' ? '#d1d5db' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'signup') {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'signup') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4" forceMount={activeTab === 'login'} hidden={activeTab !== 'login'}>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-600 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {formData.email === 'henriquegullo@themanereview.com' && (
                <Alert className="border-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Admin Account Detected</strong><br />
                    You're logging in as an administrator. You'll have full access to the admin dashboard.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`flex-1 ${validationErrors.email ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-red-500">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`flex-1 ${validationErrors.password ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-red-500">{validationErrors.password}</p>
                )}
              </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm text-muted-foreground pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Create one
                </button>
              </div>

              {showAdminSetup && (
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin Setup Required</span>
                    </h3>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAdminSetup(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    The admin account doesn't exist yet. Create it by following these steps:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveTab('signup');
                        setFormData(prev => ({
                          ...prev,
                          email: 'henriquegullo@themanereview.com',
                          password: 'H3nr1qu3',
                          confirmPassword: 'H3nr1qu3',
                          fullName: 'Henrique Gullo',
                          phoneNumber: '(11) 99999-9999',
                          dateOfBirth: '1990-01-01',
                          isStPaulsMember: false,
                          memberType: '',
                          studentForm: ''
                        }));
                        setShowAdminSetup(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Create Admin Account
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAdminSetup(false);
                        setFormData(prev => ({
                          ...prev,
                          email: 'henriquegullo@themanereview.com',
                          password: 'H3nr1qu3'
                        }));
                      }}
                    >
                      Try Login Again
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center pt-3 border-t border-border space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      email: 'henriquegullo@themanereview.com',
                      password: 'H3nr1qu3'
                    }));
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors block w-full"
                >
                  Fill Admin Credentials
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setFormData(prev => ({
                      ...prev,
                      email: 'henriquegullo@themanereview.com',
                      password: 'H3nr1qu3',
                      confirmPassword: 'H3nr1qu3',
                      fullName: 'Henrique Gullo'
                    }));
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors block w-full"
                >
                  Create Admin Account →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('authtest')}
                  className="text-xs text-red-600 hover:text-red-800 transition-colors block w-full"
                >
                  🔧 Debug Auth Issues
                </button>
              </div>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4" forceMount={activeTab === 'signup'} hidden={activeTab !== 'signup'}>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {formData.email === 'henriquegullo@themanereview.com' && (
                <Alert className="border-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Admin Account Registration</strong><br />
                    You're creating the administrator account. This account will have full access to the admin dashboard and all management features.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-base font-semibold">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className={`flex-1 ${validationErrors.fullName ? 'border-red-500' : ''}`}
                          required
                        />
                      </div>
                      {validationErrors.fullName && (
                        <p className="text-xs text-red-500">{validationErrors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`flex-1 ${validationErrors.email ? 'border-red-500' : ''}`}
                          required
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="text-xs text-red-500">{validationErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Brazilian)</Label>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(11) 98765-4321"
                          value={formData.phoneNumber}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className={`flex-1 ${validationErrors.phoneNumber ? 'border-red-500' : ''}`}
                          maxLength={15}
                          required
                        />
                      </div>
                      {validationErrors.phoneNumber && (
                        <p className="text-xs text-red-500">{validationErrors.phoneNumber}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="dob"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className={`flex-1 ${validationErrors.dateOfBirth ? 'border-red-500' : ''}`}
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      {validationErrors.dateOfBirth && (
                        <p className="text-xs text-red-500">{validationErrors.dateOfBirth}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`flex-1 ${validationErrors.password ? 'border-red-500' : ''}`}
                          required
                        />
                      </div>
                      {validationErrors.password && (
                        <p className="text-xs text-red-500">{validationErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`flex-1 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                          required
                        />
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="text-xs text-red-500">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4 mt-4">
                  <h3 className="text-base font-semibold">St. Paul's School</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="stPauls"
                      checked={formData.isStPaulsMember}
                      onCheckedChange={(checked) => 
                        handleInputChange('isStPaulsMember', checked)
                      }
                    />
                    <Label 
                      htmlFor="stPauls" 
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <School className="h-4 w-4" />
                      <span>I am a member of St. Paul's School</span>
                    </Label>
                  </div>

                  {formData.isStPaulsMember && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                      <div className="space-y-2">
                        <Label>Member Type</Label>
                        <Select 
                          value={formData.memberType}
                          onValueChange={(value) => handleInputChange('memberType', value)}
                        >
                          <SelectTrigger className={validationErrors.memberType ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select member type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                <span>Staff</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="student">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                <span>Student</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {validationErrors.memberType && (
                          <p className="text-xs text-red-500">{validationErrors.memberType}</p>
                        )}
                      </div>

                      {formData.memberType === 'student' && (
                        <div className="space-y-2">
                          <Label>Student Form</Label>
                          <Select 
                            value={formData.studentForm}
                            onValueChange={(value) => handleInputChange('studentForm', value)}
                          >
                            <SelectTrigger className={validationErrors.studentForm ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select your form" />
                            </SelectTrigger>
                            <SelectContent>
                              {studentForms.map((form) => (
                                <SelectItem key={form} value={form}>
                                  {form}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {validationErrors.studentForm && (
                            <p className="text-xs text-red-500">{validationErrors.studentForm}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </div>

              {formData.email !== 'henriquegullo@themanereview.com' && (
                <div className="text-center pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        email: 'henriquegullo@themanereview.com',
                        password: 'H3nr1qu3',
                        confirmPassword: 'H3nr1qu3',
                        fullName: 'Henrique Gullo',
                        phoneNumber: '(11) 99999-9999',
                        dateOfBirth: '1990-01-01',
                        isStPaulsMember: false,
                        memberType: '',
                        studentForm: ''
                      }));
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Quick Fill Admin Account Info
                  </button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {onNavigate && (
            <div className="mt-6 pt-4 border-t border-border text-center">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('home')}
                className="text-sm"
              >
                Continue as guest
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
