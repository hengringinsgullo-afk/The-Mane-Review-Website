import React from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import {
  Users,
  FileText,
  Clock,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Activity,
  Award,
  Target,
  Zap,
  Calendar,
  Eye,
  MessageSquare,
  Globe,
  Star,
  CheckCircle2,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    totalArticles: number;
    pendingReviews: number;
    publishedToday: number;
    activeAuthors: number;
    avgReviewTime: number;
    monthlyGrowth: number;
    engagementRate?: number;
    viewsToday?: number;
    newUsersThisWeek?: number;
  };
}

export function AdminStatsCards({ stats }: StatsCardsProps) {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 100, direction: 'up' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change >= 0 ? 'up' : 'down'
    };
  };

  // Mock previous period data for trends
  const previousPeriod = {
    totalUsers: Math.floor(stats.totalUsers * 0.85),
    totalArticles: Math.floor(stats.totalArticles * 0.9),
    publishedToday: Math.floor(stats.publishedToday * 0.7),
    activeAuthors: Math.floor(stats.activeAuthors * 0.8)
  };

  const usersTrend = calculateTrend(stats.totalUsers, previousPeriod.totalUsers);
  const articlesTrend = calculateTrend(stats.totalArticles, previousPeriod.totalArticles);
  const publishedTrend = calculateTrend(stats.publishedToday, previousPeriod.publishedToday);
  const authorsTrend = calculateTrend(stats.activeAuthors, previousPeriod.activeAuthors);

  const statsConfig = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.activeAuthors} active contributors`,
      icon: Users,
      colour: 'blue',
      trend: usersTrend,
      progress: (stats.activeAuthors / stats.totalUsers) * 100
    },
    {
      title: 'Total Articles',
      value: stats.totalArticles,
      subtitle: `+${stats.monthlyGrowth.toFixed(1)}% this month`,
      icon: FileText,
      colour: 'green',
      trend: articlesTrend,
      progress: stats.monthlyGrowth
    },
    {
      title: 'Pending Review',
      value: stats.pendingReviews,
      subtitle: `~${stats.avgReviewTime}h avg time`,
      icon: Clock,
      colour: 'orange',
      urgent: stats.pendingReviews > 10,
      progress: Math.max(0, 100 - (stats.pendingReviews * 10))
    },
    {
      title: 'Published Today',
      value: stats.publishedToday,
      subtitle: 'Live articles',
      icon: TrendingUp,
      colour: 'purple',
      trend: publishedTrend,
      sparkle: true
    }
  ];

  const getColourClasses = (colour: string) => {
    const colourMap = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600',
        border: 'border-blue-200 dark:border-blue-800'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600',
        border: 'border-green-200 dark:border-green-800'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-600',
        border: 'border-orange-200 dark:border-orange-800'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600',
        border: 'border-purple-200 dark:border-purple-800'
      }
    };
    return colourMap[colour] || colourMap.blue;
  };

  return (
    <>
      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          const colours = getColourClasses(stat.colour);
          
          return (
            <Card 
              key={index} 
              className={`border-2 hover:shadow-lg transition-all duration-200 ${
                stat.urgent ? 'border-orange-400 dark:border-orange-600' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  {stat.urgent && (
                    <AlertTriangle className="h-4 w-4 text-orange-600 animate-pulse" />
                  )}
                  {stat.sparkle && (
                    <Zap className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {stat.trend && (
                        <div className={`flex items-center text-xs ${
                          stat.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.trend.direction === 'up' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          <span>{stat.trend.value.toFixed(1)}%</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    </div>
                  </div>
                  <div className={`h-12 w-12 ${colours.bg} rounded-lg flex items-centre justify-centre`}>
                    <Icon className={`h-6 w-6 ${colours.text}`} />
                  </div>
                </div>
                
                {stat.progress !== undefined && (
                  <div className="mt-3">
                    <Progress value={stat.progress} className="h-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border border-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-semibold">
                  {stats.engagementRate || ((stats.activeAuthors / stats.totalUsers) * 100).toFixed(1)}%
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Active participation</span>
                </div>
              </div>
              <Badge variant="secondary">Good</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Views Today</p>
                <p className="text-2xl font-semibold">{stats.viewsToday || '2.5K'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Eye className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+12% from yesterday</span>
                </div>
              </div>
              <Badge variant="outline">Live</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-semibold">94/100</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs text-muted-foreground">Excellent content</span>
                </div>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Platform Health</h3>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>System Uptime</span>
                  <span className="font-medium">99.9%</span>
                </div>
                <Progress value={99.9} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Response Time</span>
                  <span className="font-medium">1.2s avg</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Error Rate</span>
                  <span className="font-medium text-green-600">0.02%</span>
                </div>
                <Progress value={99.98} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Content Goals</h3>
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Monthly Articles</span>
                  <span className="font-medium">82/100</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Author Engagement</span>
                  <span className="font-medium">67/80</span>
                </div>
                <Progress value={83.75} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Quality Reviews</span>
                  <span className="font-medium">45/50</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}