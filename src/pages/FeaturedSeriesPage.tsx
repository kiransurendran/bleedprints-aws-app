import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import Navbar from '@/components/Navbar';
import { useProducts } from '@/hooks/use-products';
import { formatMoney } from '@/lib/money';
import { usePageMetadata } from '@/lib/seo';

const editorialStats = [
  { label: 'Palette', value: 'Sun-warmed neutrals' },
  { label: 'Mood', value: 'Graphic and cinematic' },
  { label: 'Finish', value: 'Matte gallery texture' },
];

const editorialPoints = [
  'Layer dramatic statement pieces with softer tonal studies for a collected wall.',
  'Use one oversized print as the anchor, then support it with smaller secondary works.',
  'Mix warm reds, charcoal, and faded neutrals to keep the arrangement rich but balanced.',
];

export default function FeaturedSeriesPage() {
  const { data: posters = [], isLoading } = useProducts();

  const featuredDesigns = useMemo(() => posters.slice(0, 3), [posters]);
  const similarDesigns = useMemo(() => {
    const featuredSlugs = new Set(featuredDesigns.map((poster) => poster.slug));
    return posters.filter((poster) => !featuredSlugs.has(poster.slug)).slice(0, 8);
  }, [featuredDesigns, posters]);
  const moodboardDesigns = useMemo(() => posters.slice(0, 5), [posters]);
  const leadDesign = featuredDesigns[0];
  const secondaryDesign = featuredDesigns[1] ?? similarDesigns[0];

  usePageMetadata({
    title: 'The Summer Solstice Collection | BleedPrints',
    description:
      'Explore the Summer Solstice Collection, an editorial BleedPrints series with featured designs and related posters in the same warm, cinematic mood.',
    path: '/series/summer-solstice',
    image: leadDesign?.imageSet.primary.src,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-surface-container-low pt-24">
        <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-8 lg:py-10">
          <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_420px]">
            <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] bg-black">
              {leadDesign ? (
                <img
                  src={leadDesign.imageSet.primary.src}
                  alt={leadDesign.imageSet.primary.alt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,196,128,0.35),_transparent_38%),linear-gradient(135deg,_#18120f,_#42302a_52%,_#0c0c0c)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/75">
                  Editor&apos;s Choice
                </span>
                <h1 className="mt-3 max-w-2xl text-4xl font-headline font-extrabold tracking-tight sm:text-5xl">
                  The Summer Solstice Collection
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                  A warmer editorial edit built around cinematic contrast, textural surfaces, and wall art that feels
                  collected instead of matched.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
                  >
                    Browse Full Catalog
                    <MaterialIcon icon="arrow_forward" className="text-sm" />
                  </Link>
                  {featuredDesigns[0] && (
                    <Link
                      to={`/poster/${featuredDesigns[0].slug}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-black/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/30"
                    >
                      View Lead Design
                      <MaterialIcon icon="open_in_new" className="text-sm" />
                    </Link>
                  )}
                </div>
              </div>

              {moodboardDesigns.length > 0 && (
                <div className="absolute right-6 top-6 hidden max-w-sm grid-cols-5 gap-2 rounded-2xl bg-black/20 p-3 backdrop-blur-sm lg:grid">
                  {moodboardDesigns.map((poster) => (
                    <div key={poster.slug} className="aspect-[3/4] overflow-hidden rounded-lg border border-white/10">
                      <img
                        src={poster.imageSet.primary.src}
                        alt={poster.imageSet.primary.alt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-6">
              <div className="relative min-h-[250px] overflow-hidden rounded-[2rem] bg-black">
                {secondaryDesign ? (
                  <img
                    src={secondaryDesign.imageSet.primary.src}
                    alt={secondaryDesign.imageSet.primary.alt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(160deg,_#3d0f13,_#141414_58%,_#1d342b)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/65">Moodboard</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/80">
                    Industrial reds, softened neutrals, and deep shadow create the tone of this seasonal edit.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                  Why This Collection Works
                </p>
                <div className="mt-5 space-y-4">
                  {editorialPoints.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-secondary">
                        <MaterialIcon icon="auto_awesome" className="text-sm" />
                      </span>
                      <p className="text-sm leading-6 text-on-surface-variant">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
            <div className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                Curator&apos;s Notes
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-headline font-extrabold tracking-tight">
                A clean split between bold focal pieces and quieter supporting prints.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant">
                This page keeps the same visual language as the original homepage feature, but gives it enough room to
                become a real destination. Start with one dramatic work, then build around it with softer forms,
                tactile finishes, and a few high-contrast accents.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {editorialStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-surface-container-low p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-base font-semibold text-on-surface">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {featuredDesigns.slice(0, 2).map((poster, index) => (
                <Link
                  key={poster.slug}
                  to={`/poster/${poster.slug}`}
                  className="group overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest shadow-sm"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={poster.imageSet.primary.src}
                      alt={poster.imageSet.primary.alt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                      Spotlight {index + 1}
                    </p>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-headline text-lg font-bold tracking-tight">{poster.title}</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">{poster.collection}</p>
                      </div>
                      <MaterialIcon icon="arrow_outward" className="text-secondary" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                  Featured Designs
                </p>
                <h2 className="mt-2 text-3xl font-headline font-extrabold tracking-tight">
                  Selected for this series
                </h2>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-colors hover:text-on-surface"
              >
                See full catalog
                <MaterialIcon icon="arrow_forward" className="text-sm" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {isLoading &&
                Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="animate-pulse overflow-hidden rounded-[2rem] bg-surface-container-lowest p-5">
                    <div className="aspect-[4/5] rounded-2xl bg-surface-container" />
                    <div className="mt-4 h-4 w-1/2 rounded bg-surface-container" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-surface-container" />
                  </div>
                ))}

              {!isLoading &&
                featuredDesigns.map((poster) => (
                  <Link
                    key={poster.slug}
                    to={`/poster/${poster.slug}`}
                    className="group overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm"
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-surface-container">
                      <img
                        src={poster.imageSet.primary.src}
                        alt={poster.imageSet.primary.alt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-headline text-xl font-bold tracking-tight">{poster.title}</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">{poster.collection}</p>
                      </div>
                      <span className="whitespace-nowrap text-sm font-bold text-on-surface">
                        {formatMoney(poster.pricing.amount, poster.pricing.currencyCode)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-on-surface-variant">{poster.description}</p>
                  </Link>
                ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                  Similar Designs
                </p>
                <h2 className="mt-2 text-3xl font-headline font-extrabold tracking-tight">
                  More pieces with the same mood
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
                  If you liked the original homepage feature, these prints keep the same sense of warmth, contrast, and
                  editorial polish while giving you more options to browse.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[3/4] rounded-xl bg-surface-container" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-surface-container" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-surface-container" />
                  </div>
                ))}
              </div>
            ) : similarDesigns.length > 0 ? (
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {similarDesigns.map((poster) => (
                  <Link key={poster.slug} to={`/poster/${poster.slug}`} className="group">
                    <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-surface-container">
                      <img
                        src={poster.imageSet.primary.src}
                        alt={poster.imageSet.primary.alt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {poster.badge && (
                        <span
                          className={`absolute bottom-3 left-3 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            poster.badgeClassName || 'bg-surface-container-lowest/90 text-on-surface'
                          }`}
                        >
                          {poster.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-headline text-sm font-bold">{poster.title}</h3>
                        <p className="text-xs text-on-surface-variant">{poster.collection}</p>
                      </div>
                      <span className="text-sm font-bold text-on-surface">
                        {formatMoney(poster.pricing.amount, poster.pricing.currencyCode)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
                Similar designs will appear here as soon as the storefront catalog has more active posters.
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
