import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

export default function TestApp() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">The Mane Review</h1>
          <p className="text-muted-foreground">Testing basic functionality</p>
        </div>

        {/* Test Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Count: {count}</p>
              <Button onClick={() => setCount(c => c + 1)}>
                Increment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Style Test */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Primary Colors</h3>
              <div className="space-y-2">
                <div className="w-full h-8 bg-primary rounded"></div>
                <div className="w-full h-8 bg-secondary rounded"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Typography</h3>
              <p className="text-muted-foreground">
                This is a test of the typography system.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Components</h3>
              <Button variant="outline" className="w-full">
                Test Button
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}