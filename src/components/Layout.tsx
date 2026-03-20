import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Palette, Compass, Moon, Sun, Menu, X, Phone, CreditCard, FileText, Shield, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 🔐 Clerk
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';

interface LayoutProps {
  children: React.ReactNode;
  credits?: number;
}

export function Layout({ children, credits = 0 }: LayoutProps) {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(prev => !prev);
  };

  const navLinks = [
    { href: '/',        label: 'Editor',  icon: <Palette className="w-4 h-4" /> },
    { href: '/explore', label: 'Explore', icon: <Compass className="w-4 h-4" /> },
    { href: '/contact', label: 'Contact', icon: <Phone   className="w-4 h-4" /> },
  ];

  const legalLinks = [
    { href: '/terms.html',   label: 'Terms & Conditions', icon: <FileText className="w-4 h-4" /> },
    { href: '/privacy.html', label: 'Privacy Policy',     icon: <Shield   className="w-4 h-4" /> },
    { href: '/refund.html',  label: 'Refund Policy',      icon: <Receipt  className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer select-none">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                ImageQuoter
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV ──────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link key={href} href={href}>
                <Button variant={location === href ? 'secondary' : 'ghost'} size="sm">
                  {icon}<span className="ml-2">{label}</span>
                </Button>
              </Link>
            ))}

            <div className="w-px h-6 bg-border mx-2" />

            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Clerk auth — desktop */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm" className="ml-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-2 ml-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-sm">
                  <span className="font-medium max-w-[100px] truncate">
                    {user?.firstName ?? user?.username ?? 'User'}
                  </span>
                  <span className="text-primary font-bold">· {credits} cr</span>
                </div>
                {/* Clerk's built-in user button (avatar + dropdown with sign out) */}
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </nav>

          {/* ── MOBILE RIGHT SIDE ────────────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* ── MOBILE DROPDOWN MENU ─────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-xl px-4 py-4 space-y-1 shadow-lg">

            {/* Nav links */}
            {navLinks.map(({ href, label, icon }) => (
              <Link key={href} href={href}>
                <Button variant={location === href ? 'secondary' : 'ghost'} className="w-full justify-start">
                  {icon}<span className="ml-2">{label}</span>
                </Button>
              </Link>
            ))}

            {/* Auth section */}
            <div className="pt-2 border-t border-border/40 space-y-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/60">
                  <UserButton afterSignOutUrl="/" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user?.fullName ?? user?.username ?? 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">{credits} credits remaining</p>
                  </div>
                </div>
                <Link href="/buy-credits">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <CreditCard className="w-4 h-4 mr-2" />Buy Credits
                  </Button>
                </Link>
              </SignedIn>
            </div>

            {/* Legal links — inside menu on mobile, not blocking content */}
            <div className="pt-2 border-t border-border/40 space-y-1">
              <p className="text-xs text-muted-foreground px-2 py-1 font-medium uppercase tracking-wide">Legal</p>
              {legalLinks.map(({ href, label, icon }) => (
                <a key={href} href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  {icon}<span>{label}</span>
                </a>
              ))}
            </div>

          </div>
        )}
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0">
        {children}
      </main>

      {/* ── FOOTER — desktop only, hidden on mobile ─────────────────── */}
      <footer className="hidden md:block flex-shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-4">
          {legalLinks.map(({ href, label }, i) => (
            <React.Fragment key={href}>
              {i > 0 && <span className="text-xs text-border">|</span>}
              <a href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </a>
            </React.Fragment>
          ))}
        </div>
      </footer>
    </div>
  );
}
