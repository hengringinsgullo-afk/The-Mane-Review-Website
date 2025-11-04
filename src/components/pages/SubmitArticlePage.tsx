import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { ArticleSubmissionForm } from '../ui/article-submission-form';

interface SubmitArticlePageProps {
  onNavigate: (page: string, data?: any) => void;
  user?: any;
}

export function SubmitArticlePage({ onNavigate, user }: SubmitArticlePageProps) {
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to submit articles.
        </p>
        <Button onClick={() => onNavigate('opinion')}>
          Back to Opinion
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate('opinion')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opinion
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-headline)' }}>
            Submit Your Article
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Share your insights on markets, investing, and economic thinking
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        <ArticleSubmissionForm
          userId={user.id}
          userName={user.name || user.email}
          userRole={user.role}
          onSuccess={() => onNavigate('opinion')}
          onCancel={() => onNavigate('opinion')}
        />
      </div>
    </div>
  );
}
