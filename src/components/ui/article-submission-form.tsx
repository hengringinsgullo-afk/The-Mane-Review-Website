import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Label } from './label';
import { PenTool, Upload, CheckCircle2, AlertCircle, Eye, Save } from 'lucide-react';
import { articleOperations, guidelinesOperations, supabase, type DatabaseArticle } from '../../lib/supabase';
import type { Region } from '../../lib/types';

interface ArticleSubmissionFormProps {
  userId?: string;
  userName?: string;
  userRole?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingArticle?: DatabaseArticle;
}

interface SubmissionGuideline {
  id: string;
  title: string;
  content: string;
  category: string;
  order_index: number;
}

export function ArticleSubmissionForm({ userId, userName, userRole, onSuccess, onCancel, existingArticle }: ArticleSubmissionFormProps) {
  const [formData, setFormData] = useState({
    title: existingArticle?.title || '',
    excerpt: existingArticle?.excerpt || '',
    body: existingArticle?.body || '',
    region: (existingArticle?.region as Region) || 'USA' as Region,
    category: existingArticle?.category || 'Opinion' as const,
    tags: existingArticle?.tags?.join(', ') || '',
    submission_notes: existingArticle?.submission_notes || '',
    author_name: existingArticle?.author_name || userName || '',
    author_id: existingArticle?.author_id || userId || '',
    est_read_min: existingArticle?.est_read_min || 5
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidelines, setGuidelines] = useState<SubmissionGuideline[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = formData.body.trim().split(/\s+/).length;
    setWordCount(formData.body.trim() === '' ? 0 : words);
  }, [formData.body]);

  useEffect(() => {
    loadGuidelines();
  }, []);

  const loadGuidelines = async () => {
    try {
      const data = await guidelinesOperations.getActiveGuidelines();
      setGuidelines(data || []);
    } catch (err) {
      console.error('Failed to load guidelines:', err);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.body.trim()) return 'Article content is required';
    if (!formData.author_name.trim()) return 'Author name is required';
    if (wordCount > 2000) return 'Article must be less than 2000 words';
    return null;
  };

  const estimateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const avgWordsPerMinute = 200;
    return Math.max(1, Math.round(words / avgWordsPerMinute));
  };

  const generateExcerpt = (text: string) => {
    const words = text.trim().split(/\s+/).slice(0, 30);
    return words.join(' ') + (words.length >= 30 ? '...' : '');
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    console.log('[ArticleSubmissionForm] Submit started', { saveAsDraft, wordCount });
    setLoading(true);
    setError(null);

    try {
      const validationError = validateForm();
      console.log('[ArticleSubmissionForm] Validation result:', validationError);
      if (validationError && !saveAsDraft) {
        setError(validationError);
        setLoading(false);
        return;
      }

      // Get the current user's profile from database
      console.log('[ArticleSubmissionForm] Getting auth user...');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      console.log('[ArticleSubmissionForm] Auth user:', authUser?.email, authError);
      if (authError || !authUser) {
        throw new Error('You must be logged in to submit articles');
      }

      // Get the users.id from the users table using auth_id
      console.log('[ArticleSubmissionForm] Getting user profile for auth_id:', authUser.id);
      let { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single();

      console.log('[ArticleSubmissionForm] User profile:', userProfile, profileError);
      
      // If profile doesn't exist, try to create it automatically
      if (profileError || !userProfile) {
        console.log('[ArticleSubmissionForm] Profile not found, attempting to create...');
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              auth_id: authUser.id,
              email: authUser.email,
              name: formData.author_name || authUser.email?.split('@')[0] || 'User',
              role: 'Student'
            })
            .select('id')
            .single();

          if (createError) {
            console.error('[ArticleSubmissionForm] Failed to create profile:', createError);
            throw new Error('Unable to create user profile. Please try logging out and back in.');
          }
          
          userProfile = newProfile;
          console.log('[ArticleSubmissionForm] Profile created successfully:', userProfile);
        } catch (createErr) {
          console.error('[ArticleSubmissionForm] Profile creation failed:', createErr);
          throw new Error('User profile not found. Please refresh the page and try again.');
        }
      }

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const articleData: Partial<DatabaseArticle> = {
        title: formData.title,
        excerpt: formData.excerpt || generateExcerpt(formData.body),
        body: formData.body,
        region: formData.region,
        category: formData.category,
        tags: tagsArray,
        author_name: formData.author_name,
        author_id: userProfile.id, // Use users.id (foreign key to users table)
        author_role: (userRole === 'Admin' || userRole === 'Editor') ? userRole : 'Student',
        submission_notes: formData.submission_notes,
        est_read_min: estimateReadingTime(formData.body),
        status: saveAsDraft ? 'draft' : 'review'
      };

      console.log('[ArticleSubmissionForm] Submitting article:', articleData);

      if (existingArticle) {
        await articleOperations.updateArticle(existingArticle.id, articleData);
      } else {
        await articleOperations.submitArticle(articleData);
      }

      console.log('[ArticleSubmissionForm] Article submitted successfully!');
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);

    } catch (err) {
      console.error('[ArticleSubmissionForm] Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit article');
    } finally {
      setLoading(false);
    }
  };

  const getWordCountColor = () => {
    if (wordCount > 2000) return 'text-orange-600';
    if (wordCount >= 800 && wordCount <= 1500) return 'text-green-600';
    return 'text-blue-600';
  };

  const groupedGuidelines = guidelines.reduce((acc, guideline) => {
    const category = guideline.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(guideline);
    return acc;
  }, {} as Record<string, SubmissionGuideline[]>);

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Article Submitted Successfully!</h3>
          <p className="text-muted-foreground mb-4">
            Your article has been submitted for review. You'll receive an email notification when it's reviewed.
          </p>
          <Button onClick={onSuccess}>Continue</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Guidelines Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PenTool className="h-5 w-5 text-primary" />
            <span>Submission Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedGuidelines).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm uppercase text-muted-foreground">
                  {category}
                </h4>
                {items.map(guideline => (
                  <div key={guideline.id} className="text-sm">
                    <p className="font-medium">{guideline.title}</p>
                    <p className="text-muted-foreground text-xs">{guideline.content}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {existingArticle ? 'Edit Article' : 'Submit Article for Review'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author_name">Your Name</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => handleInputChange('author_name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Opinion">Opinion</SelectItem>
                    <SelectItem value="Markets">Markets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter your article title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region Focus</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => handleInputChange('region', value as Region)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="South America">South America</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="e.g., Investment, Finance, Markets"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Article Content</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getWordCountColor()}>
                    {wordCount} words
                  </Badge>
                  <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{formData.title || 'Article Preview'}</DialogTitle>
                        <DialogDescription>
                          Preview how your article will appear to readers
                        </DialogDescription>
                      </DialogHeader>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">{formData.body}</div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                placeholder="Write your article content here..."
                rows={15}
                required
              />
              <div className="text-xs text-muted-foreground">
                Recommended: 800-1500 words. Maximum: 2000 words. Current: {wordCount} words
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submission_notes">Notes for Editors (optional)</Label>
              <Textarea
                id="submission_notes"
                value={formData.submission_notes}
                onChange={(e) => handleInputChange('submission_notes', e.target.value)}
                placeholder="Any additional notes or context for the editorial team..."
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button 
                type="button" 
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button type="submit" disabled={loading}>
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
