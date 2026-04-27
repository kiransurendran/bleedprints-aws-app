import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import MaterialIcon from '@/components/MaterialIcon';
import { formatMoney } from '@/lib/money';
import { useProducts } from '@/hooks/use-products';
import {
  getStorefrontOrientationBySlug,
  getStorefrontPrintSizes,
  matchesStorefrontCatalogFilters,
  storefrontOrientationFilters,
  storefrontPrintSizeFilters,
  type StorefrontOrientation,
  type StorefrontPrintSizeSlug,
} from '@/lib/storefront/catalog-filters';
import {
  filterStorefrontProductsBySearch,
  getStorefrontSearchQuery,
  getStorefrontSortBySlug,
  sortStorefrontProducts,
  storefrontSortOptions,
  type StorefrontSortSlug,
} from '@/lib/storefront/catalog-discovery';
import {
  defaultStorefrontCollection,
  getStorefrontCollectionBySlug,
} from '@/lib/storefront/collection-filters';
import { usePageMetadata } from '@/lib/seo';

const postersPerPage = 8;

const clampPage = (value: number, pageCount: number) => {
  if (Number.isNaN(value) || value < 1) return 1;
  return Math.min(value, pageCount);
};

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const { data: posters = [], isLoading } = useProducts();
  const selectedCollection = getStorefrontCollectionBySlug(searchParams.get('collection'));
  const searchQuery = getStorefrontSearchQuery(searchParams.get('q'));
  const selectedSort = getStorefrontSortBySlug(searchParams.get('sort'));
  const [mobileSearch, setMobileSearch] = useState(searchQuery);
  const selectedPrintSizes = useMemo(
    () => getStorefrontPrintSizes(searchParams.getAll('size')),
    [searchParams],
  );
  const selectedOrientation = getStorefrontOrientationBySlug(
    searchParams.get('orientation'),
  );
  const hasActiveCatalogFilters =
    selectedPrintSizes.length > 0 || selectedOrientation !== null;
  const hasActiveDiscoveryControls = hasActiveCatalogFilters || searchQuery.length > 0;
  const collectionFilteredPosters = useMemo(
    () =>
      posters.filter((poster) =>
        matchesStorefrontCatalogFilters(poster, {
          collectionSlug: selectedCollection.slug,
          sizeSlugs: selectedPrintSizes,
          orientation: selectedOrientation,
        }),
      ),
    [posters, selectedCollection.slug, selectedOrientation, selectedPrintSizes],
  );
  const searchedPosters = useMemo(
    () => filterStorefrontProductsBySearch(collectionFilteredPosters, searchQuery),
    [collectionFilteredPosters, searchQuery],
  );
  const filteredPosters = useMemo(
    () => sortStorefrontProducts(searchedPosters, selectedSort),
    [searchedPosters, selectedSort],
  );
  const pageCount = Math.max(1, Math.ceil(filteredPosters.length / postersPerPage));
  const currentPage = clampPage(Number.parseInt(searchParams.get('page') ?? '1', 10), pageCount);
  const currentPosters = useMemo(() => {
    const start = (currentPage - 1) * postersPerPage;
    return filteredPosters.slice(start, start + postersPerPage);
  }, [currentPage, filteredPosters]);
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);
  const visibleStart = filteredPosters.length === 0 ? 0 : (currentPage - 1) * postersPerPage + 1;
  const visibleEnd = filteredPosters.length === 0 ? 0 : Math.min(currentPage * postersPerPage, filteredPosters.length);

  useEffect(() => {
    setMobileSearch(searchQuery);
  }, [searchQuery]);

  usePageMetadata({
    title:
      searchQuery
        ? `${selectedCollection.heading} search for "${searchQuery}" | BleedPrints`
        : selectedCollection.slug === defaultStorefrontCollection.slug
          ? 'BleedPrints | Curated Wall Art And Collectible Posters'
          : `${selectedCollection.heading} | BleedPrints`,
    description:
      searchQuery
        ? `Search the BleedPrints catalog for ${searchQuery} and browse matching wall art, poster styles, and curated print details.`
        : selectedCollection.slug === defaultStorefrontCollection.slug
          ? 'Browse curated wall art, collectible posters, and design-led prints from the BleedPrints catalog.'
          : `Browse ${selectedCollection.label.toLowerCase()} from the BleedPrints catalog, with live collection filtering and curated poster detail pages.`,
    path: selectedCollection.slug === defaultStorefrontCollection.slug ? '/' : '/shop',
  });

  useEffect(() => {
    const requestedPage = searchParams.get('page');
    if (requestedPage === null && currentPage === 1) return;
    if (requestedPage === `${currentPage}`) return;

    const nextParams = new URLSearchParams(searchParams);
    if (currentPage === 1) {
      nextParams.delete('page');
    } else {
      nextParams.set('page', `${currentPage}`);
    }
    setSearchParams(nextParams, { replace: true });
  }, [currentPage, searchParams, setSearchParams]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    catalogRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [currentPage, searchQuery, selectedCollection.slug, selectedOrientation, selectedPrintSizes, selectedSort]);

  const updateCollection = (collectionSlug: typeof selectedCollection.slug) => {
    const nextParams = new URLSearchParams(searchParams);

    if (collectionSlug === defaultStorefrontCollection.slug) {
      nextParams.delete('collection');
    } else {
      nextParams.set('collection', collectionSlug);
    }

    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const updatePage = (page: number) => {
    const safePage = clampPage(page, pageCount);
    const nextParams = new URLSearchParams(searchParams);

    if (safePage === 1) {
      nextParams.delete('page');
    } else {
      nextParams.set('page', `${safePage}`);
    }

    setSearchParams(nextParams);
  };

  const updateSearchQuery = (query: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      nextParams.set('q', normalizedQuery);
    } else {
      nextParams.delete('q');
    }

    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const updatePrintSizes = (sizeSlugs: StorefrontPrintSizeSlug[]) => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete('size');
    sizeSlugs.forEach((sizeSlug) => {
      nextParams.append('size', sizeSlug);
    });
    nextParams.delete('page');

    setSearchParams(nextParams);
  };

  const togglePrintSize = (sizeSlug: StorefrontPrintSizeSlug) => {
    const nextSizeSlugs = selectedPrintSizes.includes(sizeSlug)
      ? selectedPrintSizes.filter((selectedSize) => selectedSize !== sizeSlug)
      : [...selectedPrintSizes, sizeSlug];

    updatePrintSizes(nextSizeSlugs);
  };

  const updateOrientation = (orientation: StorefrontOrientation) => {
    const nextParams = new URLSearchParams(searchParams);

    if (selectedOrientation === orientation) {
      nextParams.delete('orientation');
    } else {
      nextParams.set('orientation', orientation);
    }

    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const updateSort = (sort: StorefrontSortSlug) => {
    const nextParams = new URLSearchParams(searchParams);

    if (sort === 'featured') {
      nextParams.delete('sort');
    } else {
      nextParams.set('sort', sort);
    }

    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const clearCatalogFilters = () => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete('size');
    nextParams.delete('orientation');
    nextParams.delete('page');

    setSearchParams(nextParams);
  };

  const activeCatalogFilterLabels = useMemo(
    () => [
      ...(searchQuery ? [`Search: ${searchQuery}`] : []),
      ...selectedPrintSizes.map(
        (sizeSlug) =>
          storefrontPrintSizeFilters.find((filter) => filter.slug === sizeSlug)?.label ??
          sizeSlug.toUpperCase(),
      ),
      ...(selectedOrientation
        ? [
            storefrontOrientationFilters.find(
              (filter) => filter.slug === selectedOrientation,
            )?.label ?? selectedOrientation,
          ]
        : []),
    ],
    [searchQuery, selectedOrientation, selectedPrintSizes],
  );

  const handleMobileSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearchQuery(mobileSearch);
  };

  const emptyStateCopy = searchQuery
    ? 'No products match the current search, collection, print size, and orientation settings yet.'
    : 'No products match the current collection, print size, and orientation filters yet.';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-24 flex-1">
        <div className="max-w-[1440px] mx-auto flex gap-0">
          <Sidebar
            selectedCollection={selectedCollection.slug}
            selectedOrientation={selectedOrientation}
            selectedPrintSizes={selectedPrintSizes}
            hasActiveCatalogFilters={hasActiveCatalogFilters}
            onClearCatalogFilters={clearCatalogFilters}
            onSelectCollection={updateCollection}
            onSelectOrientation={updateOrientation}
            onTogglePrintSize={togglePrintSize}
          />
          <section className="flex-1 bg-surface-container-low p-8">
            {/* Product Grid Header */}
            <div ref={catalogRef} className="flex flex-wrap items-end justify-between gap-4 mb-8 scroll-mt-32">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-surface-container-lowest px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    Catalog
                  </span>
                  <Link
                    to="/series/summer-solstice"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary transition-colors hover:text-on-surface"
                  >
                    Editor&apos;s Choice
                    <MaterialIcon icon="north_east" className="text-sm" />
                  </Link>
                </div>
                <h2 className="text-3xl font-headline font-extrabold tracking-tight">
                  {selectedCollection.heading}
                </h2>
                <p className="text-on-surface-variant text-sm mt-1">
                  Showing {visibleStart}-{visibleEnd} of {filteredPosters.length} curated results
                  {searchQuery ? ` for "${searchQuery}"` : ''}
                </p>
                <form
                  onSubmit={handleMobileSearchSubmit}
                  className="flex items-center gap-2 rounded-2xl bg-surface-container-lowest p-2 md:hidden"
                  role="search"
                >
                  <MaterialIcon icon="search" className="text-on-surface-variant" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
                    placeholder="Search the catalog..."
                    value={mobileSearch}
                    onChange={(event) => setMobileSearch(event.target.value)}
                    aria-label="Search the poster catalog"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileSearch('');
                        updateSearchQuery('');
                      }}
                      className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary"
                    >
                      Clear
                    </button>
                  )}
                </form>
                {hasActiveDiscoveryControls && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {activeCatalogFilterLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-surface-container-lowest px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant"
                      >
                        {label}
                      </span>
                    ))}
                    {hasActiveCatalogFilters && (
                      <button
                        type="button"
                        onClick={clearCatalogFilters}
                        className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary transition-colors hover:text-on-surface"
                      >
                        Clear filters
                      </button>
                    )}
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileSearch('');
                          updateSearchQuery('');
                        }}
                        className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary transition-colors hover:text-on-surface"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sort by</span>
                <select
                  value={selectedSort}
                  onChange={(event) => updateSort(event.target.value as StorefrontSortSlug)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm font-medium focus:ring-1 focus:ring-primary"
                  aria-label="Sort catalog results"
                >
                  {storefrontSortOptions.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {isLoading && (
                Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[3/4] rounded-xl bg-surface-container mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-surface-container w-3/4" />
                      <div className="h-3 rounded bg-surface-container w-1/2" />
                    </div>
                  </div>
                ))
              )}
              {currentPosters.map((poster) => (
                <Link key={poster.slug} to={`/poster/${poster.slug}`} className="group">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-container mb-3">
                    <img
                      src={poster.imageSet.primary.src}
                      alt={poster.imageSet.primary.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {poster.badge && (
                      <span className={`absolute bottom-3 left-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${poster.badgeClassName || 'bg-surface-container-lowest/90 text-on-surface'}`}>
                        {poster.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline font-bold text-sm">{poster.title}</h3>
                      <p className="text-xs text-on-surface-variant">{poster.collection}</p>
                    </div>
                    <span className="font-headline font-bold text-sm">{formatMoney(poster.pricing.amount, poster.pricing.currencyCode)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {!isLoading && filteredPosters.length === 0 && (
              <div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-on-surface-variant mb-12">
                {emptyStateCopy}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage === 1 || filteredPosters.length === 0}
                className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-dim disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Go to previous page"
              >
                <MaterialIcon icon="chevron_left" />
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => updatePage(pageNumber)}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                    pageNumber === currentPage
                      ? 'bg-inverse-surface text-inverse-on-surface'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-dim'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage === pageCount || filteredPosters.length === 0}
                className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-dim disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Go to next page"
              >
                <MaterialIcon icon="chevron_right" />
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
