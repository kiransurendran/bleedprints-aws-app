import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/use-products';
import { publicEnv } from '@/lib/env';
import { formatMoney } from '@/lib/money';
import { usePageMetadata } from '@/lib/seo';

type StudioSourceMode = 'catalog' | 'upload';
type StudioLayoutId = 'editorial' | 'minimal' | 'caption';
type StudioFrameTone = 'ivory' | 'ink' | 'sand';

const layoutPresets: Array<{
  id: StudioLayoutId;
  label: string;
  description: string;
}> = [
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Large centered headline with a gallery-style caption.',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean corner label with more breathing room around the art.',
  },
  {
    id: 'caption',
    label: 'Caption',
    description: 'Lower-left treatment with room for a stronger subtitle.',
  },
];

const frameToneOptions: Array<{
  id: StudioFrameTone;
  label: string;
  canvasClassName: string;
  frameClassName: string;
}> = [
  {
    id: 'ivory',
    label: 'Ivory',
    canvasClassName: 'bg-[#ece4d8]',
    frameClassName: 'border-[#faf5ef]',
  },
  {
    id: 'ink',
    label: 'Ink',
    canvasClassName: 'bg-[#121212]',
    frameClassName: 'border-[#1f1f1f]',
  },
  {
    id: 'sand',
    label: 'Sand',
    canvasClassName: 'bg-[#e1d2bf]',
    frameClassName: 'border-[#f3e9dc]',
  },
];

