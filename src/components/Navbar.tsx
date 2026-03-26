import { Link, useLocation } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { label: 'Collections', path: '/' },
  { label: 'Custom Studio', path: '/create' },
  { label: 'Framing', path: '#' },
  { label: 'Artists', path: '#' },
];

export default function Navbar() {
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <header className="fixed top-0 w-full z-50 glass-header shadow-sm">
      <div className="flex items-center justify-between px-8 py-4 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-12 flex-1">
          <Link to="/" className="text-2xl font-black tracking-tighter text-zinc-900 uppercase font-headline">
            BleedPrints
          </Link>
          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <MaterialIcon icon="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              className="w-full bg-surface-container-highest border-none rounded-[0.75rem] py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 font-body text-sm transition-all duration-300"
              placeholder="Search for wall art, sizes, or styles..."
              type="text"
            />
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 px-8">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`font-headline tracking-tight transition-colors duration-300 ${
                  isActive
                    ? 'text-zinc-900 border-b-2 border-zinc-900 pb-1 font-semibold'
                    : 'text-zinc-500 font-medium hover:text-zinc-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="p-2 text-zinc-800 scale-95 active:scale-90 transition-transform relative">
            <MaterialIcon icon="shopping_cart" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-tertiary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <Link to="/orders" className="p-2 text-zinc-800 scale-95 active:scale-90 transition-transform">
            <MaterialIcon icon="account_circle" />
          </Link>
        </div>
      </div>
    </header>
  );
}
