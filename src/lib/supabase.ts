// RE-EXPORT from the fixed version to maintain compatibility
export { supabaseFixed as supabase, authHelpers } from './supabase-auth-fix';
import { supabaseFixed } from './supabase-auth-fix';

// Keep the same interface for backward compatibility
const supabase = supabaseFixed;

// Re-export the auth helpers from the fixed version

// Additional auth helpers that weren't in the fixed version
export const authHelpersExtended = {
  async signUp(email: string, password: string, metadata: any) {
    try {
      console.log('Attempting signup with:', { email, metadata });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('Supabase auth error:', error);
      } else {
        console.log('Signup successful:', data);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected signup error:', err);
      throw err;
    }
  },

  async signIn(email: string, password: string) {
    try {
      console.log('signIn: Starting authentication request for:', email);
      console.log('signIn: Timestamp:', new Date().toISOString());
      
      // Simple, direct authentication
      console.log('signIn: Calling supabase.auth.signInWithPassword...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('signIn: Response received:', { 
        timestamp: new Date().toISOString(),
        hasData: !!data, 
        hasError: !!error,
        user: data?.user?.email,
        errorMessage: error?.message
      });
      
      if (error) {
        console.error('signIn: Supabase auth error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        return { data: null, error };
      }
      
      if (!data?.user) {
        console.error('signIn: No user data in successful response');
        return { 
          data: null, 
          error: new Error('Authentication succeeded but no user data was returned')
        };
      }
      
      console.log('signIn: Success! User:', data.user.email);
      return { data, error: null };
    } catch (err) {
      console.error('signIn: Unexpected error:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err : new Error('An unexpected error occurred during sign in')
      };
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};

// Types for database operations
export interface DatabaseArticle {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  cover_image?: string;
  cover_alt?: string;
  region: 'South America' | 'USA' | 'Europe' | 'Asia';
  category: 'Markets' | 'Opinion';
  tags: string[];
  author_id: string;
  author_name?: string;
  author_role: string;
  status: 'draft' | 'review' | 'published' | 'rejected';
  published_at?: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
  est_read_min: number;
  views: number;
  submission_notes?: string;
  review_notes?: string;
  reviewer_id?: string;
}

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Editor' | 'Contributor' | 'Student' | 'Reader';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleReview {
  id: string;
  article_id: string;
  reviewer_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes';
  comments?: string;
  created_at: string;
  updated_at: string;
}

// Article operations
export const articleOperations = {
  async getPublishedArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getArticlesByUser(userId: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getArticlesUnderReview() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'review')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async submitArticle(article: Partial<DatabaseArticle>) {
    const { data, error } = await supabase
      .from('articles')
      .insert([{
        ...article,
        status: 'review' // Submit directly for review
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateArticle(id: string, updates: Partial<DatabaseArticle>) {
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteArticle(id: string) {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// User operations
export const userOperations = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createUserProfile(user: Partial<DatabaseUser>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Review operations (for editors/admins)
export const reviewOperations = {
  async submitReview(articleId: string, reviewerId: string, status: ArticleReview['status'], comments?: string) {
    const { data, error } = await supabase
      .from('article_reviews')
      .insert([{
        article_id: articleId,
        reviewer_id: reviewerId,
        status,
        comments
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getArticleReviews(articleId: string) {
    const { data, error } = await supabase
      .from('article_reviews')
      .select('*, reviewer:users(name, role)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Guidelines operations
export const guidelinesOperations = {
  async getActiveGuidelines() {
    const { data, error } = await supabase
      .from('submission_guidelines')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('order_index');
    
    if (error) throw error;
    return data;
  }
};

// Temporary admin bypass (for development)
export const adminBypass = {
  async checkAdminCredentials(email: string, password: string) {
    const { data, error } = await supabase.rpc('check_admin_credentials', {
      email_param: email,
      password_param: password
    });
    
    if (error) {
      console.error('Admin bypass error:', error);
      return { success: false, error };
    }
    
    return data;
  }
};

// Admin operations
export const adminOperations = {
  async logAction(action: string, targetType?: string, targetId?: string, details?: any) {
    const { data, error } = await supabase.rpc('log_admin_action', {
      action_text: action,
      target_type_text: targetType,
      target_id_uuid: targetId,
      details_json: details
    });
    
    if (error) throw error;
    return data;
  },

  async getRecentActivity(limit: number = 10) {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getDashboardStats() {
    const [usersResult, articlesResult, reviewsResult] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'review')
    ]);

    const today = new Date().toISOString().split('T')[0];
    const { count: publishedToday } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', today);

    return {
      totalUsers: usersResult.count || 0,
      totalArticles: articlesResult.count || 0,
      pendingReviews: reviewsResult.count || 0,
      publishedToday: publishedToday || 0
    };
  }
};
