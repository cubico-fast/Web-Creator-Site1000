import { useSites, useDeleteSite } from "@/hooks/use-sites";
import { CreateSiteDialog } from "@/components/CreateSiteDialog";
import { Link } from "wouter";
import { 
  MoreVertical, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Globe, 
  Clock,
  LogOut,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const { data: sites, isLoading } = useSites();
  const deleteSite = useDeleteSite();
  const { user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this site? This cannot be undone.")) {
      deleteSite.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display font-bold text-xl tracking-tight hover:text-primary transition-colors">
              SiteCraft
            </Link>
            <span className="text-muted-foreground/30 text-xl font-light">/</span>
            <span className="font-medium text-muted-foreground">Dashboard</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.firstName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
              </div>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Sites</h1>
            <p className="text-muted-foreground mt-1">Manage and edit your websites</p>
          </div>
          <CreateSiteDialog />
        </div>

        {sites && sites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <div 
                key={site.id} 
                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col"
              >
                {/* Site Preview Area (Placeholder) */}
                <div className="aspect-[16/9] bg-muted relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-muted to-muted/50" />
                  <Globe className="w-12 h-12 text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link href={`/editor/${site.id}`}>
                      <Button variant="secondary" className="shadow-lg">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Site
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-lg truncate pr-2">{site.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/site/${site.slug}`} target="_blank">
                          <DropdownMenuItem className="cursor-pointer">
                            <ExternalLink className="mr-2 h-4 w-4" /> View Live
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/editor/${site.id}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => handleDelete(site.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {site.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4 mt-auto">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(site.updatedAt || new Date()), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${site.isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
                      {site.isPublished ? "Published" : "Draft"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card border border-dashed border-border rounded-3xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Layout className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">No sites created yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Start building your online presence today. Create your first website in minutes.
            </p>
            <CreateSiteDialog />
          </div>
        )}
      </main>
    </div>
  );
}
