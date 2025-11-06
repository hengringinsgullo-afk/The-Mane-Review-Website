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
import { PenTool, Upload, CheckCircle2, AlertCircle, Eye, Save, Sparkles, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { articleOperations, guidelinesOperations, supabase, type DatabaseArticle } from '../../lib/supabase';
import { generateArticleMetadata, isGeminiConfigured } from '../../lib/gemini-content-service';
import { toast } from 'sonner';
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
  const [requestAiImage, setRequestAiImage] = useState(false);
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Image is too large (${fileSizeMB}MB). Maximum size is 5MB`);
      return;
    }

    toast.success(`Image selected: ${file.name} (${fileSizeMB}MB)`);
    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // If user uploads an image, disable AI generation
    if (requestAiImage) {
      setRequestAiImage(false);
      toast.info('Switched to manual image upload');
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    toast.info('Image removed. You can upload a new one or use AI generation.');
  };

  const uploadImageToStorage = async (articleSlug: string): Promise<string | null> => {
    if (!uploadedImage) return null;

    setUploadingImage(true);
    try {
      const fileName = `ai-generated/${articleSlug}.png`;
      
      // Convert image to PNG if needed
      const imageBuffer = await uploadedImage.arrayBuffer();
      
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) {
        console.error('Image upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
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

  const handleGenerateMetadata = async () => {
    if (!formData.body || formData.body.trim().length < 100) {
      toast.error('Please write at least 100 characters of content first');
      return;
    }

    if (!isGeminiConfigured()) {
      toast.error('AI generation is not configured. Please contact an administrator.');
      return;
    }

    setGeneratingMetadata(true);
    try {
      toast.info('Generating title and tags with AI...', { duration: 2000 });
      
      const suggestions = await generateArticleMetadata(
        formData.body,
        formData.region,
        formData.category
      );

      setFormData(prev => ({
        ...prev,
        title: suggestions.title,
        tags: suggestions.tags.join(', '),
        excerpt: suggestions.excerpt || prev.excerpt
      }));

      toast.success('Title and tags generated successfully!');
    } catch (error) {
      console.error('[ArticleSubmissionForm] Generate metadata error:', error);
      toast.error('Failed to generate metadata. Please try again.');
    } finally {
      setGeneratingMetadata(false);
    }
  };

  const handleGenerateTitle = async () => {
    if (!formData.body || formData.body.trim().length < 100) {
      toast.error('Please write at least 100 characters of content first');
      return;
    }

    if (!isGeminiConfigured()) {
      toast.error('AI generation is not configured. Please contact an administrator.');
      return;
    }

    setGeneratingTitle(true);
    try {
      toast.info('Generating title with AI...', { duration: 2000 });
      
      const suggestions = await generateArticleMetadata(
        formData.body,
        formData.region,
        formData.category
      );

      setFormData(prev => ({
        ...prev,
        title: suggestions.title
      }));

      toast.success('Title generated successfully!');
    } catch (error) {
      console.error('[ArticleSubmissionForm] Generate title error:', error);
      toast.error('Failed to generate title. Please try again.');
    } finally {
      setGeneratingTitle(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!formData.body || formData.body.trim().length < 100) {
      toast.error('Please write at least 100 characters of content first');
      return;
    }

    if (!isGeminiConfigured()) {
      toast.error('AI generation is not configured. Please contact an administrator.');
      return;
    }

    setGeneratingTags(true);
    try {
      toast.info('Generating tags with AI...', { duration: 2000 });
      
      const suggestions = await generateArticleMetadata(
        formData.body,
        formData.region,
        formData.category
      );

      setFormData(prev => ({
        ...prev,
        tags: suggestions.tags.join(', ')
      }));

      toast.success('Tags generated successfully!');
    } catch (error) {
      console.error('[ArticleSubmissionForm] Generate tags error:', error);
      toast.error('Failed to generate tags. Please try again.');
    } finally {
      setGeneratingTags(false);
    }
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

      const articleData = {
        title: formData.title,
        excerpt: formData.excerpt || generateExcerpt(formData.body),
        body: formData.body,
        region: formData.region,
        category: formData.category,
        request_ai_image: requestAiImage && !uploadedImage, // Only request AI if no manual upload
        ai_image_status: (requestAiImage && !uploadedImage) ? ('pending' as const) : null,
        tags: tagsArray,
        author_name: formData.author_name,
        author_id: userProfile.id, // Use users.id (foreign key to users table)
        author_role: (userRole === 'Admin' || userRole === 'Editor') ? userRole : 'Student',
        submission_notes: formData.submission_notes,
        est_read_min: estimateReadingTime(formData.body),
        status: (saveAsDraft ? 'draft' : 'review') as 'draft' | 'review'
      } as Partial<DatabaseArticle>;

      console.log('[ArticleSubmissionForm] Submitting article with AI image request:', {
        request_ai_image: requestAiImage && !uploadedImage,
        ai_image_status: (requestAiImage && !uploadedImage) ? 'pending' : null,
        has_uploaded_image: !!uploadedImage,
        title: articleData.title
      });

      let submittedArticle;
      if (existingArticle) {
        submittedArticle = await articleOperations.updateArticle(existingArticle.id, articleData);
      } else {
        submittedArticle = await articleOperations.submitArticle(articleData);
      }

      // Upload image if provided
      if (uploadedImage && submittedArticle) {
        console.log('[ArticleSubmissionForm] Uploading user image...');
        toast.info('Uploading your image to storage...');
        
        const imageUrl = await uploadImageToStorage(submittedArticle.slug);
        
        if (imageUrl) {
          // Update article with cover image URL
          await articleOperations.updateArticle(submittedArticle.id, {
            cover_image: imageUrl
          });
          console.log('[ArticleSubmissionForm] Image uploaded successfully:', imageUrl);
          toast.success('Image uploaded successfully!');
        }
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
      <Card className="w-full">
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
    <div className="w-full space-y-6">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Article Title</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateTitle}
                  disabled={generatingTitle || !formData.body || formData.body.length < 100}
                  className="h-7 text-xs"
                >
                  {generatingTitle ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter your article title or generate with AI"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateTags}
                  disabled={generatingTags || !formData.body || formData.body.length < 100}
                  className="h-7 text-xs"
                >
                  {generatingTags ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
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

            {/* AI Metadata Generation */}
            {isGeminiConfigured() && (
              <Card className="border-primary/20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-primary">AI-Powered Metadata</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Let our AI analyse your article and generate a professional title and relevant tags in British English.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Write at least 100 characters of content first, then click to generate.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleGenerateMetadata}
                      disabled={generatingMetadata || !formData.body || formData.body.length < 100}
                      className="shrink-0"
                    >
                      {generatingMetadata ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Title & Tags
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Image Upload Section */}
            <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Featured Image
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose how you want to add a featured image to your article
                  </p>
                </div>

                {/* Manual Upload Option */}
                <div className="space-y-3">
                  <Label className="font-semibold">Upload Your Own Image</Label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage || !!uploadedImage}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: 1200x630px, max 5MB. Supports JPG, PNG, WebP
                      </p>
                    </div>
                  </div>

                  {/* Image Preview with Success Message */}
                  {imagePreview && (
                    <div className="space-y-3">
                      <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          <strong>Image uploaded successfully!</strong> Your custom image will be used as the featured image for this article.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full md:max-w-md rounded-lg border-2 border-green-500/50 shadow-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 shadow-lg"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-md text-xs">
                          {uploadedImage?.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                {!uploadedImage && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    {/* AI Generation Option */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="request_ai_image"
                        checked={requestAiImage}
                        onChange={(e) => setRequestAiImage(e.target.checked)}
                        disabled={!!uploadedImage}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <Label htmlFor="request_ai_image" className="cursor-pointer font-semibold">
                          ✨ Generate Featured Image with AI
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Our AI will automatically create a professional, custom image for your article after it's approved for publication. 
                          The image will be generated using Google's Gemini AI based on your article's content.
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">How it works:</span> After editorial approval, our AI analyses your article 
                          and generates a unique, high-quality featured image that captures the essence of your content.
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
