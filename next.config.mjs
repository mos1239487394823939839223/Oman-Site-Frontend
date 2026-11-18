import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Internal address of the backend used for server-side rewrites (uploads proxy,
// x-api-request proxy). In Docker this is the compose service name; locally it
// falls back to localhost:8000.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained server bundle so the Docker image can run with just
  // `node server.js` and doesn't need node_modules or the full source tree.
  output: 'standalone',
  poweredByHeader: false,

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
    // Allow the high-quality values we request via the <Image quality> prop.
    // Next.js only honors qualities listed here (default is [75]).
    qualities: [75, 90, 100],

    // WebP only. Don't add AVIF or allow SVG: both have had image-optimizer
    // RCEs. The optimizer only fetches from the hosts listed below — never
    // add a "**" wildcard (it lets anyone feed arbitrary images to it).
    formats: ['image/webp'],
    dangerouslyAllowSVG: false,

    remotePatterns: [
      // Our own API / uploads.
      { protocol: 'https', hostname: 'api.watani-owt.cloud', pathname: '/**' },
      { protocol: 'https', hostname: 'watani-owt.cloud', pathname: '/**' },
      // External hosts that existing product data may point at. Remove any that
      // no longer appear in the database.
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ecommerce.routemisr.com', pathname: '/**' },
      { protocol: 'https', hostname: 'alsahwa.om', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'pbs.twimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'abs.twimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      // Local development backend.
      ...(process.env.NODE_ENV === 'production'
        ? []
        : [{ protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/**' }]),
    ],
  },
};

export default nextConfig;
