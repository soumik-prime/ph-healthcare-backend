import "dotenv/config";
import ms from "ms";
import * as z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z
    .string()
    .regex(/^\d+\s*(ms|s|m|h|d|w|y)$/i, "Invalid access token duration format")
    .transform((v) => v as ms.StringValue),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z
    .string()
    .regex(/^\d+\s*(ms|s|m|h|d|w|y)$/i, "Invalid refresh token duration format")
    .transform((v) => v as ms.StringValue),
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: z
    .string()
    .regex(
      /^\d+\s*(ms|s|m|h|d|w|y)$/i,
      "Invalid better auth session token duration format",
    )
    .transform((v) => v as ms.StringValue),
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: z
    .string()
    .regex(
      /^\d+\s*(ms|s|m|h|d|w|y)$/i,
      "Invalid better auth session token update age format",
    )
    .transform((v) => v as ms.StringValue),
  EMAIL_SENDER_SMTP_USER: z.string().min(1),
  EMAIL_SENDER_SMTP_PASS: z.string().min(1),
  EMAIL_SENDER_SMTP_HOST: z.string().min(1),
  EMAIL_SENDER_SMTP_PORT: z.coerce.number().int().positive(),
  EMAIL_SENDER_SMTP_FROM: z.email(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.url(),
  FRONTEND_URL: z.url(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

// type EnvConfig = z.infer<typeof envSchema>;

const loadEnvVariables = () => {
  const parsedEnv = envSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    console.error(
      "Invalid environment variables:",
      z.flattenError(parsedEnv.error).fieldErrors,
    );
    process.exit(1);
  }
  return parsedEnv.data;
};

export const envVars = loadEnvVariables();
