const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API = {
  stock: `${BASE_URL}/api/vnstock/top-active`,
  crypto: `${BASE_URL}/api/crypto/top-active`,
  summary: `${BASE_URL}/api/vnstock/summary`,
  
};