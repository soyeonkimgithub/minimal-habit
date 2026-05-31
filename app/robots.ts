import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/history', '/settings', '/new'],
    },
    sitemap: 'https://minimalhabit.com/sitemap.xml',
  }
}
