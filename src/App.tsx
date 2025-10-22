import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { MarketsPage } from './components/pages/MarketsPage';
import { OpinionPage } from './components/pages/OpinionPage';
import { WatchlistPage } from './components/pages/WatchlistPage';
import { AboutPage } from './components/pages/AboutPage';
import { ArticlePage } from './components/pages/ArticlePage';
import { AuthPage } from './components/pages/AuthPage';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { AuthTest } from './components/pages/AuthTest';
import { AccountPage } from './components/pages/AccountPage';
import { AuthDebug } from './components/pages/AuthDebug';
import { Toaster } from './components/ui/sonner';
import { authHelpers, userOperations, supabase } from './lib/supabase';
import { getCurrentUserWithProfile } from './lib/auth-utils';
import { toast } from 'sonner';
import type { Region } from './lib/types';

type Page = 'home' | 'markets' | 'opinion' | 'watchlist' | 'about' | 'article' | 'auth' | 'admin' | 'authtest' | 'account' | 'authdebug';

interface NavEntry {
  page: Page;
  data?: {
    slug?: string;
    region?: Region;
    [key: string]: any;
  };
}

const resolvePage = (target: string): Page => {
  switch (target.toLowerCase()) {
    case 'home':
      return 'home';
    case 'markets':
      return 'markets';
    case 'opinion':
      return 'opinion';
    case 'watchlist':
      return 'watchlist';
    case 'about':
      return 'about';
    case 'article':
      return 'article';
    case 'auth':
      return 'auth';
    case 'admin':
      return 'admin';
    case 'authtest':
      return 'authtest';
    case 'account':
      return 'account';
    case 'authdebug':
      return 'authdebug';
    default:
      return 'home';
  }
};

