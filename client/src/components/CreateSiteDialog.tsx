import { useState } from "react";
import { useCreateSite } from "@/hooks/use-sites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

export function CreateSiteDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  
  const createSite = useCreateSite();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSite.mutateAsync({
        name,
        description,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        isPublished: false,
      });
      setOpen(false);
      setName("");
      setDescription("");
      setSlug("");
    } catch (error) {
      // Error handled by hook toast
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-full px-6">
          <Plus className="w-4 h-4 mr-2" />
          Create New Site
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Site</DialogTitle>
          <DialogDescription>
            Give your new website a name and URL. You can change these later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={handleNameChange}
              placeholder="My Awesome Portfolio" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">/sites/</span>
              <Input 
                id="slug" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-portfolio" 
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this site about?"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSite.isPending}>
              {createSite.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Site"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
