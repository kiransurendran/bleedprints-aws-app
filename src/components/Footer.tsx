import { Link } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';

export default function Footer() {
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
            <li><a href="#" className="hover:text-on-surface transition-colors">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-on-surface transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-on-surface transition-colors">Returns</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-4">About Us</h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><a href="#" className="hover:text-on-surface transition-colors">Sustainability</a></li>
            <li><a href="#" className="hover:text-on-surface transition-colors">Our Studio</a></li>
            <li><a href="#" className="hover:text-on-surface transition-colors">Artists</a></li>
            <li><a href="#" className="hover:text-on-surface transition-colors">Journal</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-4">Join the Curation</h4>
          <p className="text-sm text-on-surface-variant mb-4">Get early access to drops and styling tips.</p>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-sm px-4 py-2 text-sm focus:ring-1 focus:ring-primary"
              placeholder="Email"
              type="email"
            />
            <button className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-sm text-sm font-bold hover:opacity-90 transition-opacity">
              JOIN
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-outline-variant/30 py-6 px-8 flex flex-wrap justify-between items-center max-w-screen-xl mx-auto text-xs text-on-surface-variant">
        <p>© 2024 BleedPrints. All Rights Reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-on-surface">Terms of Service</a>
          <a href="#" className="hover:text-on-surface">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
