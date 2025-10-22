import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { 
  Users, 
  Search,
  Filter,
  UserPlus,
  Edit,
  Shield,
  Mail,
  Calendar,
  FileText,
  Activity,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  School,
  Briefcase,
  GraduationCap,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface UserManagementProps {
  onActionComplete?: (action: string) => void;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Editor' | 'Contributor' | 'Student' | 'Reader';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  phone_number?: string;
  date_of_birth?: string;
  is_st_pauls_member?: boolean;
  member_type?: 'staff' | 'student';
  student_form?: string;
  auth_id?: string;
}

interface UserStats {
  totalArticles: number;
  publishedArticles: number;
  lastActive?: string;
}

export function UserManagement({ onActionComplete }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState(false);
  const [userStats, setUserStats] = useState<Map<string, UserStats>>(new Map());

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usersError) throw usersError;
      
      setUsers(usersData || []);
      
      // Load user statistics
      if (usersData && usersData.length > 0) {
        const statsMap = new Map<string, UserStats>();
        
        // Get article counts for each user
        const userIds = usersData.map(u => u.id);
        const { data: articlesData } = await supabase
          .from('articles')
          .select('author_id, status, created_at')
          .in('author_id', userIds);
        
        if (articlesData) {
          usersData.forEach(user => {
            const userArticles = articlesData.filter(a => a.author_id === user.id);
            const publishedCount = userArticles.filter(a => a.status === 'published').length;
            const lastArticle = userArticles.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
            
            statsMap.set(user.id, {
              totalArticles: userArticles.length,
              publishedArticles: publishedCount,
              lastActive: lastArticle?.created_at
            });
          });
        }
        
        setUserStats(statsMap);
      }
      
    } catch (err) {
      console.error('Error loading users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: User['role']) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success(`User role updated to ${newRole}`);
      onActionComplete?.(`Updated user role to ${newRole}`);
      loadUsers();
      setEditingUser(false);
      setSelectedUser(null);
    } catch (err) {
      toast.error('Failed to update user role');
      console.error(err);
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Member Type', 'Articles', 'Published', 'Joined'].join(','),
      ...filteredUsers.map(user => {
        const stats = userStats.get(user.id) || { totalArticles: 0, publishedArticles: 0 };
        return [
          user.name,
          user.email,
          user.role,
          user.member_type || 'N/A',
          stats.totalArticles,
          stats.publishedArticles,
          new Date(user.created_at).toLocaleDateString()
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('User list exported');
    onActionComplete?.('Exported user list');
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: User['role']) => {
    const configs = {
      Admin: { color: 'destructive', icon: Shield },
      Editor: { color: 'default', icon: Edit },
      Contributor: { color: 'secondary', icon: FileText },
      Student: { color: 'outline', icon: GraduationCap },
      Reader: { color: 'outline', icon: Users }
    };
    
    const config = configs[role] || configs.Reader;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const getMemberBadge = (user: User) => {
    if (!user.is_st_pauls_member) return null;
    
    if (user.member_type === 'staff') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          Staff
        </Badge>
      );
    } else if (user.member_type === 'student') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <School className="h-3 w-3" />
          {user.student_form}
        </Badge>
      );
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contributors</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => ['Admin', 'Editor', 'Contributor'].includes(u.role)).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'Student').length}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">St. Paul's Members</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.is_st_pauls_member).length}
                </p>
              </div>
              <School className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admins</SelectItem>
                <SelectItem value="Editor">Editors</SelectItem>
                <SelectItem value="Contributor">Contributors</SelectItem>
                <SelectItem value="Student">Students</SelectItem>
                <SelectItem value="Reader">Readers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const stats = userStats.get(user.id) || { totalArticles: 0, publishedArticles: 0 };
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getMemberBadge(user)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{stats.totalArticles} total</p>
                          <p className="text-xs text-muted-foreground">{stats.publishedArticles} published</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {stats.lastActive ? (
                          <span className="text-sm">
                            {new Date(stats.lastActive).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditingUser(true);
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editingUser} onOpenChange={setEditingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>User Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => 
                    setSelectedUser({ ...selectedUser, role: value as User['role'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin - Full access
                      </div>
                    </SelectItem>
                    <SelectItem value="Editor">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Editor - Can review articles
                      </div>
                    </SelectItem>
                    <SelectItem value="Contributor">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Contributor - Can write articles
                      </div>
                    </SelectItem>
                    <SelectItem value="Student">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Student - Limited access
                      </div>
                    </SelectItem>
                    <SelectItem value="Reader">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Reader - Read only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedUser.role === 'Admin' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Admin users have full access to all platform features including user management.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Articles</p>
                  <p className="font-medium">
                    {userStats.get(selectedUser.id)?.totalArticles || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedUser && updateUserRole(selectedUser.id, selectedUser.role)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}