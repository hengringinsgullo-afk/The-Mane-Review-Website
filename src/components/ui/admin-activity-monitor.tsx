import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import {
  Activity,
  FileText,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Eye,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Star,
  Globe,
  Calendar,
  Filter,
  Download,
  MoreVertical,
  Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'article_submitted' | 'article_reviewed' | 'user_joined' | 'article_published' | 
        'comment_added' | 'profile_updated' | 'article_viewed' | 'review_requested';
  user: {
    name: string;
    avatar?: string;
    role?: string;
  };
  target?: {
    type: string;
    title?: string;
    id?: string;
  };
  metadata?: any;
  timestamp: string;
}

interface ActivityMonitorProps {
  maxItems?: number;
  autoRefresh?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
}

export function AdminActivityMonitor({ 
  maxItems = 20, 
  autoRefresh = true,
  onActivityClick 
}: ActivityMonitorProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [isLive, setIsLive] = useState(autoRefresh);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadActivities();
    
    if (autoRefresh && isLive) {
      const interval = setInterval(loadActivities, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isLive, filterType]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, this would fetch from Supabase
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'article_submitted',
          user: { name: 'Sarah Chen', avatar: '', role: 'Student' },
          target: { type: 'article', title: 'Climate Change Solutions for Brazil', id: '123' },
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'article_reviewed',
          user: { name: 'Dr. James Wilson', avatar: '', role: 'Editor' },
          target: { type: 'article', title: 'The Future of AI in Education', id: '124' },
          metadata: { decision: 'approved' },
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'user_joined',
          user: { name: 'Maria Silva', avatar: '', role: 'Student' },
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          type: 'article_published',
          user: { name: 'Admin', avatar: '', role: 'Admin' },
          target: { type: 'article', title: 'St. Paul\'s Sustainability Initiative', id: '125' },
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          type: 'comment_added',
          user: { name: 'Alex Thompson', avatar: '', role: 'Reader' },
          target: { type: 'article', title: 'Digital Transformation in Schools', id: '126' },
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
          id: '6',
          type: 'review_requested',
          user: { name: 'Emma Brown', avatar: '', role: 'Contributor' },
          target: { type: 'article', title: 'Modern Teaching Methods', id: '127' },
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
        },
        {
          id: '7',
          type: 'article_viewed',
          user: { name: 'Guest User', avatar: '', role: 'Reader' },
          target: { type: 'article', title: 'STEM Education Trends', id: '128' },
          metadata: { viewCount: 156 },
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
        }
      ];
      
      // Filter activities based on selected type
      let filtered = mockActivities;
      if (filterType !== 'all') {
        filtered = mockActivities.filter(a => a.type === filterType);
      }
      
      setActivities(filtered.slice(0, maxItems));
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconMap = {
      article_submitted: { icon: FileText, colour: 'text-blue-600' },
      article_reviewed: { icon: CheckCircle2, colour: 'text-green-600' },
      user_joined: { icon: UserCheck, colour: 'text-purple-600' },
      article_published: { icon: Globe, colour: 'text-green-600' },
      comment_added: { icon: MessageSquare, colour: 'text-orange-600' },
      profile_updated: { icon: Edit, colour: 'text-gray-600' },
      article_viewed: { icon: Eye, colour: 'text-indigo-600' },
      review_requested: { icon: Clock, colour: 'text-yellow-600' }
    };
    return iconMap[type] || { icon: Activity, colour: 'text-gray-600' };
  };

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'article_submitted':
        return (
          <>
            <strong>{activity.user.name}</strong> submitted a new article{' '}
            <span className="font-medium">"{activity.target?.title}"</span>
          </>
        );
      case 'article_reviewed':
        return (
          <>
            <strong>{activity.user.name}</strong>{' '}
            <span className={activity.metadata?.decision === 'approved' ? 'text-green-600' : 'text-red-600'}>
              {activity.metadata?.decision}
            </span>{' '}
            <span className="font-medium">"{activity.target?.title}"</span>
          </>
        );
      case 'user_joined':
        return (
          <>
            <strong>{activity.user.name}</strong> joined as a new {activity.user.role}
          </>
        );
      case 'article_published':
        return (
          <>
            <span className="font-medium">"{activity.target?.title}"</span> was published
          </>
        );
      case 'comment_added':
        return (
          <>
            <strong>{activity.user.name}</strong> commented on{' '}
            <span className="font-medium">"{activity.target?.title}"</span>
          </>
        );
      case 'review_requested':
        return (
          <>
            <strong>{activity.user.name}</strong> requested changes on{' '}
            <span className="font-medium">"{activity.target?.title}"</span>
          </>
        );
      case 'article_viewed':
        return (
          <>
            <span className="font-medium">"{activity.target?.title}"</span> reached{' '}
            <strong>{activity.metadata?.viewCount}</strong> views
          </>
        );
      default:
        return `${activity.user.name} performed an action`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const activityTypes = [
    { value: 'all', label: 'All Activity' },
    { value: 'article_submitted', label: 'Submissions' },
    { value: 'article_reviewed', label: 'Reviews' },
    { value: 'user_joined', label: 'New Users' },
    { value: 'article_published', label: 'Published' }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity Feed
            {isLive && (
              <Badge variant="outline" className="ml-2 animate-pulse">
                <div className="h-2 w-2 bg-green-600 rounded-full mr-1" />
                Live
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border rounded-md px-3 py-1"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={loadActivities}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {loading && activities.length === 0 ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((activity) => {
                const { icon: Icon, colour } = getActivityIcon(activity.type);
                
                return (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onActivityClick?.(activity)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 mt-0.5">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(activity.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          {getActivityMessage(activity)}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                          {activity.user.role && (
                            <Badge variant="outline" className="text-xs">
                              {activity.user.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Icon className={`h-5 w-5 ${colour}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}