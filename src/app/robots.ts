import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/matrimony',
          '/matrimony/',
          '/matrimony/discover',
          '/matrimony/login',
        ],
        disallow: [
          '/matrimony/onboarding',
          '/matrimony/profiles/',
          '/matrimony/interests',
          '/matrimony/settings/',
          '/matrimony/nsm-admin',
          '/matrimony/api/',
        ],
      },
    ],
    sitemap: 'https://nayisamakhya.org/matrimony/sitemap.xml',
  };
}
