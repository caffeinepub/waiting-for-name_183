import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartItem, Order, PortfolioItem, Product } from "../backend";
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

// Cart
export function useGetCartItems() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCartItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
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
    }: {
      customerName: string;
      email: string;
      shippingAddress: string;
      items: CartItem[];
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createOrder(customerName, email, shippingAddress, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
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
