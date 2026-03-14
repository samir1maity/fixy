interface Config {
  auth: {
    jwt: string;
    token_expiry: number;
  };
  frontend: {
    baseUrl: string | undefined;
  };
  ai: {
    api_key: string;
    model: string | undefined;
  };
  email: {
    host: string | undefined;
    port: number;
    user: string | undefined;
    password: string | undefined;
    from: string | undefined;
  };
}

const config: Config = {
  auth: {
    jwt: process.env.JWT_SECRET || 'fallback_jwt_secret_9adf2e1b7c4f8fixyv19e4f6a12ef',
    token_expiry: Number(process.env.RESET_TOKEN_EXPIRY) || 3600000,
  },
  frontend: {
    baseUrl: process.env.FE_BASE_URL,
  },
  ai: {
    api_key: (process.env.GEMINI_API_KEY as string) ?? '',
    model: process.env.MODEL as string,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
};

export default config;