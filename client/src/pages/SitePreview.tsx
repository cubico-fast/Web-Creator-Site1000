import { useParams } from "wouter";
import { useSiteBySlug } from "@/hooks/use-sites";
import { usePages } from "@/hooks/use-pages";
import { ComponentRenderer, type BlockData } from "@/components/editor/EditorComponents";
import { useEffect, useState } from "react";

export default function SitePreview() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  
  const { data: site, isLoading: siteLoading } = useSiteBySlug(slug);
  // We need to fetch pages. Since we only have slug, and usePages needs ID, 
  // we wait for site to load to get ID.
  // In a real app, we might have a specific endpoint for public site data that includes pages.
  // Here we re-use existing hooks for simplicity, acknowledging it might require auth if strict.
  // Assuming public endpoints exist or we handle 401 gracefully. 
  // NOTE: For this demo, let's assume the public route is open. 
  const { data: pages, isLoading: pagesLoading } = usePages(site?.id || 0);

  const [activePage, setActivePage] = useState<any>(null);

  useEffect(() => {
    if (pages && pages.length > 0) {
      setActivePage(pages[0]);
    }
  }, [pages]);

  if (siteLoading) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;
  if (!site) return <div className="h-screen flex items-center justify-center text-xl font-bold">404 - Site Not Found</div>;

  const blocks: BlockData[] = activePage?.content 
    ? (Array.isArray(activePage.content) ? activePage.content : JSON.parse(activePage.content as string)) 
    : [];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Public Site Navigation */}
      <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-xl">{site.name}</span>
          <div className="flex gap-6">
            {pages?.map(page => (
              <button 
                key={page.id}
                onClick={() => setActivePage(page)}
                className={`text-sm font-medium hover:text-primary transition-colors ${activePage?.id === page.id ? 'text-primary' : 'text-gray-600'}`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {blocks.map(block => (
            <ComponentRenderer key={block.id} block={block} />
          ))}
          {blocks.length === 0 && !pagesLoading && (
            <div className="text-center py-20 text-gray-400">
              <p>This page is empty.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12 mt-24">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} {site.name}. Powered by SiteCraft.</p>
        </div>
      </footer>
    </div>
  );
}
