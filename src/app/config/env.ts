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
