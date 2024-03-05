// Runtime validation of env file

import z from "zod";

const envSchema = z.object({
  BACKEND_API_BASEURL: z.string(),
});

export const ENV = envSchema.parse(process.env);