import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/simulateur-gir',
          '/simulateur-habitat', 
          '/simulateur-apa',
          '/solutions',
          '/aides',
          '/plateforme',
          '/contact',
          '/mentions-legales',
          '/suggestion-correction'
        ],
        disallow: [
          '/admin/*',
          '/gestionnaire/*',
          '/test-*',
          '/api/*',
          '/_next/*',
          '/public/*'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/gestionnaire/*', 
          '/test-*'
        ],
      },
    ],
    sitemap: 'https://habitat-intermediaire.fr/sitemap.xml',
    host: 'https://habitat-intermediaire.fr'
  }
}