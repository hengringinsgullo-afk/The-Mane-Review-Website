import React from 'react';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Shield, User, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminSetupGuideProps {
  onCreateAdmin: () => void;
  onLogin: () => void;
}

export function AdminSetupGuide({ onCreateAdmin, onLogin }: AdminSetupGuideProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span>Admin Setup Required</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-600">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            The admin account needs to be created first before you can login. 
            Follow the steps below to set up the administrator account.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">1</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Create Admin Account</h4>
              <p className="text-sm text-muted-foreground">
                Register with the admin credentials to create the account
              </p>
            </div>
            <Button size="sm" onClick={onCreateAdmin}>
              <User className="h-4 w-4 mr-2" />
              Register
            </Button>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">2</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Login as Admin</h4>
              <p className="text-sm text-muted-foreground">
                Once created, login to access the admin dashboard
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={onLogin}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Login
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Admin Credentials
          </h4>
          <div className="space-y-1 text-sm font-mono">
            <div><strong>Email:</strong> henriquegullo@themanereview.com</div>
            <div><strong>Password:</strong> H3nr1qu3</div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            After registration, the account will automatically receive administrator privileges
            and access to the admin dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
