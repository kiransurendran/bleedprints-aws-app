import { useEffect } from "react";

import { publicEnv } from "@/lib/env";

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  ogType?: "website" | "article" | "product";
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
};

function resolveAbsoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) {
    return undefined;
  }

  try {
    return new URL(pathOrUrl, publicEnv.siteUrl).toString();
  } catch {
    return undefined;
  }
}

function upsertMeta(
  selector: string,
  attributeName: "name" | "property",
  attributeValue: string,
  content: string,
) {
  let element = document.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

export function usePageMetadata({
  title,
  description,
  path,
  image,
  ogType = "website",
  noIndex = false,
  structuredData,
}: MetadataInput) {
  useEffect(() => {
    document.title = title;

    const absolutePath = resolveAbsoluteUrl(path || "/");
    const absoluteImage =
      resolveAbsoluteUrl(image || "/social-preview.svg") ||
      `${publicEnv.siteUrl}/social-preview.svg`;
    const robotsValue = noIndex ? "noindex, nofollow" : "index, follow";

    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description,
    );
    upsertMeta('meta[property="og:type"]', "property", "og:type", ogType);
    upsertMeta('meta[property="og:image"]', "property", "og:image", absoluteImage);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      description,
    );
    upsertMeta(
      'meta[name="twitter:image"]',
      "name",
      "twitter:image",
      absoluteImage,
    );
    upsertMeta('meta[name="robots"]', "name", "robots", robotsValue);

    if (absolutePath) {
      upsertLink("canonical", absolutePath);
      upsertMeta(
        'meta[property="og:url"]',
        "property",
        "og:url",
        absolutePath,
      );
    }

    const existingStructuredData = document.getElementById("bleedprints-structured-data");
    if (existingStructuredData) {
      existingStructuredData.remove();
    }

    if (structuredData) {
      const script = document.createElement("script");
      script.id = "bleedprints-structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [description, image, noIndex, ogType, path, structuredData, title]);
}
