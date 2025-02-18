const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Bỏ qua lỗi ESLint khi build trên AWS
  },
  output: "standalone", // Đảm bảo Next.js build đúng cho Amplify
  experimental: {
    appDir: true, // Kích hoạt App Router (quan trọng)
  },
};

export default nextConfig;
