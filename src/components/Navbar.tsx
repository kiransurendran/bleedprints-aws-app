import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { publicEnv } from '@/lib/env';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

const navLinks = [
  { label: 'Collections', path: '/' },
  { label: 'Summer Solstice', path: '/series/summer-solstice' },
  { label: 'Custom Studio', path: '/create' },
  { label: 'Framing', path: '/framing' },
  { label: 'Artists', path: '/artists' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isAdmin, profile, signOut, user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [catalogSearch, setCatalogSearch] = useState('');
  const isCatalogRoute =
    location.pathname === '/' || location.pathname === '/shop';
  const currentCatalogSearch = useMemo(
    () => new URLSearchParams(location.search).get('q')?.trim() ?? '',
    [location.search],
  );

  const accountLabel = useMemo(() => {
    if (profile?.fullName?.trim()) {
      return profile.fullName.trim();
    }

    if (profile?.email) {
      return profile.email;
    }

    if (user?.email) {
      return user.email;
    }

    return 'My Account';
  }, [profile?.email, profile?.fullName, user?.email]);

  const accountInitial = useMemo(() => {
    const source = profile?.fullName?.trim() || profile?.email || user?.email || 'A';
    return source.charAt(0).toUpperCase();
  }, [profile?.email, profile?.fullName, user?.email]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const persisted = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initial = persisted === 'light' || persisted === 'dark' ? persisted : prefersDark ? 'dark' : 'light';
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setCatalogSearch(isCatalogRoute ? currentCatalogSearch : '');
  }, [currentCatalogSearch, isCatalogRoute]);

  const toggleTheme = () => setTheme(curr => (curr === 'dark' ? 'light' : 'dark'));

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextParams = isCatalogRoute
      ? new URLSearchParams(location.search)
      : new URLSearchParams();
    const nextQuery = catalogSearch.trim();

    if (nextQuery) {
      nextParams.set('q', nextQuery);
    } else {
      nextParams.delete('q');
    }

    nextParams.delete('page');

    navigate({
      pathname: '/shop',
      search: nextParams.toString() ? `?${nextParams.toString()}` : '',
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been logged out successfully.',
      });
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Unable to sign out',
        description:
          error instanceof Error ? error.message : 'Please try again in a moment.',
      });
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-header shadow-sm">
      <div className="flex items-center justify-between px-8 py-4 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-12 flex-1">
          <Link to="/" className="text-2xl font-black tracking-tighter text-on-surface uppercase font-headline">
            BleedPrints
          </Link>
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative group"
            role="search"
          >
            <MaterialIcon icon="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="w-full bg-surface-container-highest border-none rounded-[0.75rem] py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 font-body text-sm transition-all duration-300"
              placeholder="Search for wall art, sizes, or styles..."
              type="text"
              value={catalogSearch}
              onChange={(event) => setCatalogSearch(event.target.value)}
              aria-label="Search the poster catalog"
            />
          </form>
        </div>
        <nav className="hidden md:flex items-center gap-8 px-8">
          {navLinks.map(link => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/' || location.pathname === '/shop'
                : location.pathname === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`font-headline tracking-tight transition-colors duration-300 ${
                  isActive
                    ? 'text-on-surface border-b-2 border-secondary pb-1 font-semibold'
                    : 'text-on-surface-variant font-medium hover:text-on-surface'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <button
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            className="p-2 rounded-full text-on-surface hover:text-primary transition-colors"
          >
            <MaterialIcon icon={theme === 'dark' ? 'light_mode' : 'dark_mode'} />
          </button>
          <Link to="/cart" className="relative p-2 text-on-surface scale-95 active:scale-90 transition-transform">
            <MaterialIcon icon="shopping_cart" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-tertiary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-2 py-1.5 text-on-surface transition-colors hover:bg-surface-container-high"
                  aria-label="Open account menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-inverse-surface text-xs font-bold text-inverse-on-surface">
                    {accountInitial}
                  </span>
                  <MaterialIcon icon="expand_more" className="hidden text-[18px] sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl border-outline-variant/20 bg-surface-container-lowest p-2">
                <DropdownMenuLabel className="px-3 py-3">
                  <p className="text-sm font-semibold text-on-surface">{accountLabel}</p>
                  <p className="mt-1 text-xs font-normal text-on-surface-variant">
                    {isAdmin ? 'Admin account' : 'Signed in'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-outline-variant/20" />
                <DropdownMenuItem asChild className="rounded-xl px-3 py-3 text-on-surface focus:bg-surface-container-high">
                  <Link to="/account" className="flex items-center gap-3">
                    <MaterialIcon icon="account_circle" className="text-[18px] text-secondary" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-3 text-on-surface focus:bg-surface-container-high">
                  <Link to="/orders" className="flex items-center gap-3">
                    <MaterialIcon icon="receipt_long" className="text-[18px] text-secondary" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-3 text-on-surface focus:bg-surface-container-high">
                  <Link to="/" className="flex items-center gap-3">
                    <MaterialIcon icon="collections" className="text-[18px] text-secondary" />
                    Collections
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-3 text-on-surface focus:bg-surface-container-high">
                    <Link to={publicEnv.adminDashboardPath} className="flex items-center gap-3">
                      <MaterialIcon icon="admin_panel_settings" className="text-[18px] text-secondary" />
                      Admin Studio
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-outline-variant/20" />
                <DropdownMenuItem
                  onSelect={() => {
                    void handleSignOut();
                  }}
                  className="rounded-xl px-3 py-3 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <MaterialIcon icon="logout" className="mr-3 text-[18px]" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="p-2 text-on-surface scale-95 active:scale-90 transition-transform" aria-label="Sign in">
              <MaterialIcon icon="account_circle" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
