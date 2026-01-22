import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type SiteInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSites() {
  return useQuery({
    queryKey: [api.sites.list.path],
    queryFn: async () => {
      const res = await fetch(api.sites.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sites");
      return api.sites.list.responses[200].parse(await res.json());
    },
  });
}

export function useSite(id: number) {
  return useQuery({
    queryKey: [api.sites.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.sites.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch site");
      return api.sites.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useSiteBySlug(slug: string) {
  return useQuery({
    queryKey: [api.sites.getBySlug.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.sites.getBySlug.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch site");
      return api.sites.getBySlug.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SiteInput) => {
      const res = await fetch(api.sites.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
           const error = api.sites.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create site");
      }
      return api.sites.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.list.path] });
      toast({ title: "Success", description: "Site created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<SiteInput>) => {
      const url = buildUrl(api.sites.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update site");
      return api.sites.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, data.id] });
      toast({ title: "Saved", description: "Site updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.sites.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete site");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.list.path] });
      toast({ title: "Deleted", description: "Site removed" });
    },
  });
}
