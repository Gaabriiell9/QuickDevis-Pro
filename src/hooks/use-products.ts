import { useQuery } from "@tanstack/react-query";

interface ProductsParams {
  page?: number;
  search?: string;
  isActive?: boolean;
}

export function useProducts(params: ProductsParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.search) searchParams.set("search", params.search);
  if (params.isActive !== undefined)
    searchParams.set("isActive", String(params.isActive));

  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await fetch(`/api/v1/products?${searchParams}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
}
