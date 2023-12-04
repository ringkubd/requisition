const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({
    swcMinify: true,
    compress: true,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.isdb-bisew.org',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
        NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
        APP_NAME: process.env.APP_NAME,
        ANALYZE: process.env.ANALYZE,
        SOKETI_URL: process.env.SOKETI_URL
    }
})
