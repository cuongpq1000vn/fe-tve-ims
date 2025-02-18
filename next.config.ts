const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Bỏ qua lỗi ESLint khi build trên AWS
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Set-Cookie",
            value: "SameSite=None; Secure",
          },
        ],
      },
    ];
  },
  output: "standalone", // Đảm bảo Next.js build đúng cho Amplify
  experimental: {
    appDir: true, // Kích hoạt App Router (quan trọng)
  },
};

export default nextConfig;
