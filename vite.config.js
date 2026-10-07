import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import { site, waLink } from './src/data/site.js'

const IMG_DIR = path.resolve(import.meta.dirname, 'public/media/img')
const WIDTHS = [480, 960, 1440]

const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// Dados estruturados para a busca local do Google.
function localBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: site.name,
    slogan: site.slogan,
    image: '/brand/og.jpg',
    telephone: site.phoneHref.replace('tel:', ''),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address,
      addressLocality: 'Campina Grande',
      addressRegion: 'PB',
      postalCode: site.cep,
      addressCountry: 'BR',
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '12:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '14:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '12:00' },
    ],
    paymentAccepted: 'Pix, cartão de crédito, cartão de débito, dinheiro',
    sameAs: [site.instagramUrl],
  }
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

/**
 * Templates do index.html:
 *   {{img:slug}}   → src + srcset com as larguras geradas por `npm run media`
 *   {{wa}} / {{wa:chave}} → link do WhatsApp com mensagem pronta
 *   {{chave}} / {{a.b}}   → valor de src/data/site.js
 */
function siteTemplate() {
  return {
    name: 'criativart-site-template',
    transformIndexHtml(html) {
      return html
        .replace('<!-- jsonld -->', localBusinessJsonLd())
        .replace(/\{\{img:([a-z0-9-]+)\}\}/g, (_, slug) => {
          const ws = WIDTHS.filter((w) => fs.existsSync(path.join(IMG_DIR, `${slug}-${w}.webp`)))
          if (!ws.length) throw new Error(`Imagem não gerada: ${slug} (rode npm run media)`)
          const fallback = ws.includes(960) ? 960 : ws.at(-1)
          const srcset = ws.map((w) => `/media/img/${slug}-${w}.webp ${w}w`).join(', ')
          return `src="/media/img/${slug}-${fallback}.webp" srcset="${srcset}"`
        })
        .replace(/\{\{wa(?::([a-z]+))?\}\}/g, (_, key) => escapeHtml(waLink(key)))
        .replace(/\{\{([a-zA-Z.]+)\}\}/g, (_, key) => {
          const value = key.split('.').reduce((o, k) => o?.[k], site)
          if (value == null) throw new Error(`Chave ausente em site.js: ${key}`)
          return escapeHtml(value)
        })
    },
  }
}

export default defineConfig({
  plugins: [siteTemplate()],
  server: { host: true },
})
