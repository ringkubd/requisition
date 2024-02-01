const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({
    swcMinify: true,
    compress: true,
    eslint: {
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
        SOKETI_URL: process.env.SOKETI_URL,
        SOKETI_PORT: process.env.SOKETI_PORT,
        SOKETI_FORCE_TLS: process.env.SOKETI_FORCE_TLS,
        SOKETI_APP_KEY: process.env.SOKETI_APP_KEY,
        NEXT_PUBLIC_REDUX_SECRET: process.env.NEXT_PUBLIC_REDUX_SECRET,
    }
})
