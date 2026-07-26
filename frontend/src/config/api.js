// Production-Ready API Gateway Router
// In development, falls back to localhost:3000
// In Vercel / Netlify production deployment, set VITE_API_URL in your environment variable dashboard
export const API = import.meta.env.VITE_API_URL || "http://localhost:3000/pytm";
