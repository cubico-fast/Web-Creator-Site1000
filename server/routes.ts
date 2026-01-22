import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";

async function seedDatabase() {
  const systemId = "system-demo";
  // Create system user if not exists
  await authStorage.upsertUser({
    id: systemId,
    email: "system@demo.com",
    firstName: "System",
    lastName: "Demo",
  });

  const sites = await storage.getSites(systemId);
  if (sites.length === 0) {
    console.log("Seeding database...");
    
    // Create a demo site
    const demoSite = await storage.createSite({
      userId: systemId,
      name: "Demo Portfolio",
      slug: "demo-portfolio",
      description: "A showcase of what you can build.",
      isPublished: true,
    });

    // Create pages
    await storage.createPage({
      siteId: demoSite.id,
      title: "Home",
      slug: "home",
      order: 0,
      content: [
        { id: "hero", type: "hero", content: { title: "Welcome to My Portfolio", subtitle: "I build amazing things on the web." } },
        { id: "features", type: "features", content: { title: "My Skills", items: ["Web Development", "Design", "Product"] } }
      ]
    });

    await storage.createPage({
      siteId: demoSite.id,
      title: "About",
      slug: "about",
      order: 1,
      content: [
         { id: "text", type: "text", content: { text: "I am a passionate creator." } }
      ]
    });
    
    console.log("Database seeded!");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Seed Data
  await seedDatabase();

  // Sites
  app.get(api.sites.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const sites = await storage.getSites(userId);
    res.json(sites);
  });

  app.post(api.sites.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;

    try {
      const input = api.sites.create.input.parse(req.body);
      const site = await storage.createSite({ ...input, userId });
      res.status(201).json(site);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.sites.get.path, async (req, res) => {
    // Sites might be public or private, but this endpoint is usually for the editor/dashboard
    // Assuming owner access for editing.
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const site = await storage.getSite(Number(req.params.id));
    
    if (!site) return res.status(404).json({ message: 'Site not found' });
    if (site.userId !== userId) return res.sendStatus(403);
    
    res.json(site);
  });

  app.put(api.sites.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const site = await storage.getSite(Number(req.params.id));
    
    if (!site) return res.status(404).json({ message: 'Site not found' });
    if (site.userId !== userId) return res.sendStatus(403);

    const input = api.sites.update.input.parse(req.body);
    const updated = await storage.updateSite(site.id, input);
    res.json(updated);
  });

  app.delete(api.sites.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const site = await storage.getSite(Number(req.params.id));
    
    if (!site) return res.status(404).json({ message: 'Site not found' });
    if (site.userId !== userId) return res.sendStatus(403);

    await storage.deleteSite(site.id);
    res.sendStatus(204);
  });

  // Public site view
  app.get(api.sites.getBySlug.path, async (req, res) => {
    const site = await storage.getSiteBySlug(req.params.slug);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    // If unpublished, maybe check auth? Or just hide it.
    // For now, let's allow viewing if published or if owner.
    
    if (site.isPublished) {
      return res.json(site);
    }

    if (req.isAuthenticated()) {
       const userId = (req.user as any).claims.sub;
       if (site.userId === userId) return res.json(site);
    }

    res.status(404).json({ message: 'Site not found' });
  });

  // Pages
  app.get(api.pages.list.path, async (req, res) => {
    // Check access to site first
    const siteId = Number(req.params.siteId);
    const site = await storage.getSite(siteId);
    if (!site) return res.status(404).json({ message: 'Site not found' });

    // Allow public access to pages if site is published
    if (!site.isPublished) {
       if (!req.isAuthenticated()) return res.sendStatus(401);
       const userId = (req.user as any).claims.sub;
       if (site.userId !== userId) return res.sendStatus(403);
    }

    const pages = await storage.getPages(siteId);
    res.json(pages);
  });

  app.post(api.pages.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const siteId = Number(req.params.siteId);
    
    const site = await storage.getSite(siteId);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    if (site.userId !== userId) return res.sendStatus(403);

    const input = api.pages.create.input.parse(req.body);
    const page = await storage.createPage({ ...input, siteId });
    res.status(201).json(page);
  });

  app.get(api.pages.get.path, async (req, res) => {
    const siteId = Number(req.params.siteId);
    const site = await storage.getSite(siteId);
    if (!site) return res.status(404).json({ message: 'Site not found' });

    const page = await storage.getPage(Number(req.params.id));
    if (!page || page.siteId !== siteId) return res.status(404).json({ message: 'Page not found' });

     // Allow public access to pages if site is published
    if (!site.isPublished) {
       if (!req.isAuthenticated()) return res.sendStatus(401);
       const userId = (req.user as any).claims.sub;
       if (site.userId !== userId) return res.sendStatus(403);
    }

    res.json(page);
  });

  app.put(api.pages.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const siteId = Number(req.params.siteId);
    
    const site = await storage.getSite(siteId);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    if (site.userId !== userId) return res.sendStatus(403);

    const page = await storage.getPage(Number(req.params.id));
    if (!page || page.siteId !== siteId) return res.status(404).json({ message: 'Page not found' });

    const input = api.pages.update.input.parse(req.body);
    const updated = await storage.updatePage(page.id, input);
    res.json(updated);
  });

  app.delete(api.pages.delete.path, async (req, res) => {
     if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const siteId = Number(req.params.siteId);
    
    const site = await storage.getSite(siteId);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    if (site.userId !== userId) return res.sendStatus(403);

    const page = await storage.getPage(Number(req.params.id));
    if (!page || page.siteId !== siteId) return res.status(404).json({ message: 'Page not found' });

    await storage.deletePage(page.id);
    res.sendStatus(204);
  });

  return httpServer;
}
