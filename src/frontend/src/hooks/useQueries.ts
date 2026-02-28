import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CustomDesignRequest,
  Order,
  OrderItem,
  PortfolioItem,
  Product,
} from "../backend";
import { useActor } from "./useActor";

// Products
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// Portfolio
export function useGetAllPortfolioItems() {
  const { actor, isFetching } = useActor();
  return useQuery<PortfolioItem[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPortfolioItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPortfolioItem(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PortfolioItem | null>({
    queryKey: ["portfolioItem", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getPortfolioItem(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

// Orders
export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerName,
      email,
      shippingAddress,
      items,
      createdAt,
    }: {
      customerName: string;
      email: string;
      shippingAddress: string;
      items: OrderItem[];
      createdAt: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createOrder(
        customerName,
        email,
        shippingAddress,
        items,
        createdAt,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrder(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Order | null>({
    queryKey: ["order", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getOrder(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      trackingNumber,
    }: {
      id: bigint;
      status: string;
      trackingNumber: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateOrderStatus(id, status, trackingNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

// Company Info
export function useGetAboutUs() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["aboutUs"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getAboutUs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetShippingInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["shippingInfo"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getShippingInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

// Custom Design Requests
export function useGetAllCustomDesignRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<CustomDesignRequest[]>({
    queryKey: ["designRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomDesignRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateCustomDesignRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateCustomDesignRequestStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designRequests"] });
    },
  });
}

export function useDeleteCustomDesignRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteCustomDesignRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designRequests"] });
    },
  });
}
