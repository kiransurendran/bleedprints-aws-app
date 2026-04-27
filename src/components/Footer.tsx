import { Link } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-highest mt-auto">
      <div className="max-w-screen-xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <h3 className="font-headline font-bold text-lg mb-2">BleedPrints</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Redefining space with high-end curated wall art. Sustainable materials, museum-quality printing, delivered to your door.
          </p>
          <div className="flex gap-4 mt-4 text-on-surface-variant">
            <MaterialIcon icon="language" className="cursor-pointer hover:text-on-surface" />
            <MaterialIcon icon="photo_camera" className="cursor-pointer hover:text-on-surface" />
            <MaterialIcon icon="campaign" className="cursor-pointer hover:text-on-surface" />
          </div>
        </div>
        <div>
          <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-4">Shop & Help</h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><Link to="/orders" className="hover:text-on-surface transition-colors">Track Order</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-on-surface transition-colors">Shipping Policy</Link></li>
            <li><Link to="/faq" className="hover:text-on-surface transition-colors">FAQ</Link></li>
            <li><Link to="/returns" className="hover:text-on-surface transition-colors">Returns</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-4">About Us</h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><Link to="/sustainability" className="hover:text-on-surface transition-colors">Sustainability</Link></li>
            <li><Link to="/studio" className="hover:text-on-surface transition-colors">Our Studio</Link></li>
            <li><Link to="/artists" className="hover:text-on-surface transition-colors">Artists</Link></li>
            <li><Link to="/journal" className="hover:text-on-surface transition-colors">Journal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-4">Join the Curation</h4>
          <p className="text-sm text-on-surface-variant mb-4">Create an account to track orders, speed up checkout, and hear about future drops.</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-sm text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Create Account
            <MaterialIcon icon="arrow_forward" className="text-sm" />
          </Link>
        </div>
      </div>
      <div className="border-t border-outline-variant/30 py-6 px-8 flex flex-wrap justify-between items-center max-w-screen-xl mx-auto text-xs text-on-surface-variant">
        <p>© {year} BleedPrints. All Rights Reserved.</p>
        <div className="flex gap-6">
          <Link to="/terms-of-service" className="hover:text-on-surface">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-on-surface">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
