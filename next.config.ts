import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false, // Desactiva App Router y mantiene Pages Router
  },
};

export default nextConfig;
module.exports = nextConfig;