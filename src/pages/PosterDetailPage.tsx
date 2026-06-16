import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import NotFound from './NotFound';
import { formatMoney } from '@/lib/money';
import { usePageMetadata } from '@/lib/seo';
import { useProduct } from '@/hooks/use-products';

export default function PosterDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data: product, isLoading } = useProduct(slug);
  const defaultDimensionId =
    product?.dimensions.find((dimension) => dimension.id === 'a4')?.id ??
    product?.dimensions[0]?.id ??
    '';
  const [selectedDimensionId, setSelectedDimensionId] = useState(defaultDimensionId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const metadataTitle = product?.seo.title || 'Poster Details | BleedPrints';
  const metadataDescription =
    product?.seo.description ||
    'View poster details, imagery, pricing, and production notes for this BleedPrints artwork.';
  const metadataImage = product?.seo.ogImage || product?.imageSet.primary.src;
  const metadataPath = product?.seo.canonicalPath || `/poster/${slug || ''}`;

  useEffect(() => {
    setIsViewerOpen(false);
    setSelectedImage(0);
    setQuantity(1);
    setSelectedDimensionId(defaultDimensionId);
  }, [defaultDimensionId, slug]);

  usePageMetadata({
    title: metadataTitle,
    description: metadataDescription,
    path: metadataPath,
    image: metadataImage,
    ogType: product ? 'product' : 'website',
    structuredData: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.description,
          image: [
            product.imageSet.primary.src,
            ...product.imageSet.gallery.map((image) => image.src),
          ],
          sku: product.slug,
          brand: {
            '@type': 'Brand',
            name: 'BleedPrints',
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: product.pricing.currencyCode,
            price: product.pricing.amount,
            availability: product.availability.availableForSale
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url: metadataPath,
          },
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
            <div className="lg:col-span-7 rounded-xl aspect-[3/4] bg-surface-container-low" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-4 w-24 rounded bg-surface-container-low" />
              <div className="h-12 w-3/4 rounded bg-surface-container-low" />
              <div className="h-8 w-1/3 rounded bg-surface-container-low" />
              <div className="h-28 rounded-xl bg-surface-container-low" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return <NotFound />;
  }

  const selectedDimension =
    product.dimensions.find((dimension) => dimension.id === selectedDimensionId) ??
    product.dimensions[0];
  const allImages = [product.imageSet.primary, ...product.imageSet.gallery];
  const displayPrice = selectedDimension.price.amount;
  const originalPrice =
    selectedDimension.price.compareAtAmount ?? product.pricing.compareAtAmount ?? displayPrice;
  const selectedArtwork = allImages[selectedImage];

  const openViewerForImage = (index: number) => {
    setSelectedImage(index);
    setIsViewerOpen(true);
  };

  const stepImage = (direction: -1 | 1) => {
    setSelectedImage((currentImage) => {
      const nextImage = currentImage + direction;

      if (nextImage < 0) {
        return allImages.length - 1;
      }

      if (nextImage >= allImages.length) {
        return 0;
      }

      return nextImage;
    });
  };

  const handleAddToCart = () => {
    addItem({
      id: `${product.slug}-${selectedDimension.id}`,
      productSlug: product.slug,
      dimensionId: selectedDimension.id,
      name: product.title,
      image: product.imageSet.primary.src,
      price: selectedDimension.price.amount,
      currencyCode: selectedDimension.price.currencyCode,
      quantity,
      size: `${selectedDimension.label} (${selectedDimension.widthCm} x ${selectedDimension.heightCm} ${selectedDimension.unit})`,
      frame: 'Unframed',
      series: product.collection,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <button
              type="button"
              onClick={() => openViewerForImage(selectedImage)}
              className="group relative block w-full overflow-hidden rounded-xl bg-surface-container-low text-left aspect-[3/4]"
              aria-label={`Open ${product.title} image ${selectedImage + 1} in full screen`}
            >
              <img
                src={selectedArtwork.src}
                alt={selectedArtwork.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors group-hover:bg-black/70">
                <MaterialIcon icon="fullscreen" className="text-sm" />
                Full Screen
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                  Tap to enlarge
                </p>
              </div>
            </button>
            <div className="grid grid-cols-4 gap-4">
              {allImages.map((thumb, index) => (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View ${product.title} image ${index + 1}`}
                  className={`aspect-square rounded-lg bg-surface-container-low overflow-hidden cursor-pointer transition-opacity ${
                    selectedImage === index ? 'border-2 border-primary opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={thumb.src} alt={thumb.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5 flex flex-col">
            <nav className="flex mb-4 text-xs font-label text-secondary gap-2">
              <Link to="/" className="hover:underline">Collections</Link>
              <span>/</span>
              <Link to="/shop" className="hover:underline">{product.collection}</Link>
              <span>/</span>
              <span className="text-on-surface font-semibold">{product.title}</span>
            </nav>

            <h1 className="text-4xl font-headline font-extrabold tracking-tight mb-2">{product.title}</h1>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                {product.collection}
              </span>
              <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                {product.availability.statusLabel}
              </span>
              {product.features[0] && (
                <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                  {product.features[0]}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-headline font-extrabold">{formatMoney(displayPrice, selectedDimension.price.currencyCode)}</span>
              <span className="text-lg text-outline line-through">{formatMoney(originalPrice, selectedDimension.price.currencyCode)}</span>
              <span className="bg-tertiary-container text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                {product.badge ?? product.availability.statusLabel}
              </span>
            </div>

            <p className="text-sm text-secondary leading-relaxed mb-6">{product.description}</p>

            <div className="mb-6 rounded-xl bg-surface-container-lowest p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Availability</p>
                  <p className="text-sm font-semibold text-on-surface mt-1">{product.availability.statusLabel}</p>
                </div>
                <p className="text-xs text-secondary">{product.availability.leadTimeLabel}</p>
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3">Select Size</h3>
              <div className="flex gap-3">
                {product.dimensions.map((dimension) => (
                  <button
                    key={dimension.id}
                    onClick={() => setSelectedDimensionId(dimension.id)}
                    className={`px-5 py-2 border text-sm font-medium transition-all ${
                      selectedDimension.id === dimension.id
                        ? 'border-on-surface bg-surface-container-lowest shadow-sm'
                        : 'border-outline-variant/30 hover:border-outline'
                    }`}
                  >
                    {dimension.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-secondary mt-3">
                Selected size: {selectedDimension.widthCm} x {selectedDimension.heightCm} {selectedDimension.unit}
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-bold mb-3">Quantity</h3>
              <div className="flex items-center bg-surface-container-high rounded-[0.75rem] px-3 py-1 w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:text-primary">
                  <MaterialIcon icon="remove" className="text-sm" />
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:text-primary">
                  <MaterialIcon icon="add" className="text-sm" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-cta-gradient text-white py-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-3"
            >
              <MaterialIcon icon="shopping_bag" className="text-sm" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full bg-surface-container-high text-on-surface py-4 rounded-lg font-bold text-sm text-center hover:bg-surface-dim transition-colors mb-4 cursor-pointer"
            >
              Buy Now
            </button>
            <div className="flex items-center justify-center gap-6 text-xs text-secondary">
              <span className="flex items-center gap-1"><MaterialIcon icon="local_shipping" className="text-sm" /> {product.availability.leadTimeLabel}</span>
              <span className="flex items-center gap-1"><MaterialIcon icon="verified" className="text-sm" /> Studio quality checked</span>
            </div>

            {/* Description */}
            <div className="mt-12">
              <h2 className="text-2xl font-headline font-extrabold mb-6">Product Description</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3 bg-surface-container-lowest p-6 rounded-xl">
                  <p className="text-sm text-secondary leading-relaxed mb-6">
                    {product.description} {product.materialSummary}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-sm mb-1">Print Quality</h4>
                      <p className="text-xs text-secondary">High-definition giclée printing using 12-color pigment ink systems.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">Sustainability</h4>
                      <p className="text-xs text-secondary">FSC-certified paper sourced from responsibly managed forests.</p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl space-y-3">
                  {product.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <MaterialIcon icon="check_circle" filled className="text-tertiary text-lg" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="bottom-3 left-3 right-3 top-3 grid w-auto max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden border-white/10 bg-black p-0 text-white shadow-2xl sm:bottom-6 sm:left-6 sm:right-6 sm:top-6 sm:rounded-[1.75rem]">
          <DialogTitle className="sr-only">{product.title} full screen gallery</DialogTitle>
          <DialogDescription className="sr-only">
            View {product.title} in full screen and switch between gallery images.
          </DialogDescription>
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-[inherit] bg-black">
            <div className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm sm:left-6 sm:top-6">
              {selectedImage + 1} / {allImages.length}
            </div>

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => stepImage(-1)}
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 sm:left-6 sm:h-12 sm:w-12"
                  aria-label="View previous artwork image"
                >
                  <MaterialIcon icon="chevron_left" />
                </button>
                <button
                  type="button"
                  onClick={() => stepImage(1)}
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 sm:right-6 sm:h-12 sm:w-12"
                  aria-label="View next artwork image"
                >
                  <MaterialIcon icon="chevron_right" />
                </button>
              </>
            )}

            <div className="min-h-0">
              <div className="flex h-full min-h-0 items-center justify-center px-3 pb-3 pt-14 sm:px-8 sm:pb-6 sm:pt-16">
                <img
                  src={selectedArtwork.src}
                  alt={selectedArtwork.alt}
                  className="block max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="border-t border-white/10 bg-black/80 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
                <div className="mx-auto flex max-w-5xl gap-3 overflow-x-auto no-scrollbar">
                  {allImages.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Show ${product.title} image ${index + 1}`}
                      className={`relative h-20 w-14 shrink-0 overflow-hidden rounded-xl border transition-all sm:h-24 sm:w-20 ${
                        selectedImage === index
                          ? 'border-white shadow-[0_0_0_1px_rgba(255,255,255,0.4)]'
                          : 'border-white/10 opacity-70 hover:border-white/30 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
