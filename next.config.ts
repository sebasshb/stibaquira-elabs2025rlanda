import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['aws-amplify'],
  webpack: (config) => {
    config.resolve.alias['../src/aws-exports'] = require.resolve('./src/aws-exports.js');
    return config;
  }
};

export default nextConfig;