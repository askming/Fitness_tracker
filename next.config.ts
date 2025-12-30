
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Fitness_tracker' : '',
  images: {
    unoptimized: true,
  },
  // Ensure we don't try to sync Health on static export (API routes are not supported in 'export' mode unless standard fetch)
  // Actually, /api routes break 'next export'. We must remove /api/health-sync as well if we want purely static.
  // The user wanted "Github Pages". Github Pages is static HTML.
  // So API routes in Next.js WON'T work.
  // We need to remove the API route or acknowledge it won't work consistently.
  // I'll delete the API route for now to prevent build errors.
};

export default nextConfig;
