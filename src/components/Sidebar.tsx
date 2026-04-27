import MaterialIcon from './MaterialIcon';
import {
  storefrontOrientationFilters,
  storefrontPrintSizeFilters,
  type StorefrontOrientation,
  type StorefrontPrintSizeSlug,
} from '@/lib/storefront/catalog-filters';
import {
  storefrontCollectionFilters,
  type StorefrontCollectionSlug,
} from '@/lib/storefront/collection-filters';

type SidebarProps = {
  selectedCollection: StorefrontCollectionSlug;
  selectedOrientation: StorefrontOrientation | null;
  selectedPrintSizes: StorefrontPrintSizeSlug[];
  hasActiveCatalogFilters: boolean;
  onClearCatalogFilters: () => void;
  onSelectCollection: (collection: StorefrontCollectionSlug) => void;
  onSelectOrientation: (orientation: StorefrontOrientation) => void;
  onTogglePrintSize: (size: StorefrontPrintSizeSlug) => void;
};

export default function Sidebar({
  selectedCollection,
  selectedOrientation,
  selectedPrintSizes,
  hasActiveCatalogFilters,
  onClearCatalogFilters,
  onSelectCollection,
  onSelectOrientation,
  onTogglePrintSize,
}: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col gap-2 p-4 h-full w-64 border-r-0 bg-surface-container-low sticky top-24 self-start">
      <div className="mb-6 px-2">
        <h2 className="font-headline font-bold text-lg text-on-surface uppercase tracking-wider">Categories</h2>
        <p className="text-xs text-on-surface-variant font-medium">Browse by Style</p>
      </div>
      <nav className="flex flex-col gap-1">
        {storefrontCollectionFilters.map((collection) => (
          <button
            key={collection.slug}
            type="button"
            onClick={() => onSelectCollection(collection.slug)}
            aria-pressed={selectedCollection === collection.slug}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium hover:translate-x-1 transition-transform duration-200 ease-in-out rounded-lg ${
              selectedCollection === collection.slug
                ? 'bg-surface-container-highest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-dim/70'
            }`}
          >
            <MaterialIcon icon={collection.icon} />
            <span>{collection.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-8 px-2 space-y-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
            Filter Catalog
          </p>
          {hasActiveCatalogFilters && (
            <button
              type="button"
              onClick={onClearCatalogFilters}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary transition-colors hover:text-on-surface"
            >
              Clear
            </button>
          )}
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface mb-4">Print Size</h3>
          <div className="space-y-3">
            {storefrontPrintSizeFilters.map((size) => (
              <label key={size.slug} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedPrintSizes.includes(size.slug)}
                  onChange={() => onTogglePrintSize(size.slug)}
                  className="rounded-sm border-outline-variant text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-body text-on-surface-variant group-hover:text-on-surface">
                  {size.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface mb-4">Orientation</h3>
          <div className="grid grid-cols-2 gap-2">
            {storefrontOrientationFilters.map((orientation) => {
              const isActive = selectedOrientation === orientation.slug;

              return (
                <button
                  key={orientation.slug}
                  type="button"
                  onClick={() => onSelectOrientation(orientation.slug)}
                  aria-pressed={isActive}
                  className={`p-3 border rounded-xl transition-colors flex flex-col items-center gap-2 ${
                    isActive
                      ? 'border-primary/40 bg-surface-container-highest text-on-surface'
                      : 'border-outline-variant/30 hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <MaterialIcon
                    icon={orientation.icon}
                    className={isActive ? 'text-primary' : 'text-secondary'}
                  />
                  <span className="text-[10px] font-bold uppercase">{orientation.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
