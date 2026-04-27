import {
  filterStorefrontProductsBySearch,
  getStorefrontSortBySlug,
  sortStorefrontProducts,
} from "@/lib/storefront/catalog-discovery";
import type { Product } from "@/types/catalog";

function buildProduct(
  slug: string,
  title: string,
  amount: number,
  collection: string,
  extra?: Partial<Product>,
): Product {
  return {
    slug,
    title,
    description: `${title} description`,
    pricing: {
      currencyCode: "INR",
      amount,
    },
    dimensions: [
      {
        id: `${slug}-a4`,
        label: "A4",
        widthCm: 21,
        heightCm: 29.7,
        unit: "cm",
        price: {
          currencyCode: "INR",
          amount,
        },
      },
    ],
    availability: {
      status: "in-stock",
      availableForSale: true,
      statusLabel: "In stock",
      leadTimeLabel: "Ships in 3 days",
    },
    imageSet: {
      primary: {
        id: `${slug}-primary`,
        src: `https://example.com/${slug}.jpg`,
        alt: title,
        role: "primary",
      },
      gallery: [
        {
          id: `${slug}-gallery`,
          src: `https://example.com/${slug}-detail.jpg`,
          alt: `${title} detail`,
          role: "gallery",
        },
      ],
    },
    seo: {
      title: `${title} | BleedPrints`,
      description: `${title} SEO description`,
      canonicalPath: `/poster/${slug}`,
      ogImage: `https://example.com/${slug}.jpg`,
    },
    collection,
    materialSummary: "Archival matte finish",
    features: ["Ready to frame"],
    ...extra,
  };
}

describe("catalog discovery helpers", () => {
  const products = [
    buildProduct("chromatic-fields", "Chromatic Fields", 200, "Abstract"),
    buildProduct("dune-study", "Dune Study", 320, "Minimalist", {
      features: ["Textured neutral palette"],
    }),
    buildProduct("after-hours", "After Hours", 260, "Photography"),
  ];

  it("searches across title, collection, material, and feature text", () => {
    expect(
      filterStorefrontProductsBySearch(products, "neutral").map(
        (product) => product.slug,
      ),
    ).toEqual(["dune-study"]);

    expect(
      filterStorefrontProductsBySearch(products, "photography").map(
        (product) => product.slug,
      ),
    ).toEqual(["after-hours"]);

    expect(
      filterStorefrontProductsBySearch(products, "matte").map(
        (product) => product.slug,
      ),
    ).toEqual(["chromatic-fields", "dune-study", "after-hours"]);
  });

  it("sorts products using the supported storefront sort options", () => {
    expect(
      sortStorefrontProducts(products, "price-asc").map((product) => product.slug),
    ).toEqual(["chromatic-fields", "after-hours", "dune-study"]);

    expect(
      sortStorefrontProducts(products, "price-desc").map(
        (product) => product.slug,
      ),
    ).toEqual(["dune-study", "after-hours", "chromatic-fields"]);

    expect(
      sortStorefrontProducts(products, "title-asc").map((product) => product.slug),
    ).toEqual(["after-hours", "chromatic-fields", "dune-study"]);
  });

  it("falls back to featured order for unknown sort values", () => {
    expect(getStorefrontSortBySlug("unknown")).toBe("featured");
    expect(getStorefrontSortBySlug(null)).toBe("featured");
  });
});
