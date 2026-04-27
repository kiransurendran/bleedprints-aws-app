import { useParams } from "react-router-dom";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { staticPagesBySlug } from "@/content/staticPages";
import { usePageMetadata } from "@/lib/seo";
import NotFound from "./NotFound";

export default function StaticContentPage() {
  const { contentSlug } = useParams();
  const page = contentSlug ? staticPagesBySlug[contentSlug] : undefined;

  usePageMetadata({
    title: page?.seoTitle || "BleedPrints",
    description:
      page?.seoDescription ||
      "Editorial, policy, and support content for the BleedPrints storefront.",
    path: page ? `/${page.slug}` : undefined,
  });

  if (!page) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-32 pb-24 px-4 md:px-8 max-w-4xl mx-auto flex-1 w-full">
        <div className="rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-8 md:p-12 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary mb-4">
            {page.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-5">
            {page.title}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-8 max-w-3xl">
            {page.intro}
          </p>

          {page.highlight && (
            <div className="mt-8 rounded-2xl bg-secondary-container/30 px-5 py-4 text-sm font-medium text-on-surface">
              {page.highlight}
            </div>
          )}

          <div className="mt-10 space-y-10">
            {page.sections.map((section) => (
              <section key={section.title} className="space-y-4">
                <h2 className="text-2xl font-headline font-bold tracking-tight text-on-surface">
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm md:text-base leading-7 text-on-surface-variant"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="space-y-3 text-sm md:text-base text-on-surface-variant">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-tertiary flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
