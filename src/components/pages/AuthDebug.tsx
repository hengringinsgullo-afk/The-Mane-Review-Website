import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

export function AuthDebug() {
  const [status, setStatus] = useState<string[]>(['Ready to test...']);
  const [loading, setLoading] = useState(false);
  
  const addStatus = (message: string) => {
    const timestamp = new Date().toISOString();
    setStatus(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[AUTH DEBUG] ${message}`);
  };
  
  const testDirectAuth = async () => {
    setLoading(true);
    setStatus(['Starting authentication test...']);
    
    try {
      addStatus('Getting Supabase instance...');
      addStatus(`Supabase URL: ${supabase.auth.url}`);
      
      addStatus('Calling signInWithPassword...');
      const startTime = Date.now();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'henriquegullo@themanereview.com',
        password: 'H3nr1qu3'
      });
      
      const duration = Date.now() - startTime;
      addStatus(`Response received in ${duration}ms`);
      
      if (error) {
        addStatus(`ERROR: ${error.message}`);
        addStatus(`Error code: ${error.status || 'none'}`);
      } else if (data?.user) {
        addStatus(`SUCCESS: User ${data.user.email} authenticated`);
        addStatus(`User ID: ${data.user.id}`);
        addStatus(`Session: ${data.session ? 'Created' : 'No session'}`);
      } else {
        addStatus('ERROR: No data or error returned');
      }
    } catch (err: any) {
      addStatus(`EXCEPTION: ${err.message}`);
      addStatus(`Stack: ${err.stack}`);
    } finally {
      setLoading(false);
    }
  };
  
  const testConnection = async () => {
    setLoading(true);
    setStatus(['Testing Supabase connection...']);
    
    try {
      addStatus('Testing database query...');
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        addStatus(`Database error: ${error.message}`);
      } else {
        addStatus('Database connection: OK');
      }
      
      addStatus('Testing auth health...');
      const session = await supabase.auth.getSession();
      addStatus(`Current session: ${session.data.session ? 'Active' : 'None'}`);
      
    } catch (err: any) {
      addStatus(`Connection test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testDirectAuth} 
              disabled={loading}
              className="flex-1"
            >
              Test Authentication
            </Button>
            <Button 
              onClick={testConnection} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Test Connection
            </Button>
          </div>
          
          <Alert>
            <AlertDescription>
              <div className="font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
                {status.map((msg, idx) => (
                  <div key={idx} className={msg.includes('ERROR') ? 'text-red-600' : msg.includes('SUCCESS') ? 'text-green-600' : ''}>
                    {msg}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}