export default function App() {
  const [count, setCount] = useState(0);
  const [showFull, setShowFull] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize from localStorage if available
  const getInitialProfile = () => {
    try {
      const stored = localStorage.getItem('mane-review-user-profile');
      if (stored) {
        console.log('[App] Restoring profile from localStorage');
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('[App] Error reading profile from localStorage:', e);
    }
    return null;
  };
  
  const initialPage = window.location.pathname === '/auth' ? 'auth' : 'home';
  const [navStack, setNavStack] = useState<NavEntry[]>([{ page: initialPage }]);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(getInitialProfile);
  const [authLoading, setAuthLoading] = useState(true);

  const currentEntry = navStack[navStack.length - 1];
  
  // Persist userProfile to localStorage whenever it changes
  useEffect(() => {
    if (userProfile) {
      console.log('[App] Persisting profile to localStorage:', {
        email: userProfile.email,
        role: userProfile.role,
        name: userProfile.name
      });
      localStorage.setItem('mane-review-user-profile', JSON.stringify(userProfile));
    } else {
      console.log('[App] Clearing profile from localStorage');
      localStorage.removeItem('mane-review-user-profile');
    }
  }, [userProfile]);

  // Debug navigation state
  useEffect(() => {
    console.log('[App] Navigation state:', {
      currentPage: currentEntry.page,
      navStackLength: navStack.length,
      navStack: navStack.map(e => e.page)
    });
  }, [navStack]);

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentEntry.page]);

  // Check for existing session on mount
  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[App] Auth state change:', event, session?.user?.email);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('[App] Token refreshed, reloading user data...');
        await checkUser();
      } else if (event === 'SIGNED_OUT') {
        console.log('[App] User signed out');
        setUser(null);
        setUserProfile(null);
      }
      // Note: SIGNED_IN is handled by AuthPage calling handleAuthSuccess
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    console.log('[checkUser] Starting');
    try {
      // Get session directly
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[checkUser] Session error:', sessionError);
        setAuthLoading(false);
        return;
      }
      
      if (!session?.user) {
        console.log('[checkUser] No session found');
        setUser(null);
        setUserProfile(null);
        setAuthLoading(false);
        return;
      }
      
      console.log('[checkUser] Session found for:', session.user.email);
      setUser(session.user);
      
      // Try to get profile from database
      console.log('[checkUser] Querying database for auth_id:', session.user.id);
      const { data: dbProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('[checkUser] Profile query error:', profileError);
      }
      
      if (dbProfile) {
        console.log('[checkUser] Database profile found:', {
          name: dbProfile.name,
          email: dbProfile.email,
          role: dbProfile.role
        });
      } else {
        console.log('[checkUser] No database profile found, creating temporary');
      }
      
      // Use database profile or create temporary one
      const profile = dbProfile || {
        id: session.user.id,
        auth_id: session.user.id,
        email: session.user.email || '',
        name: session.user.email?.split('@')[0] || 'User',
        role: 'Student'
      };
      
      console.log('[checkUser] Setting profile with role:', profile.role);
      setUserProfile(profile);
      
    } catch (error) {
      console.error('[checkUser] Fatal error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadUserProfile = async (authId: string) => {
    console.log('[loadUserProfile] Called with authId:', authId);
    
    // Just call checkUser which does everything we need
    await checkUser();
    
    console.log('[loadUserProfile] Completed');
  };

  const handleLogin = () => {
    // Se já estamos na página auth, apenas atualiza a aba
    if (currentEntry.page === 'auth') {
      handleNavigate('auth', { defaultTab: 'login' });
    } else {
      handleNavigate('auth', { defaultTab: 'login' });
    }
  };

  const handleRegister = () => {
    // Se já estamos na página auth, apenas atualiza a aba
    if (currentEntry.page === 'auth') {
      handleNavigate('auth', { defaultTab: 'signup' });
    } else {
      handleNavigate('auth', { defaultTab: 'signup' });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await authHelpers.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      toast.success('Logged out successfully');
      handleNavigate('home');
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    }
  };

  const handleAuthSuccess = async (authUser: any) => {
    console.log('[handleAuthSuccess] User logged in:', authUser.email);
    
    // Set user immediately
    setUser(authUser);
    
    // Load full profile from database BEFORE navigating
    console.log('[handleAuthSuccess] Loading full profile from database');
    await checkUser();
    
    // Navigate after profile is loaded
    console.log('[handleAuthSuccess] Profile loaded, navigating to home');
    handleNavigate('home');
    
    toast.success('Welcome to The Mane Review!');
  };

  const handleShowFull = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    setShowFull(true);
    setIsLoading(false);
  };

  const handleNavigate = (page: string, data?: NavEntry['data']) => {
    console.log('[App] handleNavigate called with:', page, data);
    
    if (page === 'back') {
      setNavStack(prev => {
        if (prev.length <= 1) {
          return prev;
        }
        return prev.slice(0, -1);
      });
      return;
    }

    if (!showFull) {
      setShowFull(true);
    }

    const normalized = resolvePage(page);
    const nextEntry: NavEntry = { page: normalized, data };
    console.log('[App] Normalized page:', normalized, 'Current page:', currentEntry.page);

    setNavStack(prev => {
      const previous = prev[prev.length - 1];

      if (previous.page === normalized) {
        if (normalized === 'article' && previous.data?.slug !== data?.slug) {
          return [...prev, nextEntry];
        }
        if (normalized === 'markets' && previous.data?.region !== data?.region) {
          return [...prev, nextEntry];
        }
        if (normalized === 'auth' && previous.data?.defaultTab !== data?.defaultTab) {
          // Para auth page, sempre atualiza se a aba mudou
          console.log('[App] Auth page tab change:', previous.data?.defaultTab, '->', data?.defaultTab);
          const updated = [...prev];
          updated[updated.length - 1] = nextEntry;
          return updated;
        }

        console.log('[App] Already on page', normalized, '- not updating nav stack');
        const updated = [...prev];
        updated[updated.length - 1] = nextEntry;
        return updated;
      }

      console.log('[App] Navigation stack updated, navigating from', previous.page, 'to', normalized);
      return [...prev, nextEntry];
    });
  };

  const renderPage = () => {
    switch (currentEntry.page) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'markets':
        return (
          <MarketsPage
            onNavigate={handleNavigate}
            region={currentEntry.data?.region as Region | undefined}
          />
        );
      case 'opinion':
        return <OpinionPage onNavigate={handleNavigate} user={userProfile} />;
      case 'watchlist':
        return <WatchlistPage onNavigate={handleNavigate} user={userProfile} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'article':
        return (
          <ArticlePage
            onNavigate={handleNavigate}
            slug={currentEntry.data?.slug ?? ''}
          />
        );
      case 'auth':
        return (
          <AuthPage 
            onAuthSuccess={handleAuthSuccess}
            onNavigate={handleNavigate}
            defaultTab={currentEntry.data?.defaultTab as 'login' | 'signup'}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            onNavigate={handleNavigate}
            currentUser={userProfile}
          />
        );
      case 'authtest':
        return <AuthTest />;
      case 'account':
        return <AccountPage onNavigate={handleNavigate} user={userProfile} />;
      case 'authdebug':
        return <AuthDebug />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  if (!showFull) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>The Mane Review - Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Count: {count}</p>
                <Button onClick={() => setCount(c => c + 1)}>
                  Increment
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShowFull}
                  disabled={isLoading}
                  className="ml-4"
                >
                  {isLoading ? 'Loading...' : 'Test HomePage'}
                </Button>
                <p className="text-muted-foreground">
                  Basic app is working. Click to test HomePage component.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        currentPage={currentEntry.page}
        onNavigate={(target) => handleNavigate(target)}
        user={userProfile}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
