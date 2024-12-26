import { build } from "velite";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  staticPageGenerationTimeout: 600, // Increase to 120 seconds
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [162, 322, 482, 642, 1026, 1282, 1922, 3842],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.wildrunner.org",
      },
      {
        protocol: "https",
        hostname: "pub-3ea1cd399d6642049d046bde97886fe3.r2.dev",
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};

// class VeliteWebpackPlugin {
//   static started = false;
//   apply(/** @type {import('webpack').Compiler} */ compiler) {
//     compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
//       if (VeliteWebpackPlugin.started) return;
//       VeliteWebpackPlugin.started = true;
//       const dev = compiler.options.mode === "development";
//       await build({ watch: dev, clean: !dev });
//     });
//   }
// }

export default nextConfig;
