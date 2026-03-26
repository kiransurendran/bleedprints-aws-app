import { Link } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';

const categories = [
  { icon: 'brush', label: 'Abstract', active: true },
  { icon: 'filter_hdr', label: 'Minimalist' },
  { icon: 'photo_camera', label: 'Photography' },
  { icon: 'history', label: 'Vintage' },
  { icon: 'palette', label: 'Pop Art' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col gap-2 p-4 h-full w-64 border-r-0 bg-surface-container-low sticky top-24 self-start">
      <div className="mb-6 px-2">
        <h2 className="font-headline font-bold text-lg text-on-surface uppercase tracking-wider">Categories</h2>
        <p className="text-xs text-on-surface-variant font-medium">Browse by Style</p>
      </div>
      <nav className="flex flex-col gap-1">
        {categories.map(cat => (
          <button
            key={cat.label}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium hover:translate-x-1 transition-transform duration-200 ease-in-out rounded-lg ${
              cat.active
                ? 'bg-surface-container-highest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-dim/70'
            }`}
          >
            <MaterialIcon icon={cat.icon} />
            <span>{cat.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-8 px-2 space-y-8">
        <div>
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface mb-4">Print Size</h3>
          <div className="space-y-3">
            {['A3 (29.7 x 42 cm)', 'A4 (21.0 x 29.7 cm)', 'A5 (14.8 x 21.0 cm)'].map(size => (
              <label key={size} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="rounded-sm border-outline-variant text-primary focus:ring-primary/20" />
                <span className="text-sm font-body text-on-surface-variant group-hover:text-on-surface">{size}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface mb-4">Orientation</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="p-3 border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-colors flex flex-col items-center gap-2">
              <MaterialIcon icon="crop_portrait" className="text-secondary" />
              <span className="text-[10px] font-bold uppercase">Portrait</span>
            </button>
            <button className="p-3 border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-colors flex flex-col items-center gap-2">
              <MaterialIcon icon="crop_landscape" className="text-secondary" />
              <span className="text-[10px] font-bold uppercase">Landscape</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
