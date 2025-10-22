import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Globe, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
  Eye,
  MessageSquare,
  DollarSign,
  Zap
} from 'lucide-react';

interface AdminAnalyticsProps {
  stats: {
    totalUsers: number;
    totalArticles: number;
    pendingReviews: number;
    publishedToday: number;
    activeAuthors: number;
    avgReviewTime: number;
    monthlyGrowth: number;
    topAuthors: { name: string; articles: number }[];
    articlesByCategory: { category: string; count: number }[];
    recentActivity: any[];
  };
}

export function AdminAnalytics({ stats }: AdminAnalyticsProps) {
  // Calculate additional metrics
  const publishingRate = stats.totalArticles > 0 
    ? ((stats.totalArticles - stats.pendingReviews) / stats.totalArticles * 100).toFixed(1)
    : '0';
  
  const engagementRate = stats.activeAuthors > 0 && stats.totalUsers > 0
    ? (stats.activeAuthors / stats.totalUsers * 100).toFixed(1)
    : '0';

  const avgArticlesPerAuthor = stats.activeAuthors > 0
    ? (stats.totalArticles / stats.activeAuthors).toFixed(1)
    : '0';

  // Mock data for charts (in a real app, this would come from the API)
  const monthlyData = [
    { month: 'Jan', articles: 45, users: 12 },
    { month: 'Feb', articles: 52, users: 18 },
    { month: 'Mar', articles: 61, users: 22 },
    { month: 'Apr', articles: 58, users: 25 },
    { month: 'May', articles: 73, users: 31 },
    { month: 'Jun', articles: 85, users: 38 }
  ];

  const regionData = [
    { region: 'USA', percentage: 35 },
    { region: 'Europe', percentage: 28 },
    { region: 'Asia', percentage: 22 },
    { region: 'South America', percentage: 15 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <BarChart3 className="h-6 w-6" />
          Platform Analytics
        </h2>
        <p className="text-muted-foreground">
          Comprehensive insights into The Mane Review's performance and growth
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Publishing Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{publishingRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Well above target
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={Number(publishingRate)} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{engagementRate}%</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  Active contributors
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={Number(engagementRate)} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Review Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.avgReviewTime}h</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Quick turnaround
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-600 transition-all duration-500"
                style={{ width: `${Math.min(100, (24 - stats.avgReviewTime) / 24 * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Content Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{avgArticlesPerAuthor}</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Award className="h-3 w-3 mr-1" />
                  Articles per author
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Progress value={Number(avgArticlesPerAuthor) * 10} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Trends
            </span>
            <Badge variant="outline">Last 6 Months</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mini Bar Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Articles Published</span>
                <span className="font-medium">+{stats.monthlyGrowth.toFixed(1)}% this month</span>
              </div>
              <div className="grid grid-cols-6 gap-1 h-32">
                {monthlyData.map((month, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-end gap-1">
                    <div 
                      className="w-full bg-primary rounded-t transition-all duration-500 hover:bg-primary/80"
                      style={{ 
                        height: `${(month.articles / Math.max(...monthlyData.map(m => m.articles))) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{month.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Growth</p>
                <p className="text-2xl font-bold text-green-600">+38%</p>
                <p className="text-xs text-muted-foreground">vs. previous period</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">New Users</p>
                <p className="text-2xl font-bold text-blue-600">+125</p>
                <p className="text-xs text-muted-foreground">in the last 30 days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Content by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.articlesByCategory.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{cat.count} articles</span>
                      <span className="text-sm font-medium">
                        {stats.totalArticles > 0 ? ((cat.count / stats.totalArticles) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={stats.totalArticles > 0 ? (cat.count / stats.totalArticles) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionData.map((region, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      idx === 0 ? 'bg-blue-600' :
                      idx === 1 ? 'bg-green-600' :
                      idx === 2 ? 'bg-orange-600' : 'bg-purple-600'
                    }`} />
                    <span className="text-sm font-medium">{region.region}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <Progress value={region.percentage} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{region.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Based on author locations and article topics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Article Views (Est.)</span>
                <Badge variant="secondary">This Month</Badge>
              </div>
              <p className="text-3xl font-bold">12.5K</p>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+23%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Engagement Rate</span>
                <Badge variant="secondary">Average</Badge>
              </div>
              <p className="text-3xl font-bold">4.2%</p>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-3 w-3 text-blue-600" />
                <span className="text-blue-600">Steady</span>
                <span className="text-muted-foreground">performance</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Review Efficiency</span>
                <Badge variant="secondary">Score</Badge>
              </div>
              <p className="text-3xl font-bold">92/100</p>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-3 w-3 text-yellow-600" />
                <span className="text-yellow-600">Excellent</span>
                <span className="text-muted-foreground">rating</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Contributors This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topAuthors.slice(0, 5).map((author, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                    idx === 0 ? 'bg-yellow-600 text-white' :
                    idx === 1 ? 'bg-gray-400 text-white' :
                    idx === 2 ? 'bg-orange-600 text-white' : 'bg-muted'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{author.name}</p>
                    <p className="text-sm text-muted-foreground">{author.articles} articles published</p>
                  </div>
                </div>
                {idx === 0 && (
                  <Badge variant="default" className="bg-yellow-600">
                    <Award className="h-3 w-3 mr-1" />
                    Top Author
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}