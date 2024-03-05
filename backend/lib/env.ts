// Runtime validation of env file

import z from "zod";
import dotenv from "dotenv"

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number(),
  BACKEND_API_BASEURL: z.string(),
});

export const ENV = envSchema.parse(process.env);