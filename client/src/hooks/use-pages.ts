import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type PageInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePages(siteId: number) {
  return useQuery({
    queryKey: [api.pages.list.path, siteId],
    queryFn: async () => {
      const url = buildUrl(api.pages.list.path, { siteId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pages");
      return api.pages.list.responses[200].parse(await res.json());
    },
    enabled: !!siteId && !isNaN(siteId),
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ siteId, ...data }: { siteId: number } & PageInput) => {
      const url = buildUrl(api.pages.create.path, { siteId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create page");
      return api.pages.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.pages.list.path, data.siteId] });
      toast({ title: "Success", description: "Page created successfully" });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ siteId, id, ...data }: { siteId: number; id: number } & Partial<PageInput>) => {
      const url = buildUrl(api.pages.update.path, { siteId, id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update page");
      return api.pages.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.pages.list.path, data.siteId] });
      toast({ title: "Saved", description: "Changes saved successfully" });
    },
  });
}
