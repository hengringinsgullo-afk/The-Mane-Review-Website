import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, User, Shield, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { articleOperations } from '../../lib/supabase';

interface HeaderProps { currentPage: string; onNavigate: (page: string, data?: any) => void; user?: { name: string; role: string } | null; onLogin: () => void; onRegister: () => void; onLogout: () => void; }

const navLinks = [{ name: 'Home', path: '/', label: 'Home' }, { name: 'Markets', path: '/markets', label: 'Markets' }, { name: 'Opinion', path: '/opinion', label: 'Opinion' }, { name: 'Watchlist', path: '/watchlist', label: 'Watchlist' }, { name: 'About', path: '/about', label: 'About' }];

export function Header({ currentPage, onNavigate, user, onLogin, onRegister, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);

  useEffect(() => {
    // Load pending review count for Admins and Editors
    if (user && (user.role === 'Admin' || user.role === 'Editor')) {
      loadPendingReviews();
      
      // Refresh count every 30 seconds
      const interval = setInterval(loadPendingReviews, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadPendingReviews = async () => {
    try {
      const articles = await articleOperations.getArticlesUnderReview();
      setPendingReviewCount(articles.length);
    } catch (error) {
      console.error('Failed to load pending reviews:', error);
    }
  };

  const NavLink = ({ name, path, label, mobile = false }: { name: string; path: string; label: string; mobile?: boolean }) => {
    const isActive = currentPage === name.toLowerCase();
    
    if (mobile) {
      return (
        <button onClick={() => { onNavigate(name.toLowerCase()); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-4 text-lg font-medium rounded-xl transition-all ${isActive ? "bg-secondary text-white" : "text-foreground hover:bg-muted"}`}>
          {label}
        </button>
      );
    }
    
    const baseClasses = "px-3 py-2 text-sm transition-colors hover:text-secondary";
    const activeClasses = isActive ? "text-secondary border-b-2 border-secondary" : "text-foreground";
    return (<button onClick={() => onNavigate(name.toLowerCase())} className={`${baseClasses} ${activeClasses}`}>{label}</button>);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-2 text-xl font-semibold text-primary hover:text-secondary transition-colors" style={{ fontFamily: 'var(--font-headline)' }}>
              <ImageWithFallback src="https://nyc.cloud.appwrite.io/v1/storage/buckets/68cb0104003c3661bc1d/files/68cb01400035ab8ab50e/view?project=68cb00b4003411fc77a1&mode=admin" alt="The Mane Review logo" className="h-10 w-10 object-contain" />
              <span>The Mane Review</span>
            </button>
          </div>
          <nav className="hidden md:flex items-center space-x-1">{navLinks.map((link) => (<NavLink key={link.name} {...link} />))}</nav>
          <div className="flex items-center space-x-4">
            {user ? (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="relative h-8 w-8 rounded-full"><Avatar className="h-8 w-8"><AvatarFallback className="bg-secondary text-secondary-foreground">{user.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>{pendingReviewCount > 0 && (user.role === 'Admin' || user.role === 'Editor') && (<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">{pendingReviewCount}</span>)}</Button></DropdownMenuTrigger><DropdownMenuContent className="w-56" align="end" forceMount><div className="flex flex-col space-y-1 p-2"><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.role}</p></div><DropdownMenuSeparator /><DropdownMenuItem onClick={() => onNavigate('account')}><User className="h-4 w-4 mr-2" />My Account</DropdownMenuItem><DropdownMenuItem onClick={() => onNavigate('watchlist')}>My Watchlist</DropdownMenuItem>{(user?.role === 'Admin' || user?.role === 'Editor') && (<><DropdownMenuSeparator /><DropdownMenuItem onClick={() => onNavigate('admin')} className="relative"><Shield className="h-4 w-4 mr-2" />{user.role === 'Admin' ? 'Admin Dashboard' : 'Review Dashboard'}{pendingReviewCount > 0 && (<Badge variant="destructive" className="ml-auto">{pendingReviewCount}</Badge>)}</DropdownMenuItem></>)}<DropdownMenuSeparator /><DropdownMenuItem onClick={onLogout}>Log out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>) : (<div className="hidden md:flex items-center space-x-2"><Button variant="ghost" onClick={onLogin}>Login</Button><Button onClick={onRegister}>Register</Button></div>)}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}><SheetTrigger asChild><Button variant="ghost" className="md:hidden" size="icon"><Menu className="h-5 w-5" /><span className="sr-only">Toggle menu</span></Button></SheetTrigger><SheetContent side="right" className="w-[300px] sm:w-[400px] rounded-l-3xl"><div className="flex flex-col space-y-6 mt-8"><nav className="flex flex-col space-y-3">{navLinks.map((link) => (<NavLink key={link.name} {...link} mobile />))}</nav>{!user && (<div className="border-t pt-6 flex flex-col space-y-3"><Button variant="ghost" onClick={() => { onLogin(); setMobileMenuOpen(false); }} className="rounded-xl h-12">Login</Button><Button onClick={() => { onRegister(); setMobileMenuOpen(false); }} className="rounded-xl h-12">Register</Button></div>)}</div></SheetContent></Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}