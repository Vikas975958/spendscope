import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

let remoteHost = "placeholder.supabase.co";
try {
  remoteHost = new URL(supabaseUrl).hostname;
} catch {
  // Use default
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  allowedDevOrigins: ["127.0.0.1", "192.168.1.4"],
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: remoteHost,
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
