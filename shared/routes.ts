import { z } from "zod";
import { insertSolveSchema, solves } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  solves: {
    list: {
      method: "GET" as const,
      path: "/api/solves" as const,
      responses: {
        200: z.array(z.custom<typeof solves.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/solves" as const,
      input: insertSolveSchema,
      responses: {
        201: z.custom<typeof solves.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
