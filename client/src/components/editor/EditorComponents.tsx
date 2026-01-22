import { GripVertical, X, Image as ImageIcon, Type, Layout, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Block Types ---
export type BlockType = 'hero' | 'text' | 'image' | 'features';

export interface BlockData {
  id: string;
  type: BlockType;
  content: any;
}

// --- Renderers ---

export const HeroBlock = ({ content }: { content: any }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/50 rounded-2xl p-8 md:p-16 text-center">
    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 font-display">
      {content.title || "Your Hero Title"}
    </h1>
    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
      {content.subtitle || "Write a subtitle that explains your value proposition clearly and effectively."}
    </p>
    <div className="flex justify-center gap-4">
      <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
        {content.ctaText || "Get Started"}
      </button>
      <button className="px-8 py-3 bg-background border border-input font-semibold rounded-lg hover:bg-accent transition-colors">
        Learn More
      </button>
    </div>
  </div>
);

export const TextBlock = ({ content }: { content: any }) => (
  <div className="prose prose-lg max-w-none p-4">
    <h2 className="text-2xl font-bold font-display">{content.heading || "Section Heading"}</h2>
    <p className="text-muted-foreground leading-relaxed">
      {content.body || "This is a text block. You can write your content here. It supports basic paragraphs and is great for long-form content."}
    </p>
  </div>
);

export const ImageBlock = ({ content }: { content: any }) => (
  <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video bg-muted group">
    <img 
      src={content.url || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=60"} 
      alt={content.alt || "Stock image"} 
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
      <p className="text-white font-medium">{content.caption}</p>
    </div>
  </div>
);

export const FeaturesBlock = ({ content }: { content: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-6 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
          <Layout className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg mb-2 font-display">{content[`feature${i}Title`] || `Feature ${i}`}</h3>
        <p className="text-sm text-muted-foreground">
          {content[`feature${i}Desc`] || "Describe this amazing feature in a few words."}
        </p>
      </div>
    ))}
  </div>
);

export const ComponentRenderer = ({ block }: { block: BlockData }) => {
  switch (block.type) {
    case 'hero': return <HeroBlock content={block.content} />;
    case 'text': return <TextBlock content={block.content} />;
    case 'image': return <ImageBlock content={block.content} />;
    case 'features': return <FeaturesBlock content={block.content} />;
    default: return <div className="p-4 border border-dashed rounded text-center">Unknown Block</div>;
  }
};
