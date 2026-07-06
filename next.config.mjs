import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Internal address of the backend used for server-side rewrites (uploads proxy,
// x-api-request proxy). In Docker this is the compose service name; locally it
// falls back to localhost:8000.
const BACKEND_URL = process.env.BACKEND_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained server bundle so the Docker image can run with just
  // `node server.js` and doesn't need node_modules or the full source tree.
  output: 'standalone',

  // Two lockfiles exist (~/package-lock.json and this project's). Pin the trace
  // root to this project so Next optimizes/traces from the correct workspace.
  outputFileTracingRoot: __dirname,

  // Rewrite barrel imports to per-symbol deep imports at build time so only the
  // icons/components actually used ship to the client. react-icons is imported
  // across 44 files and full @mui/material loads on every page — this is the
  // single biggest First-Load-JS reduction available without refactoring.
  experimental: {
    optimizePackageImports: ["react-icons", "@mui/material", "@mui/icons-material"],
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-api-request',
              value: '1',
            },
          ],
          destination: `${BACKEND_URL}/api/v1/:path*`,
        },
      ],
      afterFiles: [
        {
          // Proxy static uploads (banner images, etc.) to the backend file server
          source: '/uploads/:path*',
          destination: `${BACKEND_URL}/uploads/:path*`,
        },
        {
          // Legacy category image paths from older API responses
          source: '/categories/:path*',
          destination: `${BACKEND_URL}/uploads/categories/:path*`,
        },
      ],
      fallback: [],
    };
  },
  images: {
    // Legacy domains list (kept for compatibility)
    domains: [
      'images.unsplash.com',
      'ecommerce.routemisr.com',
      'alsahwa.om',
      'encrypted-tbn0.gstatic.com',
      'lh3.googleusercontent.com',
      'via.placeholder.com',
      'placehold.co',
      'pbs.twimg.com',
      'abs.twimg.com',
      'cdn.cloudinary.com',
      'res.cloudinary.com',
      'i.imgur.com',
    ],

    // Universal wildcard — allows any https image source.
    // This prevents runtime errors from any external CDN the data layer returns.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      // Backend images served from localhost with a port number
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
