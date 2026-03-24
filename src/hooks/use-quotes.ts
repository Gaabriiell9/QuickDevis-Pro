import { useQuery } from "@tanstack/react-query";

interface QuotesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export function useQuotes(params: QuotesParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);

  return useQuery({
    queryKey: ["quotes", params],
    queryFn: async () => {
      const res = await fetch(`/api/v1/quotes?${searchParams}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch quotes");
      return res.json();
    },
  });
}
