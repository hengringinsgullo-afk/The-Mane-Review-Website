import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { supabase, adminBypass } from '../../lib/supabase';

export function AuthTest() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSignup = async () => {
    try {
      setError(null);
      setResult(null);
      
      console.log('Testing signup...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setError(`Signup error: ${error.message}`);
        console.error('Signup error:', error);
      } else {
        setResult(data);
        console.log('Signup success:', data);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      console.error('Unexpected error:', err);
    }
  };

  const testLogin = async () => {
    try {
      setError(null);
      setResult(null);
      
      console.log('Testing login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(`Login error: ${error.message}`);
        console.error('Login error:', error);
      } else {
        setResult(data);
        console.log('Login success:', data);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      console.error('Unexpected error:', err);
    }
  };

  const checkAuth = async () => {
    try {
      setError(null);
      setResult(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      setResult({ session, user });
      console.log('Auth status:', { session, user });
    } catch (err) {
      setError(`Error checking auth: ${err}`);
      console.error('Error checking auth:', err);
    }
  };

  const testAdminSetup = async () => {
    try {
      setError(null);
      setResult(null);
      
      // Test with minimal data first
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@themanereview.com',
        password: 'H3nr1qu3',
        options: {
          data: {
            full_name: 'Henrique Gullo'
          }
        }
      });
      
      if (error) {
        setError(`Admin setup error: ${error.message}`);
        console.error('Admin setup error:', error);
      } else {
        setResult(data);
        console.log('Admin setup success:', data);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      console.error('Unexpected error:', err);
    }
  };

  const testAdminBypass = async () => {
    try {
      setError(null);
      setResult(null);
      
      console.log('Testing admin bypass...');
      const result = await adminBypass.checkAdminCredentials(
        'admin@themanereview.com',
        'H3nr1qu3'
      );
      
      if (result.success) {
        setResult(result);
        console.log('Admin bypass success:', result);
      } else {
        setError('Admin bypass failed');
        console.error('Admin bypass failed:', result);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      console.error('Unexpected error:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Auth Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testSignup}>Test Signup</Button>
            <Button onClick={testLogin} variant="outline">Test Login</Button>
            <Button onClick={checkAuth} variant="outline">Check Auth Status</Button>
            <Button onClick={testAdminSetup} variant="secondary">
              Test Admin Setup
            </Button>
            <Button onClick={testAdminBypass} variant="destructive">
              Test Admin Bypass
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card className="bg-muted">
              <CardContent className="p-4">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Supabase URL: {`https://${projectId}.supabase.co`}</p>
            <p>Check console for detailed logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Import this to use the projectId
import { projectId } from '../../utils/supabase/info';
