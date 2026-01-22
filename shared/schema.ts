export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // References auth user id (which is a string)
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: jsonb("content").default([]), // For drag-and-drop content
  order: integer("order").default(0),
});

export const sitesRelations = relations(sites, ({ one, many }) => ({
  pages: many(pages),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  site: one(sites, {
    fields: [pages.siteId],
    references: [sites.id],
  }),
}));

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
});

export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
