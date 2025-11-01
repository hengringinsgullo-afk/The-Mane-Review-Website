import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Activity,
  Shield,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Settings,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Download,
  ArrowUp,
  ArrowDown,
  UserCheck,
  AlertTriangle,
  Zap,
  Globe,
  Target,
  PenTool,
  Star
} from 'lucide-react';
import { supabase, articleOperations, reviewOperations, adminOperations } from '../../lib/supabase';
import { AdminReviewDashboard } from '../ui/admin-review-dashboard';
import { EnhancedArticleReview } from '../ui/enhanced-article-review';
import { AdminAnalytics } from '../ui/admin-analytics';
import { UserManagement } from '../ui/user-management';

interface AdminDashboardProps {
  onNavigate?: (page: string, data?: any) => void;
  currentUser?: any;
}

interface DashboardStats {
  totalUsers: number;
  totalArticles: number;
  pendingReviews: number;
  publishedToday: number;
}

interface ExtendedStats extends DashboardStats {
  activeAuthors: number;
  avgReviewTime: number;
  monthlyGrowth: number;
  topAuthors: { name: string; articles: number }[];
  articlesByCategory: { category: string; count: number }[];
  recentActivity: any[];
}

interface RecentActivity {
  id: string;
  action: string;
  target_type: string;
  details: any;
  created_at: string;
}

