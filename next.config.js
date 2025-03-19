// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['secfilingstracker.com'],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Analyze bundle in production build
  webpack(config, { isServer, dev }) {
    // Bundle analyzer only in production
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
