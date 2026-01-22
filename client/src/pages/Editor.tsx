import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { 
  useSite, 
  useUpdateSite 
} from "@/hooks/use-sites";
import { 
  usePages, 
  useCreatePage, 
  useUpdatePage 
} from "@/hooks/use-pages";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Save, 
  LayoutTemplate, 
  Image as ImageIcon, 
  Type, 
  ArrowLeft,
  GripVertical,
  Settings,
  Eye,
  Trash2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ComponentRenderer, type BlockData, type BlockType } from "@/components/editor/EditorComponents";
import { nanoid } from "nanoid";

// --- Sortable Block Wrapper ---
function SortableBlock({ id, children, onEdit, onDelete }: { id: string, children: React.ReactNode, onEdit: () => void, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "relative group mb-4 transition-shadow rounded-2xl",
        isDragging ? "shadow-2xl z-50 opacity-80 ring-2 ring-primary bg-background" : "hover:ring-1 hover:ring-primary/50"
      )}
    >
      {/* Block Controls - Visible on Hover */}
      <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background shadow-sm border rounded-lg p-1">
        <button 
          className="p-1.5 hover:bg-muted rounded text-muted-foreground cursor-grab active:cursor-grabbing"
          {...attributes} 
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button 
          className="p-1.5 hover:bg-primary/10 hover:text-primary rounded"
          onClick={onEdit}
        >
          <Settings className="w-4 h-4" />
        </button>
        <button 
          className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div onClick={onEdit} className="cursor-pointer">
        {children}
      </div>
    </div>
  );
}

