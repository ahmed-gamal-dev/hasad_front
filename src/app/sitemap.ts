import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/dashboard`,
      lastModified: new Date(),
    },
  ];
}