export default function CreatePosterPage() {
  const { data: posters = [], isLoading } = useProducts();
  const { addItem } = useCart();
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedProductSlug, setSelectedProductSlug] = useState('');
  const [selectedDimensionId, setSelectedDimensionId] = useState('');
  const [sourceMode, setSourceMode] = useState<StudioSourceMode>('catalog');
  const [headline, setHeadline] = useState('Summer Solstice');
  const [subheadline, setSubheadline] = useState('CUSTOM STUDIO PREVIEW');
  const [layoutId, setLayoutId] = useState<StudioLayoutId>('editorial');
  const [frameTone, setFrameTone] = useState<StudioFrameTone>('ivory');
  const [scale, setScale] = useState(100);
  const [uploadedArtwork, setUploadedArtwork] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const collectionOptions = useMemo(
    () => [
      { slug: 'all', label: 'All live prints' },
      ...Array.from(new Set(posters.map((poster) => poster.collection))).map(
        (collection) => ({
          slug: collection,
          label: collection,
        }),
      ),
    ],
    [posters],
  );

  const availableProducts = useMemo(() => {
    if (selectedCollection === 'all') {
      return posters;
    }

    return posters.filter((poster) => poster.collection === selectedCollection);
  }, [posters, selectedCollection]);

  useEffect(() => {
    if (availableProducts.some((poster) => poster.slug === selectedProductSlug)) {
      return;
    }

    setSelectedProductSlug(availableProducts[0]?.slug ?? '');
  }, [availableProducts, selectedProductSlug]);

  const selectedProduct = useMemo(
    () =>
      availableProducts.find((poster) => poster.slug === selectedProductSlug) ??
      availableProducts[0],
    [availableProducts, selectedProductSlug],
  );

  useEffect(() => {
    if (!selectedProduct) {
      setSelectedDimensionId('');
      return;
    }

    if (
      selectedProduct.dimensions.some(
        (dimension) => dimension.id === selectedDimensionId,
      )
    ) {
      return;
    }

    setSelectedDimensionId(selectedProduct.dimensions[0]?.id ?? '');
  }, [selectedDimensionId, selectedProduct]);

  useEffect(() => {
    return () => {
      if (uploadedArtwork?.url) {
        URL.revokeObjectURL(uploadedArtwork.url);
      }
    };
  }, [uploadedArtwork]);

  const selectedDimension =
    selectedProduct?.dimensions.find(
      (dimension) => dimension.id === selectedDimensionId,
    ) ?? selectedProduct?.dimensions[0];
  const activeLayout =
    layoutPresets.find((layout) => layout.id === layoutId) ?? layoutPresets[0];
  const activeFrameTone =
    frameToneOptions.find((tone) => tone.id === frameTone) ?? frameToneOptions[0];
  const previewImage =
    sourceMode === 'upload'
      ? uploadedArtwork?.url ?? ''
      : selectedProduct?.imageSet.primary.src ?? '';
  const previewAlt =
    sourceMode === 'upload'
      ? uploadedArtwork?.name ?? 'Uploaded studio artwork preview'
      : selectedProduct?.imageSet.primary.alt ?? 'Studio preview artwork';

  const handleArtworkUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadedArtwork((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }

      return {
        name: file.name,
        url: URL.createObjectURL(file),
      };
    });
    setSourceMode('upload');
  };

  const handleAddSelectedPrint = () => {
    if (!selectedProduct || !selectedDimension) {
      return;
    }

    setSourceMode('catalog');
    addItem({
      id: `${selectedProduct.slug}-${selectedDimension.id}`,
      productSlug: selectedProduct.slug,
      dimensionId: selectedDimension.id,
      name: selectedProduct.title,
      image: selectedProduct.imageSet.primary.src,
      price: selectedDimension.price.amount,
      currencyCode: selectedDimension.price.currencyCode,
      quantity: 1,
      size: `${selectedDimension.label} (${selectedDimension.widthCm} x ${selectedDimension.heightCm} ${selectedDimension.unit})`,
      frame: 'Unframed',
      series: selectedProduct.collection,
    });
  };

  const customQuoteHref = useMemo(() => {
    const messageLines = [
      'Hi BleedPrints Studio,',
      '',
      'I would like a custom print quote for the following setup:',
      `Headline: ${headline || 'Not provided'}`,
      `Subheadline: ${subheadline || 'Not provided'}`,
      `Layout: ${activeLayout.label}`,
      `Frame tone: ${activeFrameTone.label}`,
      `Artwork source: ${uploadedArtwork?.name || 'Artwork not uploaded yet'}`,
      '',
      'Please reply with the next steps for artwork review and pricing.',
    ];

    return `mailto:studio@bleedprints.com?subject=${encodeURIComponent(
      'BleedPrints custom studio request',
    )}&body=${encodeURIComponent(messageLines.join('\n'))}`;
  }, [activeFrameTone.label, activeLayout.label, headline, subheadline, uploadedArtwork?.name]);

  usePageMetadata({
    title: 'Custom Studio | BleedPrints',
    description:
      'Configure a live BleedPrints print, preview uploads, and build a studio-ready poster layout before checkout or a custom quote request.',
    path: '/create',
    noIndex: true,
  });

  if (!isLoading && posters.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-surface-container-low pt-28">
          <div className="mx-auto max-w-5xl px-6 pb-20">
            <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-10 text-center shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">
                Custom Studio
              </p>
              <h1 className="mt-4 text-4xl font-headline font-extrabold tracking-tight">
                Add live catalog art before using the studio.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant">
                The custom studio now reads from the live storefront catalog. If the page is empty,
                confirm that your Supabase products and images are available to the public catalog.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-inverse-surface px-5 py-3 text-sm font-semibold text-inverse-on-surface"
                >
                  Browse collections
                  <MaterialIcon icon="arrow_forward" className="text-sm" />
                </Link>
                <Link
                  to={publicEnv.adminDashboardPath}
                  className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/30 px-5 py-3 text-sm font-semibold text-on-surface"
                >
                  Open admin studio
                  <MaterialIcon icon="open_in_new" className="text-sm" />
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-container-low pt-24">
        <div className="mx-auto grid max-w-[1500px] gap-0 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          <aside className="border-b border-outline-variant/20 bg-surface-container-lowest p-6 xl:min-h-[calc(100vh-6rem)] xl:border-b-0 xl:border-r">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">
              Studio Source
            </p>
            <h1 className="mt-3 text-2xl font-headline font-extrabold tracking-tight">
              Custom Studio
            </h1>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Build a live preview with catalog art or your own uploaded artwork, then either add the selected print to cart or request a custom quote.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-surface-container p-2">
              {[
                { id: 'catalog', label: 'Catalog print' },
                { id: 'upload', label: 'Upload art' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSourceMode(option.id as StudioSourceMode)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    sourceMode === option.id
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
                Collections
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {collectionOptions.map((collection) => (
                  <button
                    key={collection.slug}
                    type="button"
                    onClick={() => setSelectedCollection(collection.slug)}
                    className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      selectedCollection === collection.slug
                        ? 'bg-inverse-surface text-inverse-on-surface'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {collection.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
                  Live Prints
                </p>
                <span className="text-xs text-on-surface-variant">
                  {availableProducts.length}
                </span>
              </div>
              <div className="mt-4 grid max-h-[460px] gap-3 overflow-y-auto pr-1">
                {availableProducts.map((poster) => (
                  <button
                    key={poster.slug}
                    type="button"
                    onClick={() => {
                      setSelectedProductSlug(poster.slug);
                      setSourceMode('catalog');
                    }}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                      selectedProduct?.slug === poster.slug
                        ? 'border-secondary/60 bg-surface-container-high'
                        : 'border-outline-variant/20 bg-surface-container hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="h-16 w-12 overflow-hidden rounded-xl bg-surface-container-low">
                      <img
                        src={poster.imageSet.primary.src}
                        alt={poster.imageSet.primary.alt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">
                        {poster.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant">
                        {poster.collection}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedProduct && selectedProduct.dimensions.length > 0 && (
              <div className="mt-8 rounded-[1.75rem] bg-surface-container p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
                  Print Size
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {selectedProduct.dimensions.map((dimension) => (
                    <button
                      key={dimension.id}
                      type="button"
                      onClick={() => setSelectedDimensionId(dimension.id)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                        selectedDimension?.id === dimension.id
                          ? 'bg-inverse-surface text-inverse-on-surface'
                          : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {dimension.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="relative flex min-h-[720px] items-center justify-center overflow-hidden px-6 py-10 sm:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(232,194,132,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(87,45,33,0.16),_transparent_30%)]" />
            <div className="relative z-10 w-full max-w-4xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">
                    Live Preview
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {sourceMode === 'catalog'
                      ? 'This preview uses a live storefront print and can go straight to cart.'
                      : 'Upload previews create a studio brief for manual custom-quote review.'}
                  </p>
                </div>
                {selectedProduct && (
                  <Link
                    to={`/poster/${selectedProduct.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-on-surface transition-colors hover:bg-surface-container-lowest"
                  >
                    Open product page
                    <MaterialIcon icon="arrow_outward" className="text-sm" />
                  </Link>
                )}
              </div>

              <div className={`relative mx-auto aspect-[1/1.414] w-full max-w-[520px] rounded-[2.5rem] p-5 shadow-[0_40px_90px_rgba(12,12,12,0.18)] ${activeFrameTone.canvasClassName}`}>
                <div className={`relative h-full overflow-hidden rounded-[2rem] border-[18px] ${activeFrameTone.frameClassName}`}>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={previewAlt}
                      className="h-full w-full object-contain transition-transform duration-500"
                      style={{ transform: `scale(${scale / 100})` }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-surface-container text-center text-sm text-on-surface-variant">
                      Choose a live print or upload artwork to start the preview.
                    </div>
                  )}

                  {layoutId === 'editorial' && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent px-8 pb-10 pt-24 text-center text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/75">
                        {subheadline}
                      </p>
                      <h2 className="mt-3 text-4xl font-headline font-extrabold tracking-tight">
                        {headline}
                      </h2>
                    </div>
                  )}

                  {layoutId === 'minimal' && (
                    <div className="absolute left-6 top-6 max-w-[70%] rounded-2xl bg-black/60 px-5 py-4 text-white backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/70">
                        Studio layout
                      </p>
                      <h2 className="mt-2 text-2xl font-headline font-extrabold tracking-tight">
                        {headline}
                      </h2>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/75">
                        {subheadline}
                      </p>
                    </div>
                  )}

                  {layoutId === 'caption' && (
                    <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/85 px-5 py-4 text-on-surface backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
                        Custom caption
                      </p>
                      <div className="mt-2 flex items-end justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-headline font-extrabold tracking-tight">
                            {headline}
                          </h2>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                            {subheadline}
                          </p>
                        </div>
                        <MaterialIcon icon="north_east" className="text-secondary" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mx-auto mt-8 grid max-w-4xl gap-4 rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                    Source
                  </p>
                  <p className="mt-2 text-sm font-semibold text-on-surface">
                    {sourceMode === 'catalog'
                      ? selectedProduct?.title || 'Choose a live print'
                      : uploadedArtwork?.name || 'Upload artwork'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                    Size
                  </p>
                  <p className="mt-2 text-sm font-semibold text-on-surface">
                    {selectedDimension
                      ? `${selectedDimension.label} (${selectedDimension.widthCm} x ${selectedDimension.heightCm} ${selectedDimension.unit})`
                      : 'Select a print'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                    Ready Path
                  </p>
                  <p className="mt-2 text-sm font-semibold text-on-surface">
                    {sourceMode === 'catalog'
                      ? 'Direct cart and checkout'
                      : 'Manual review and quote'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="border-t border-outline-variant/20 bg-surface-container-lowest p-6 xl:min-h-[calc(100vh-6rem)] xl:border-l xl:border-t-0">
            <div className="rounded-[1.75rem] bg-surface-container p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
                    Upload Artwork
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Use your own JPG or PNG to preview a custom composition.
                  </p>
                </div>
                <MaterialIcon icon="cloud_upload" className="text-2xl text-secondary" />
              </div>
              <label className="mt-5 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-4 py-6 text-center text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleArtworkUpload}
                  className="sr-only"
                />
                {uploadedArtwork ? uploadedArtwork.name : 'Choose artwork file'}
              </label>
              {uploadedArtwork && (
                <button
                  type="button"
                  onClick={() => {
                    if (uploadedArtwork.url) {
                      URL.revokeObjectURL(uploadedArtwork.url);
                    }
                    setUploadedArtwork(null);
                    setSourceMode('catalog');
                  }}
                  className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-on-surface"
                >
                  Remove upload
                </button>
              )}
            </div>

            <div className="mt-6 rounded-[1.75rem] bg-surface-container p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
                Text Overlay
              </p>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    Headline
                  </span>
                  <input
                    value={headline}
                    onChange={(event) => setHeadline(event.target.value)}
                    className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-secondary/60"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    Subheadline
                  </span>
                  <input
                    value={subheadline}
                    onChange={(event) => setSubheadline(event.target.value)}
                    className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-secondary/60"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] bg-surface-container p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
                Layout Template
              </p>
              <div className="mt-4 grid gap-3">
                {layoutPresets.map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => setLayoutId(layout.id)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                      activeLayout.id === layout.id
                        ? 'border-secondary/60 bg-surface-container-lowest'
                        : 'border-outline-variant/20 bg-surface-container-low hover:bg-surface-container-lowest'
                    }`}
                  >
                    <p className="text-sm font-semibold text-on-surface">{layout.label}</p>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                      {layout.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] bg-surface-container p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
                Frame Tone
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {frameToneOptions.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setFrameTone(tone.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                      frameTone === tone.id
                        ? 'bg-inverse-surface text-inverse-on-surface'
                        : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    Artwork scale
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    {scale}%
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="120"
                  step="1"
                  value={scale}
                  onChange={(event) => setScale(Number(event.target.value))}
                  className="mt-3 w-full accent-secondary"
                />
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] bg-inverse-surface p-5 text-inverse-on-surface">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-inverse-on-surface/70">
                Action Path
              </p>
              {sourceMode === 'catalog' && selectedProduct && selectedDimension ? (
                <>
                  <p className="mt-3 text-sm leading-6 text-inverse-on-surface/80">
                    This preview is tied to a real storefront product, so you can move straight into cart and checkout.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddSelectedPrint}
                    className="mt-5 w-full rounded-2xl bg-white px-4 py-4 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
                  >
                    Add Selected Print - {formatMoney(selectedDimension.price.amount, selectedDimension.price.currencyCode)}
                  </button>
                  <Link
                    to={`/poster/${selectedProduct.slug}`}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    View full product details
                    <MaterialIcon icon="arrow_forward" className="text-sm" />
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-6 text-inverse-on-surface/80">
                    Uploaded artwork previews are ready for design review, but they do not create a live cart item automatically yet.
                  </p>
                  <a
                    href={customQuoteHref}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
                  >
                    Request custom quote
                    <MaterialIcon icon="north_east" className="text-sm" />
                  </a>
                  <p className="mt-3 text-xs leading-5 text-inverse-on-surface/70">
                    Manual step: custom uploads still need studio approval before pricing, production, and checkout.
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
