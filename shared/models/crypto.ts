/**
 * Name: Crypto Shared Models
 * Description: Create common zod schemas and types
 */

import { z } from "zod";

export const cryptoInfoSchema = z.object({
    cryptoId: z.string(),
    symbol: z.string(),
    name: z.string(),
    priceUsd: z.number(),
    updatedAt: z.date(),
});

export type CryptoInfo = z.infer<typeof cryptoInfoSchema>;
