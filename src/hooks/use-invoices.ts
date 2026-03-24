import { useQuery } from "@tanstack/react-query";

interface InvoicesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export function useInvoices(params: InvoicesParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);

  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const res = await fetch(`/api/v1/invoices?${searchParams}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
  });
}
