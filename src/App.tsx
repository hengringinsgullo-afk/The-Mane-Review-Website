import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { NavigationControls } from './components/ui/navigation-controls';
import { Breadcrumbs } from './components/ui/breadcrumbs';
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
import { addDeviceClasses, optimizeIOSViewport, logDeviceInfo, onOrientationChange } from './utils/device-detection';

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

  // IMPORTANT: Get initial page from URL or default to home
  const getInitialPage = (): Page => {
    const pathname = window.location.pathname;
    if (pathname.includes('/auth')) return 'auth';
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/markets')) return 'markets';
    if (pathname.includes('/opinion')) return 'opinion';
    if (pathname.includes('/watchlist')) return 'watchlist';
    if (pathname.includes('/about')) return 'about';
    return 'home';
  };

  const [navStack, setNavStack] = useState<NavEntry[]>([{ page: getInitialPage() }]);
  const [navIndex, setNavIndex] = useState(0); // Current position in history
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(getInitialProfile);
  const [authLoading, setAuthLoading] = useState(true);

  // Prevent concurrent profile fetches
  const isCheckingUser = useRef(false);

  const currentEntry = navStack[navIndex];
  const canGoBack = navIndex > 0;
  const canGoForward = navIndex < navStack.length - 1;

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

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Left Arrow = Back
      if (e.altKey && e.key === 'ArrowLeft' && canGoBack) {
        e.preventDefault();
        handleNavigate('back');
      }
      // Alt + Right Arrow = Forward
      if (e.altKey && e.key === 'ArrowRight' && canGoForward) {
        e.preventDefault();
        handleNavigate('forward');
      }
      // Alt + Home = Go to home
      if (e.altKey && e.key === 'Home') {
        e.preventDefault();
        handleNavigate('home');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, canGoForward]);

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

  // Initialize device optimizations
  useEffect(() => {
    // Add device-specific classes to body
    addDeviceClasses();
    
    // Optimize viewport for iOS
    optimizeIOSViewport();
    
    // Log device info in development
    if (import.meta.env.DEV) {
      logDeviceInfo();
    }
    
    // Listen for orientation changes
    const cleanup = onOrientationChange((orientation) => {
      console.log('[App] Orientation changed to:', orientation);
    });
    
    return cleanup;
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[App] Auth state change:', event, session?.user?.email);

      // IMPORTANT: Only handle specific events to prevent loops
      if (event === 'TOKEN_REFRESHED') {
        console.log('[App] Token refreshed, reloading user data...');
        await checkUser();
      } else if (event === 'SIGNED_OUT') {
        console.log('[App] User signed out');
        setUser(null);
        setUserProfile(null);
      } else if (event === 'SIGNED_IN') {
        // Do NOT process SIGNED_IN here - it's handled by AuthPage
        console.log('[App] SIGNED_IN event ignored - handled by AuthPage');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    // Prevent concurrent calls
    if (isCheckingUser.current) {
      console.log('[checkUser] Already checking user, skipping');
      return;
    }

    isCheckingUser.current = true;
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
      isCheckingUser.current = false;
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

    // IMPORTANT: Prevent multiple calls
    if (currentEntry.page === 'home') {
      console.log('[handleAuthSuccess] Already on home page, skipping');
      return;
    }

    // Set user immediately
    setUser(authUser);

    // Load full profile from database BEFORE navigating
    console.log('[handleAuthSuccess] Loading full profile from database');
    await checkUser();

    // Navigate after profile is loaded
    console.log('[handleAuthSuccess] Profile loaded, navigating to home');
    handleNavigate('home');

    // Show success message only once
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

    // Handle back navigation
    if (page === 'back') {
      if (navIndex > 0) {
        setNavIndex(navIndex - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Handle forward navigation
    if (page === 'forward') {
      if (navIndex < navStack.length - 1) {
        setNavIndex(navIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (!showFull) {
      setShowFull(true);
    }

    const normalized = resolvePage(page);
    const nextEntry: NavEntry = { page: normalized, data };
    console.log('[App] Normalized page:', normalized, 'Current page:', currentEntry.page);

    setNavStack(prev => {
      const current = prev[navIndex];

      console.log('[App] Navigation check - current:', current.page, 'target:', normalized);

      // If we're already on the target page
      if (current.page === normalized) {
        // Special cases where we update even on same page
        if (normalized === 'article' && current.data?.slug !== data?.slug) {
          console.log('[App] Different article, navigating');
          const newStack = prev.slice(0, navIndex + 1);
          setNavIndex(newStack.length);
          return [...newStack, nextEntry];
        }
        if (normalized === 'markets' && current.data?.region !== data?.region) {
          console.log('[App] Different market region, navigating');
          const newStack = prev.slice(0, navIndex + 1);
          setNavIndex(newStack.length);
          return [...newStack, nextEntry];
        }
        if (normalized === 'auth' && current.data?.defaultTab !== data?.defaultTab) {
          console.log('[App] Auth page tab change:', current.data?.defaultTab, '->', data?.defaultTab);
          const updated = [...prev];
          updated[navIndex] = nextEntry;
          return updated;
        }

        // If we're on the same page and no data changed, don't update
        console.log('[App] Already on page', current.page, '- not navigating');
        return prev;
      }

      // Different pages - navigate normally
      // Clear forward history when navigating to a new page
      console.log('[App] Navigating from', current.page, 'to', normalized);
      const newStack = prev.slice(0, navIndex + 1);
      setNavIndex(newStack.length);
      return [...newStack, nextEntry];
    });

    // Scroll to top after navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Generate breadcrumbs from navigation history
  const getBreadcrumbs = () => {
    const pageLabels: Record<string, string> = {
      home: 'Home',
      markets: 'Markets',
      opinion: 'Opinion',
      watchlist: 'Watchlist',
      about: 'About',
      article: 'Article',
      auth: 'Sign In',
      admin: 'Admin Dashboard',
      account: 'My Account'
    };

    // Get current navigation path
    const fullPath = navStack.slice(0, navIndex + 1);
    
    // Remove consecutive duplicates
    const uniquePath = fullPath.filter((entry, index) => {
      if (index === 0) return true;
      return entry.page !== fullPath[index - 1].page;
    });

    // Show only last 3 items (or all if less than 3)
    const limitedPath = uniquePath.length > 3 
      ? uniquePath.slice(-3) 
      : uniquePath;

    return limitedPath.map((entry, index) => ({
      label: pageLabels[entry.page] || entry.page,
      page: entry.page,
      data: entry.data
    }));
  };

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

      {/* Navigation Controls */}
      {currentEntry.page !== 'auth' && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <NavigationControls
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onBack={() => handleNavigate('back')}
                onForward={() => handleNavigate('forward')}
                onHome={() => handleNavigate('home')}
                currentPage={currentEntry.page}
              />
              <Breadcrumbs
                items={getBreadcrumbs()}
                onNavigate={handleNavigate}
                className="hidden md:flex"
              />
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer onNavigate={handleNavigate} />
      <Toaster />
    </div>
  );
}
