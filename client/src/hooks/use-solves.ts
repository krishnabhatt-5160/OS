import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Fetch all recorded solves
export function useSolves() {
  return useQuery({
    queryKey: [api.solves.list.path],
    queryFn: async () => {
      const res = await fetch(api.solves.list.path);
      if (!res.ok) throw new Error("Failed to fetch solves");
      const data = await res.json();
      return api.solves.list.responses[200].parse(data);
    },
  });
}

// Record a new solve session
export function useCreateSolve() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.solves.create.input>) => {
      const validated = api.solves.create.input.parse(data);
      const res = await fetch(api.solves.create.path, {
        method: api.solves.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        throw new Error("Failed to create solve record");
      }
      return api.solves.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.solves.list.path] });
    },
  });
}
