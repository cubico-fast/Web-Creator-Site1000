import { z } from 'zod';
import { insertSiteSchema, insertPageSchema, sites, pages } from './schema';

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
  sites: {
    list: {
      method: 'GET' as const,
      path: '/api/sites',
      responses: {
        200: z.array(z.custom<typeof sites.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sites',
      input: insertSiteSchema,
      responses: {
        201: z.custom<typeof sites.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/sites/:id',
      responses: {
        200: z.custom<typeof sites.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/sites/slug/:slug',
      responses: {
        200: z.custom<typeof sites.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/sites/:id',
      input: insertSiteSchema.partial(),
      responses: {
        200: z.custom<typeof sites.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/sites/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  pages: {
    list: {
      method: 'GET' as const,
      path: '/api/sites/:siteId/pages',
      responses: {
        200: z.array(z.custom<typeof pages.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/pages',
      input: insertPageSchema.omit({ siteId: true }),
      responses: {
        201: z.custom<typeof pages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/sites/:siteId/pages/:id',
      responses: {
        200: z.custom<typeof pages.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/sites/:siteId/pages/:id',
      input: insertPageSchema.omit({ siteId: true }).partial(),
      responses: {
        200: z.custom<typeof pages.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/sites/:siteId/pages/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
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

export type SiteInput = z.infer<typeof api.sites.create.input>;
export type PageInput = z.infer<typeof api.pages.create.input>;
