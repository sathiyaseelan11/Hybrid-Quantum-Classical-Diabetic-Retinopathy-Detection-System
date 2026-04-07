/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Hybrid-Quantum-Classical-Diabetic-Retinopathy-Detection-System",
  images: {
    unoptimized: true,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
