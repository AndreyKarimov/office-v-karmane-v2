const env = {
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "dev-secret",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "openrouter/free",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
};

export { env };