export function AdminDashboard({ onNavigate, currentUser }: AdminDashboardProps) {
  const [stats, setStats] = useState<ExtendedStats>({
    totalUsers: 0,
    totalArticles: 0,
    pendingReviews: 0,
    publishedToday: 0,
    activeAuthors: 0,
    avgReviewTime: 0,
    monthlyGrowth: 0,
    topAuthors: [],
    articlesByCategory: [],
    recentActivity: []
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (currentUser?.role === 'Admin' || currentUser?.role === 'Editor') {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load basic statistics
      const dashboardStats = await adminOperations.getDashboardStats();
      
      // Load extended statistics
      const [
        activeAuthorsResult,
        reviewTimeResult,
        monthlyGrowthResult,
        topAuthorsResult,
        categoryStatsResult,
        activities
      ] = await Promise.all([
        // Active authors (published in last 30 days)
        supabase
          .from('articles')
          .select('author_id', { count: 'exact', head: true })
          .eq('status', 'published')
          .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Average review time
        supabase
          .from('article_reviews')
          .select('created_at, article_id'),
        
        // Monthly growth
        supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Top authors
        supabase
          .from('articles')
          .select('author_name, author_id')
          .eq('status', 'published'),
        
        // Articles by category
        supabase
          .from('articles')
          .select('category'),
        
        // Recent activity
        adminOperations.getRecentActivity(15)
      ]);

      // Process top authors
      const authorCounts = new Map();
      if (topAuthorsResult.data) {
        topAuthorsResult.data.forEach(article => {
          const name = article.author_name || 'Unknown';
          authorCounts.set(name, (authorCounts.get(name) || 0) + 1);
        });
      }
      const topAuthors = Array.from(authorCounts.entries())
        .map(([name, articles]) => ({ name, articles }))
        .sort((a, b) => b.articles - a.articles)
        .slice(0, 5);

      // Process categories
      const categoryCounts = new Map();
      if (categoryStatsResult.data) {
        categoryStatsResult.data.forEach(article => {
          const category = article.category || 'Uncategorized';
          categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
        });
      }
      const articlesByCategory = Array.from(categoryCounts.entries())
        .map(([category, count]) => ({ category, count }));

      // Calculate average review time
      let avgReviewTime = 0;
      if (reviewTimeResult.data && reviewTimeResult.data.length > 0) {
        const reviewTimes = reviewTimeResult.data.map(review => {
          const created = new Date(review.created_at).getTime();
          return Date.now() - created;
        });
        avgReviewTime = reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length / (1000 * 60 * 60); // Convert to hours
      }

      setStats({
        ...dashboardStats,
        activeAuthors: activeAuthorsResult.count || 0,
        avgReviewTime: Math.round(avgReviewTime),
        monthlyGrowth: ((monthlyGrowthResult.count || 0) / dashboardStats.totalArticles * 100) || 0,
        topAuthors,
        articlesByCategory,
        recentActivity: activities || []
      });

      setRecentActivity(activities || []);
      
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const logAdminAction = async (action: string, targetType?: string, targetId?: string, details?: any) => {
    try {
      await adminOperations.logAction(action, targetType, targetId, details);
      loadDashboardData(); // Refresh to show new activity
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('approved')) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (action.includes('rejected')) return <XCircle className="h-4 w-4 text-red-600" />;
    if (action.includes('review')) return <MessageSquare className="h-4 w-4 text-blue-600" />;
    if (action.includes('user')) return <UserCheck className="h-4 w-4 text-purple-600" />;
    if (action.includes('published')) return <FileText className="h-4 w-4 text-green-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Editor') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need administrator or editor privileges to access this page.
            </p>
            <Button onClick={() => onNavigate?.('home')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-primary flex items-center gap-3">
              <Shield className="h-10 w-10" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {currentUser?.name}. Here's your editorial command centre.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              {currentUser?.role}
            </Badge>
            <Button 
              variant="outline" 
              onClick={loadDashboardData}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {stats.activeAuthors} active
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                  <p className="text-3xl font-bold">{stats.totalArticles}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{stats.monthlyGrowth.toFixed(1)}% this month
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold">{stats.pendingReviews}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    ~{stats.avgReviewTime}h avg time
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published Today</p>
                  <p className="text-3xl font-bold">{stats.publishedToday}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Zap className="h-3 w-3 mr-1" />
                    Live now
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Enhanced Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Reviews</span>
            {stats.pendingReviews > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1">
                {stats.pendingReviews}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Articles</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab with Enhanced Activity Feed */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity Feed */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logAdminAction('Viewed activity feed', 'system')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    {stats.recentActivity.length > 0 ? (
                      <div className="divide-y">
                        {stats.recentActivity.map((activity, idx) => (
                          <div key={activity.id || idx} className="p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {getActivityIcon(activity.action)}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">{activity.action}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{new Date(activity.created_at).toLocaleString()}</span>
                                  {activity.target_type && (
                                    <Badge variant="outline" className="text-xs">
                                      {activity.target_type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No recent activity to display</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Authors & Quick Stats */}
            <div className="space-y-6">
              {/* Top Authors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topAuthors.map((author, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium">{author.name}</span>
                        </div>
                        <Badge variant="secondary">{author.articles} articles</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Articles by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Content Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.articlesByCategory.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{cat.category}</span>
                          <span className="text-muted-foreground">{cat.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ 
                              width: `${(cat.count / stats.totalArticles) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('reviews')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Review Pending Articles
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => onNavigate?.('opinion')}
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Write New Article
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Full Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Enhanced Reviews Tab */}
        <TabsContent value="reviews">
          <EnhancedArticleReview
            editorId={currentUser?.id}
            editorName={currentUser?.name}
            onNavigateToArticle={(slug) => onNavigate?.('article', { slug })}
            onActionComplete={() => {
              loadDashboardData();
              logAdminAction('Reviewed article', 'article');
            }}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AdminAnalytics stats={stats} />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UserManagement 
            onActionComplete={(action) => {
              loadDashboardData();
              logAdminAction(action, 'user');
            }}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Email me when new articles are submitted</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Daily summary of platform activity</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Alert me to unusual user activity</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Auto-approve trusted authors</label>
                    <Select defaultValue="manual">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual review only</SelectItem>
                        <SelectItem value="trusted">Auto-approve after 5 articles</SelectItem>
                        <SelectItem value="verified">Auto-approve verified authors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => logAdminAction('Updated admin settings', 'system')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}