import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Layout, Zap, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">SiteCraft</span>
          </div>
          
          <div className="flex items-center gap-4">
            {!isLoading && isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="rounded-full">Go to Dashboard</Button>
              </Link>
            ) : (
              <a href="/api/login">
                <Button variant="default" className="rounded-full px-6">
                  Sign In
                </Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            The future of website building is here
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-[1.1]">
            Build stunning websites <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">without code</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Create professional, responsive websites in minutes with our intuitive drag-and-drop editor. No design skills required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={isAuthenticated ? "/dashboard" : "/api/login"}>
              <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                Start Building for Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
              View Examples
            </Button>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card/50 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Visual Editor</h3>
              <p className="text-muted-foreground">Drag, drop, and customize every element. See your changes instantly as you build.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">Generated sites are optimized for speed and SEO out of the box. Google loves them.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-display mb-3">Instant Publishing</h3>
              <p className="text-muted-foreground">Go live with a single click. We handle the hosting, SSL, and domains for you.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
