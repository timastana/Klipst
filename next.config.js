/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs", "nodemailer"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  // Handle optional dependencies
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle optional dependencies
      config.externals = config.externals || []
      config.externals.push({
        stripe: "stripe",
        nodemailer: "nodemailer",
      })
    }

    // Handle module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },
}

module.exports = nextConfig
