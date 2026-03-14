const BASE_URL = (import.meta.env.VITE_API_URL as string) || '';

const config = {
  baseUrl: BASE_URL,
  apiUrl: `${BASE_URL}/api/v1`,
};

export default config;
