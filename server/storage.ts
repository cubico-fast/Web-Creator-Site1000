import { db } from "./db";
import {
  users, sites, pages,
  type User, type Site, type Page,
  type InsertSite, type InsertPage,
  type UpsertUser
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Auth methods (re-export or implement)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Site methods
  getSites(userId: string): Promise<Site[]>;
  getSite(id: number): Promise<Site | undefined>;
  getSiteBySlug(slug: string): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: number, updates: Partial<InsertSite>): Promise<Site>;
  deleteSite(id: number): Promise<void>;

  // Page methods
  getPages(siteId: number): Promise<Page[]>;
  getPage(id: number): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, updates: Partial<InsertPage>): Promise<Page>;
  deletePage(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    return authStorage.upsertUser(user);
  }

  async getSites(userId: string): Promise<Site[]> {
    return await db.select().from(sites).where(eq(sites.userId, userId)).orderBy(desc(sites.updatedAt));
  }

  async getSite(id: number): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site;
  }

  async getSiteBySlug(slug: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.slug, slug));
    return site;
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const [site] = await db.insert(sites).values(insertSite).returning();
    return site;
  }

  async updateSite(id: number, updates: Partial<InsertSite>): Promise<Site> {
    const [site] = await db
      .update(sites)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();
    return site;
  }

  async deleteSite(id: number): Promise<void> {
    await db.delete(pages).where(eq(pages.siteId, id)); // Cascade delete pages
    await db.delete(sites).where(eq(sites.id, id));
  }

  async getPages(siteId: number): Promise<Page[]> {
    return await db.select().from(pages).where(eq(pages.siteId, siteId)).orderBy(pages.order);
  }

  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const [page] = await db.insert(pages).values(insertPage).returning();
    return page;
  }

  async updatePage(id: number, updates: Partial<InsertPage>): Promise<Page> {
    const [page] = await db.update(pages).set(updates).where(eq(pages.id, id)).returning();
    return page;
  }

  async deletePage(id: number): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }
}

export const storage = new DatabaseStorage();
