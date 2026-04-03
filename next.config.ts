import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce memory usage during build
  webpack: (config, { isServer }) => {
    // Reduce webpack memory usage
    config.cache = isServer
      ? { type: "filesystem", compression: "gzip" }
      : { type: "memory" };

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Cornerstone.js / node modules fallback for the browser
    config.resolve.fallback = { fs: false, path: false, crypto: false };

    // Reduce memory by tree shaking unused code
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "named",
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Split heavy libraries
            heroui: {
              test: /[\\/]node_modules[\\/](@heroui)/,
              name: "heroui",
              priority: 50,
            },
            framer: {
              test: /[\\/]node_modules[\\/]framer-motion/,
              name: "framer",
              priority: 40,
            },
            tipTap: {
              test: /[\\/]node_modules[\\/](@tiptap)/,
              name: "tiptap",
              priority: 40,
            },
            // Common vendor libraries
            lib: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-aria)/,
              name: "react-lib",
              priority: 60,
            },
          },
        },
      };
    }

    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  experimental: {
    // Optimize package imports to reduce bundle size and memory
    optimizePackageImports: [
      "lucide-react",
      "@heroui/react",
      "@heroui/system",
      "framer-motion",
      "react-aria-components",
    ],
    // Enable CSS optimization
    optimizeCss: true,
    // Reduce server memory by enabling early hints
    optimizeServerReact: true,
    // Reduce client component JavaScript
    clientTraceMetadata: ["request-id", "trace-id"],
  },

  // Enable compression for responses
  compress: true,

  // Disable ETag generation to reduce memory
  generateEtags: false,

  // Optimize images - use webp format by default
  images: {
    formats: ["image/avif", "image/webp"],
    // Reduce memory by limiting concurrent image optimization
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    // Limit image sizes to reduce memory
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // Reduce dev server memory usage
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in memory
    maxInactiveAge: 25 * 1000,
    // Number of pages to keep in memory
    pagesBufferLength: 2,
  },

  // Reduce powered by header
  poweredByHeader: false,

  // Enable react strict mode for better memory management
  reactStrictMode: true,
};

export default nextConfig;