export interface StaticPageSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface StaticPageContent {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  highlight?: string;
  sections: StaticPageSection[];
}

export const staticPages: StaticPageContent[] = [
  {
    slug: "shipping-policy",
    eyebrow: "Delivery",
    title: "Shipping Policy",
    intro:
      "BleedPrints posters are packed to protect texture, edge quality, and finish from studio to doorstep.",
    seoTitle: "Shipping Policy | BleedPrints",
    seoDescription:
      "Dispatch windows, packaging standards, tracking, and delivery expectations for BleedPrints orders.",
    sections: [
      {
        title: "Dispatch windows",
        paragraphs: [
          "Open-edition prints are typically prepared for dispatch within three to five business days.",
          "Made-to-order framed pieces can take five to eight business days while the print, mount, and frame are completed together.",
        ],
      },
      {
        title: "Packaging and tracking",
        paragraphs: [
          "Unframed works ship rolled in reinforced tubes. Framed works ship flat with corner protection, buffer board, and insured transit.",
          "Every shipment receives tracking as soon as the carrier scans the parcel. International orders may also see customs checkpoints before final delivery.",
        ],
        bullets: [
          "Domestic delivery target: 3 to 7 business days after dispatch",
          "International delivery target: 7 to 14 business days after dispatch",
          "Duties and import taxes are collected by the destination country when applicable",
        ],
      },
    ],
  },
  {
    slug: "faq",
    eyebrow: "Support",
    title: "Frequently Asked Questions",
    intro:
      "Answers about ordering, sizing, framing, shipping, and the current BleedPrints custom studio flow.",
    seoTitle: "FAQ | BleedPrints",
    seoDescription:
      "Common answers about print sizing, framing, shipping, and care for BleedPrints purchases.",
    sections: [
      {
        title: "Ordering",
        paragraphs: [
          "All listed sizes use the paper dimensions shown on each product page. If a print is marked made-to-order, production begins after payment clears.",
          "Custom studio uploads follow a separate review flow and may require artwork approval before production starts.",
        ],
      },
      {
        title: "Framing and care",
        paragraphs: [
          "Frames are selected to fit the listed print size and are assembled with gallery-safe materials designed for long-term display.",
          "Avoid direct moisture, prolonged sunlight, and abrasive cleaning. A dry microfiber cloth is the safest first step for frame upkeep.",
        ],
        bullets: [
          "A5: 14.8 x 21 cm",
          "A4: 21 x 29.7 cm",
          "A3: 29.7 x 42 cm",
        ],
      },
    ],
  },
  {
    slug: "returns",
    eyebrow: "Policies",
    title: "Returns And Replacements",
    intro:
      "We want every piece to arrive in gallery condition. Damage and production defects are always our responsibility to fix.",
    seoTitle: "Returns | BleedPrints",
    seoDescription:
      "Starter returns and replacement guidance for BleedPrints prints and framed art orders.",
    sections: [
      {
        title: "What qualifies",
        paragraphs: [
          "Orders that arrive damaged, misprinted, or incorrectly framed are eligible for replacement or refund review.",
          "Because most pieces are produced to order, change-of-mind returns should be treated as exceptions rather than the default policy.",
        ],
      },
      {
        title: "How to request help",
        paragraphs: [
          "Send the order number plus clear photos of the packaging and the affected artwork within seven days of delivery.",
          "Once approved, we will arrange either a replacement shipment or a refund to the original payment method.",
        ],
        bullets: [
          "Support contact: support@bleedprints.com",
          "Damage reports: within 7 days of delivery",
          "Refund timing: usually 5 to 10 business days after approval",
        ],
      },
    ],
  },
  {
    slug: "sustainability",
    eyebrow: "Studio",
    title: "Sustainability",
    intro:
      "The brand direction favors smaller production runs, durable materials, and packaging that protects the work without excess waste.",
    seoTitle: "Sustainability | BleedPrints",
    seoDescription:
      "How BleedPrints approaches paper sourcing, print production, and packaging with lower-waste decisions.",
    sections: [
      {
        title: "Materials",
        paragraphs: [
          "Our current product direction uses heavyweight archival paper, pigment inks, and frame-ready sizes that reduce custom offcuts.",
          "We are prioritizing FSC-certified or recycled paper stocks wherever finish quality still meets the visual standard of the collection.",
        ],
      },
      {
        title: "Production approach",
        paragraphs: [
          "A made-to-order workflow keeps dead stock low and helps us avoid holding oversized inventories that may never ship.",
          "Availability rules are used to manage edition counts, restocks, and production lead times more intentionally as the catalog grows.",
        ],
      },
    ],
  },
  {
    slug: "studio",
    eyebrow: "About",
    title: "Our Studio",
    intro:
      "BleedPrints is being shaped as a design-led poster label with sharp catalog presentation, flexible merchandizing, and a lightweight operations stack.",
    seoTitle: "Our Studio | BleedPrints",
    seoDescription:
      "The BleedPrints studio vision, production standards, and customer experience goals.",
    sections: [
      {
        title: "What we are building",
        paragraphs: [
          "The storefront focuses on collectible wall art with clear product storytelling, premium print specifications, and room to expand into limited drops and custom work.",
          "The storefront stays intentionally fast and editorial while the commerce stack is kept lightweight and easy to operate.",
        ],
      },
      {
        title: "Production standards",
        paragraphs: [
          "Every product entry is being normalized around a single schema for pricing, dimensions, imagery, availability, and SEO.",
          "That schema keeps the catalog, CMS, and storefront aligned without redesigning the customer experience every time the inventory grows.",
        ],
      },
    ],
  },
  {
    slug: "artists",
    eyebrow: "Curation",
    title: "Artists And Collaborators",
    intro:
      "This page is now a real destination instead of a dead nav link, and it can evolve into a roster page once the live content layer is connected.",
    seoTitle: "Artists | BleedPrints",
    seoDescription:
      "How BleedPrints plans to feature artists, collaborators, and curated drops.",
    sections: [
      {
        title: "Current model",
        paragraphs: [
          "The current catalog is managed through Supabase-backed product records that feed the storefront, product templates, and checkout flow.",
          "Artist bios, drop notes, and collection pages can expand within the same content model without redesigning the storefront UI.",
        ],
      },
      {
        title: "Planned content",
        paragraphs: [
          "Each artist page should eventually include a short bio, collection statement, featured works, and social or portfolio links.",
          "That structure keeps editorial content and sellable products connected while still allowing each release to feel distinct.",
        ],
      },
    ],
  },
  {
    slug: "journal",
    eyebrow: "Editorial",
    title: "Journal",
    intro:
      "The journal is the editorial layer for launch notes, print care guidance, studio updates, and future drop storytelling.",
    seoTitle: "Journal | BleedPrints",
    seoDescription:
      "Editorial notes, behind-the-scenes stories, and release updates from BleedPrints.",
    sections: [
      {
        title: "Why it matters",
        paragraphs: [
          "A journal gives the brand space for discovery beyond pure product listings and helps future SEO around collection stories and design topics.",
          "It also gives us a natural home for launch announcements, artist interviews, and room-styling inspiration.",
        ],
      },
      {
        title: "Recommended first posts",
        paragraphs: [
          "A launch post, a print quality explainer, a framing guide, and a behind-the-scenes article would be enough to establish the section.",
        ],
        bullets: [
          "Launch note: why BleedPrints exists",
          "Paper and print process overview",
          "How to choose the right poster size",
          "Framed vs unframed buying guide",
        ],
      },
    ],
  },
  {
    slug: "framing",
    eyebrow: "Product",
    title: "Framing Guide",
    intro:
      "Framing is now a real information page so customers can understand material choices before the live variant data lands.",
    seoTitle: "Framing Guide | BleedPrints",
    seoDescription:
      "Overview of frame options, sizing, and care guidance for BleedPrints art prints.",
    sections: [
      {
        title: "Frame direction",
        paragraphs: [
          "The current storefront assumes a small curated frame set instead of dozens of custom combinations. That keeps decision-making simple and margins easier to manage.",
          "Natural oak, black aluminum, and unframed rolled prints are the strongest starting set for launch.",
        ],
      },
      {
        title: "Care and display",
        paragraphs: [
          "Hang framed pieces away from prolonged direct sunlight when possible and use appropriate wall hardware for the frame size.",
          "Rolled prints should be opened on a clean flat surface and allowed to relax before mounting or framing.",
        ],
      },
    ],
  },
  {
    slug: "terms-of-service",
    eyebrow: "Legal",
    title: "Terms Of Service",
    intro:
      "This page replaces the dead footer link with starter launch copy, but it still needs legal review before a real transactional launch.",
    seoTitle: "Terms Of Service | BleedPrints",
    seoDescription:
      "Starter terms page for the BleedPrints storefront prior to legal review.",
    highlight:
      "Starter legal content only. Replace or review this page with counsel before accepting live orders.",
    sections: [
      {
        title: "Use of the site",
        paragraphs: [
          "Customers may browse, purchase, and contact the studio through the storefront for lawful personal or commercial use of purchased prints.",
          "All artwork, branding, photography, and site copy remain protected by intellectual property law and may not be redistributed without permission.",
        ],
      },
      {
        title: "Orders and fulfillment",
        paragraphs: [
          "Prices, product availability, and shipping timelines may change as the live catalog is connected and inventory rules are introduced.",
          "The store reserves the right to cancel orders affected by fraud checks, pricing errors, or unavailable inventory, with a full refund where payment was captured.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "This starter privacy page is in place so users no longer hit a dead footer link, but it also needs a real legal review before launch.",
    seoTitle: "Privacy Policy | BleedPrints",
    seoDescription:
      "Starter privacy policy content for BleedPrints before the production launch review.",
    highlight:
      "Starter legal content only. Review retention, cookies, analytics, and payment data handling before launch.",
    sections: [
      {
        title: "What we collect",
        paragraphs: [
          "The storefront may collect contact details, shipping information, and order details necessary to fulfill purchases and support requests.",
          "When payments are enabled, card and UPI details should be handled by Razorpay Checkout rather than stored directly by the app.",
        ],
      },
      {
        title: "How data is used",
        paragraphs: [
          "Customer data is used to process orders, provide support, send transactional updates, and improve the storefront experience.",
          "Analytics, monitoring, and marketing consent flows should be documented explicitly before production traffic is sent to the site.",
        ],
      },
    ],
  },
  {
    slug: "support",
    eyebrow: "Help",
    title: "Support",
    intro:
      "Support now has a real landing page so order-related CTAs no longer send people into a dead end.",
    seoTitle: "Support | BleedPrints",
    seoDescription:
      "Contact and support expectations for BleedPrints customers.",
    sections: [
      {
        title: "Best way to reach us",
        paragraphs: [
          "Email is the primary support channel for order questions, damage reports, address updates, and framing issues.",
          "Include the order number, a short description of the issue, and reference photos when something arrived damaged.",
        ],
        bullets: [
          "Email: support@bleedprints.com",
          "Response target: within 1 business day",
          "Damage claims: include packaging and artwork photos",
        ],
      },
      {
        title: "What support can help with",
        paragraphs: [
          "Tracking assistance, damaged shipments, product questions, custom studio requests, and billing clarifications are all in scope.",
          "For press, partnership, or artist collaboration inquiries, this page can also serve as the temporary contact route until dedicated forms are added.",
        ],
      },
    ],
  },
];

export const staticPagesBySlug = Object.fromEntries(
  staticPages.map((page) => [page.slug, page]),
) as Record<string, StaticPageContent>;
