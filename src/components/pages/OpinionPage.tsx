import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArticleCard } from '../ui/article-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PenTool, GraduationCap, Users, ExternalLink, FileText, User } from 'lucide-react';
import { mockArticles } from '../../lib/data';
import { ArticleSubmissionForm } from '../ui/article-submission-form';
import { StudentSubmissions } from '../ui/student-submissions';
import { articleOperations, type DatabaseArticle } from '../../lib/supabase';
import type { Article } from '../../lib/types';

interface OpinionPageProps {
  onNavigate: (page: string, data?: any) => void;
  user?: any;
}

type SortOption = 'latest' | 'popular';

export function OpinionPage({ onNavigate, user }: OpinionPageProps) {
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPublishedArticles();
  }, []);

  const loadPublishedArticles = async () => {
    try {
      setLoading(true);
      const dbArticles = await articleOperations.getPublishedArticles();
      
      // Convert database articles to Article type for compatibility
      const convertedArticles: Article[] = dbArticles
        .filter(article => article.category === 'Opinion')
        .map(dbArticle => ({
          id: dbArticle.id,
          slug: dbArticle.slug,
          title: dbArticle.title,
          excerpt: dbArticle.excerpt || '',
          body: dbArticle.body,
          coverImage: dbArticle.cover_image,
          coverAlt: dbArticle.cover_alt,
          region: dbArticle.region as any,
          category: dbArticle.category as any,
          tags: dbArticle.tags,
          authorId: dbArticle.author_id,
          authorRole: dbArticle.author_role as any,
          status: 'published' as const,
          publishedAt: dbArticle.published_at ? new Date(dbArticle.published_at) : new Date(),
          updatedAt: new Date(dbArticle.updated_at),
          featured: dbArticle.featured,
          estReadMin: dbArticle.est_read_min,
          views: dbArticle.views
        }));
      
      setPublishedArticles(convertedArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
      // Fallback to mock data if database fails
      setPublishedArticles(mockArticles.filter(article => 
        article.status === 'published' && article.category === 'Opinion'
      ));
    } finally {
      setLoading(false);
    }
  };

  // Combine database articles with mock articles for display
  const allOpinionArticles = [...publishedArticles, ...mockArticles.filter(article => 
    article.status === 'published' && 
    article.category === 'Opinion' &&
    !publishedArticles.some(pub => pub.id === article.id)
  )].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.views || 0) - (a.views || 0);
    }
    return new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime();
  });

  const articlesForGrid = showAll ? allOpinionArticles : allOpinionArticles.slice(0, 6);
  const seenArticleIds = new Set(articlesForGrid.map(article => article.id));

  const studentArticles = allOpinionArticles
    .filter(article => article.authorRole === 'Student' && !seenArticleIds.has(article.id));

  const otherOpinions = allOpinionArticles
    .filter(article => article.authorRole !== 'Student' && !seenArticleIds.has(article.id));

  const browseAllLabel = showAll ? 'Show Less' : 'Browse All';

  const renderBrowseTab = () => (
    <>
      {/* New Articles */}
      <section className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-4">
            <h2
              className="text-3xl font-bold text-primary"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              New Articles
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Explore the latest finance and investing perspectives from our St. Paul's contributors before diving into the full archive.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            <Select value={sortBy} onValueChange={(value: SortOption) => {
              setShowAll(false);
              setSortBy(value);
            }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort articles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Newest first</SelectItem>
                <SelectItem value="popular">Most read
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowAll(prev => !prev)}
            >
              {browseAllLabel}
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-10 text-center">
            <CardContent>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </CardContent>
          </Card>
        ) : articlesForGrid.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articlesForGrid.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={(slug) => onNavigate('article', { slug })}
              />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <CardContent>
              <div className="space-y-5">
                <PenTool className="h-12 w-12 text-muted-foreground mx-auto" />
                <h4 className="text-lg font-medium">No opinion pieces yet</h4>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're building our opinion section with fresh perspectives from student contributors.
                  Check back soon for thoughtful analysis on markets and investing.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                  <Button variant="outline" onClick={() => setActiveTab('submit')}>
                    <PenTool className="h-4 w-4 mr-2" />
                    Submit an Article
                  </Button>
                  <Button variant="ghost" onClick={() => onNavigate('home')}>
                    Read Latest News
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {studentArticles.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-medium flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
              <span>More from our student contributors</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studentArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={(slug) => onNavigate('article', { slug })}
                />
              ))}
            </div>
          </div>
        )}

        {otherOpinions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Editorial Perspectives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherOpinions.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={(slug) => onNavigate('article', { slug })}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Student Spotlight */}
      <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-secondary" />
            <span>Student Contributors</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our opinion section elevates thoughtful analysis and original investment takes from St. Paul's School students.
            These voices bring an academic rigor and first-hand perspective to complex financial topics.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-secondary text-secondary-foreground">
              <Users className="h-3 w-3 mr-1" />
              Student Editorial Programme
            </Badge>
            <Badge variant="outline">Youth Perspectives</Badge>
            <Badge variant="outline">Educational Content</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Submission Guidelines */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PenTool className="h-5 w-5 text-primary" />
            <span>Contribute Your Voice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">For Students</h4>
              <p className="text-sm text-muted-foreground mb-3">
                St. Paul's School students can submit opinion pieces on financial markets,
                investment trends, and economic policy for review and publication.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 800-1500 word limit</li>
                <li>• Original analysis required</li>
                <li>• Proper source citations</li>
                <li>• Subject to editorial review</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Submission Process</h4>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('submit')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Submission Guidelines
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('submit')}>
                  <PenTool className="h-4 w-4 mr-2" />
                  Submit Article
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Policy */}
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <div className="text-sm">
            <h4 className="font-medium mb-2">Editorial Standards</h4>
            <p className="text-muted-foreground">
              All opinion pieces undergo editorial review to ensure quality, accuracy, and adherence to
              our editorial standards. Student contributors are mentored through the editorial process
              to develop strong analytical and writing skills.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-8">
        <h1 
          className="font-bold text-primary leading-none mb-6"
          style={{ fontFamily: 'var(--font-headline)', fontSize: '75px' }}
        >
          Opinion
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Essays on markets, investing, and economic thinking written by St. Paul's School students and guided by our editorial team.
        </p>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Browse Articles</span>
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center space-x-2">
            <PenTool className="h-4 w-4" />
            <span>Submit Article</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>My Submissions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-8">
          {renderBrowseTab()}
        </TabsContent>

        <TabsContent value="submit">
          {user?.id ? (
            <ArticleSubmissionForm
              userId={user.auth_id || user.id}
              userName={user.name || user.email?.split('@')[0] || 'Student'}
              onSuccess={() => {
                setActiveTab('submissions');
              }}
              onCancel={() => {
                setActiveTab('browse');
              }}
            />
          ) : (
            <Card className="p-10 text-center">
              <CardContent>
                <div className="space-y-5">
                  <User className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h4 className="text-lg font-medium">Login Required</h4>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Please login to submit articles for review.
                  </p>
                  <Button onClick={() => onNavigate('auth')}>
                    Login to Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submissions">
          {user?.id ? (
            <StudentSubmissions
              studentId={user.auth_id || user.id}
              onNavigateToArticle={(slug) => onNavigate('article', { slug })}
            />
          ) : (
            <Card className="p-10 text-center">
              <CardContent>
                <div className="space-y-5">
                  <User className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h4 className="text-lg font-medium">Login Required</h4>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Please login to view and manage your article submissions.
                  </p>
                  <Button onClick={() => onNavigate('auth')}>
                    Login to Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
