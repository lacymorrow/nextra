import bundleAnalyzer from '@next/bundle-analyzer'
import nextra from 'nextra'
import path from 'node:path'

const withNextra = nextra({
  defaultShowCopyCode: true,
  transform(content, { route }) {
    if (route.startsWith('/en/docs/advanced/dynamic-markdown-import')) {
      return `
${content}
export function getStaticProps() {
  return {
    props: {
      foo: 'from nextra config'
    }
  }
}`
    }
    return content
  },
  transformPageMap(pageMap, locale) {
    if (locale === 'en') {
      pageMap = [
        ...pageMap,
        {
          name: 'virtual-page',
          route: '/en/virtual-page',
          frontMatter: { sidebarTitle: 'Virtual Page' }
        }
      ]
    }
    return pageMap
  },
  latex: true,
  mdxBaseDir: './mdx'
})

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

const sep = path.sep === '/' ? '/' : '\\\\'

const ALLOWED_SVG_REGEX = new RegExp(`_icons${sep}.+\\.svg$`)

/**
 * @type {import('next').NextConfig}
 */
export default withBundleAnalyzer(
  withNextra({
    eslint: {
      // Eslint behaves weirdly in this monorepo.
      ignoreDuringBuilds: true
    },
    i18n: {
      locales: ['en', 'es', 'ru'],
      defaultLocale: 'en'
    }, // basePath: "/some-base-path",
    distDir: './.next', // Nextra supports custom `nextConfig.distDir`
    redirects: () => [
      // {
      //   source: "/docs.([a-zA-Z-]+)",
      //   destination: "/docs/getting-started",
      //   statusCode: 301,
      // },
      // {
      //   source: "/advanced/performance",
      //   destination: "/docs/advanced/performance",
      //   statusCode: 301,
      // },
      // {
      //   source: "/advanced/cache",
      //   destination: "/docs/advanced/cache",
      //   statusCode: 301,
      // },
      // {
      //   source: "/docs/cache",
      //   destination: "/docs/advanced/cache",
      //   statusCode: 301,
      // },
      {
        source: '/change-log',
        destination: '/docs/change-log',
        statusCode: 301
      },
      {
        source: '/blog/swr-1',
        destination: '/blog/swr-v1',
        statusCode: 301
      },
      {
        source: '/docs.([a-zA-Z-]+)',
        destination: '/docs/getting-started',
        statusCode: 302
      },
      {
        source: '/docs',
        destination: '/docs/getting-started',
        statusCode: 302
      },
      {
        source: '/examples',
        destination: '/examples/basic',
        statusCode: 302
      },
      {
        source: '/',
        destination: '/en',
        permanent: true
      }
    ],
    reactStrictMode: true,
    webpack(config) {
      const fileLoaderRule = config.module.rules.find(rule =>
        rule.test?.test?.('.svg')
      )
      fileLoaderRule.exclude = ALLOWED_SVG_REGEX

      config.module.rules.push({
        test: ALLOWED_SVG_REGEX,
        use: ['@svgr/webpack']
      })
      return config
    }
  }),
)