// --- Main Editor Component ---
export default function Editor() {
  const params = useParams<{ siteId: string }>();
  const siteId = parseInt(params.siteId || "0");
  
  const { data: site, isLoading: isSiteLoading } = useSite(siteId);
  const { data: pages, isLoading: isPagesLoading } = usePages(siteId);
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const updateSite = useUpdateSite();

  const [activePageId, setActivePageId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [editingBlock, setEditingBlock] = useState<BlockData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize active page when pages load
  useEffect(() => {
    if (pages && pages.length > 0 && !activePageId) {
      setActivePageId(pages[0].id);
      // @ts-ignore - JSON parsing handled by react-query usually, but for safety
      const content = typeof pages[0].content === 'string' ? JSON.parse(pages[0].content) : pages[0].content;
      setBlocks(Array.isArray(content) ? content : []);
    }
  }, [pages]);

  // Handle Page Switch
  const switchPage = (pageId: number) => {
    if (activePageId) saveCurrentPage();
    setActivePageId(pageId);
    const page = pages?.find(p => p.id === pageId);
    if (page) {
      // @ts-ignore
      const content = typeof page.content === 'string' ? JSON.parse(page.content) : page.content;
      setBlocks(Array.isArray(content) ? content : []);
    }
  };

  const saveCurrentPage = async () => {
    if (!activePageId) return;
    await updatePage.mutateAsync({
      siteId,
      id: activePageId,
      content: blocks as any, // Cast for JSONB
    });
  };

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Block Operations
  const addBlock = (type: BlockType) => {
    const newBlock: BlockData = {
      id: nanoid(),
      type,
      content: {
        title: "New Heading",
        body: "Add your content description here.",
      }
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockContent = (id: string, content: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...content } } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (editingBlock?.id === id) setEditingBlock(null);
  };

  if (isSiteLoading || isPagesLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!site) return <div>Site not found</div>;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="h-16 border-b bg-card flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-display font-bold text-lg">{site.name}</h1>
          <span className="text-sm text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
             {pages?.find(p => p.id === activePageId)?.title || "Page"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/site/${site.slug}`} target="_blank">
             <Button variant="ghost" size="sm">
               <Eye className="w-4 h-4 mr-2" />
               Preview
             </Button>
          </Link>
          <Button 
            onClick={saveCurrentPage} 
            disabled={updatePage.isPending}
            className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
          >
            <Save className="w-4 h-4 mr-2" />
            {updatePage.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Components */}
        <aside className="w-72 border-r bg-card flex flex-col z-10 shadow-lg shadow-black/5">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Add Elements</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:text-primary transition-colors" onClick={() => addBlock('hero')}>
                <LayoutTemplate className="w-6 h-6" />
                <span className="text-xs">Hero</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:text-primary transition-colors" onClick={() => addBlock('text')}>
                <Type className="w-6 h-6" />
                <span className="text-xs">Text</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:text-primary transition-colors" onClick={() => addBlock('image')}>
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs">Image</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:text-primary transition-colors" onClick={() => addBlock('features')}>
                <LayoutTemplate className="w-6 h-6" />
                <span className="text-xs">Features</span>
              </Button>
            </div>
          </div>
          
          <div className="p-4 flex-1">
             <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Pages</h2>
             <div className="space-y-1">
               {pages?.map(page => (
                 <button
                   key={page.id}
                   onClick={() => switchPage(page.id)}
                   className={cn(
                     "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                     activePageId === page.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                   )}
                 >
                   {page.title}
                 </button>
               ))}
               <Button variant="ghost" className="w-full justify-start text-muted-foreground" size="sm" onClick={() => {
                 createPage.mutate({ siteId, title: "New Page", slug: `page-${nanoid(6)}`, order: pages?.length || 0, content: [] })
               }}>
                 <Plus className="w-4 h-4 mr-2" /> Add Page
               </Button>
             </div>
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-muted/30 overflow-y-auto relative p-8 md:p-12 custom-scrollbar">
          <div className="max-w-5xl mx-auto bg-white min-h-[800px] shadow-sm border rounded-xl p-8 md:p-12">
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.length === 0 ? (
                  <div className="h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                    <LayoutTemplate className="w-10 h-10 mb-4 opacity-20" />
                    <p>Drag and drop components or click to add from sidebar</p>
                  </div>
                ) : (
                  blocks.map(block => (
                    <SortableBlock 
                      key={block.id} 
                      id={block.id}
                      onEdit={() => setEditingBlock(block)}
                      onDelete={() => deleteBlock(block.id)}
                    >
                      <ComponentRenderer block={block} />
                    </SortableBlock>
                  ))
                )}
              </SortableContext>
            </DndContext>
          </div>
        </main>

        {/* Right Sidebar: Properties (Conditional) */}
        {editingBlock && (
          <aside className="w-80 border-l bg-card p-6 overflow-y-auto shadow-xl z-20 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg">Edit {editingBlock.type}</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingBlock(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {editingBlock.type === 'hero' && (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      value={editingBlock.content.title || ""} 
                      onChange={(e) => updateBlockContent(editingBlock.id, { title: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Textarea 
                      value={editingBlock.content.subtitle || ""} 
                      onChange={(e) => updateBlockContent(editingBlock.id, { subtitle: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input 
                      value={editingBlock.content.ctaText || ""} 
                      onChange={(e) => updateBlockContent(editingBlock.id, { ctaText: e.target.value })} 
                    />
                  </div>
                </>
              )}
              
              {editingBlock.type === 'text' && (
                <>
                  <div className="space-y-2">
                    <Label>Heading</Label>
                    <Input 
                      value={editingBlock.content.heading || ""} 
                      onChange={(e) => updateBlockContent(editingBlock.id, { heading: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Textarea 
                      className="min-h-[200px]"
                      value={editingBlock.content.body || ""} 
                      onChange={(e) => updateBlockContent(editingBlock.id, { body: e.target.value })} 
                    />
                  </div>
                </>
              )}

              {editingBlock.type === 'image' && (
                <>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input 
                      value={editingBlock.content.url || ""} 
                      onChange={(e) => updateBlockContent(editingBlock.id, { url: e.target.value })} 
                    />
                    <p className="text-xs text-muted-foreground">Try Unsplash URLs</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Caption</Label>
                    <Input 
                      value={editingBlock.content.caption || ""} 
                      onChange={(e) => updateBlockContent(editingBlock.id, { caption: e.target.value })} 
                    />
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
