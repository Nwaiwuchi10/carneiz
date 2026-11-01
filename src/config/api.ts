/**
 * Centralized API base URL config for Carneiz frontend.
 * Always resolves to process.env.NEXT_PUBLIC_API_URL if configured,
 * or defaults to the production backend deployment: 'https://carneiz-backend.vercel.app'
 * (instead of localhost:4300 which fails on production Vercel).
 */
export const API_BASE_URL: string =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL?.trim()) ||
  'https://carneiz-backend.vercel.app';

