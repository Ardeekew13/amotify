/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
