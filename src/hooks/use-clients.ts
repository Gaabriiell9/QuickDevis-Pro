import { useQuery } from "@tanstack/react-query";

interface ClientsParams {
  page?: number;
  search?: string;
  type?: string;
}

export function useClients(params: ClientsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.search) searchParams.set("search", params.search);
  if (params.type) searchParams.set("type", params.type);

  return useQuery({
    queryKey: ["clients", params],
    queryFn: async () => {
      const res = await fetch(`/api/v1/clients?${searchParams}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });
}
