import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    email: string;
    shippingAddress: string;
    items: Array<CartItem>;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    price: bigint;
}
export interface PortfolioItem {
    id: bigint;
    title: string;
    clientName: string;
    description: string;
    imageUrl: string;
    category: string;
}
export interface backendInterface {
    addPortfolioItem(title: string, description: string, category: string, imageUrl: string, clientName: string): Promise<bigint>;
    addProduct(name: string, description: string, price: bigint, category: string, imageUrl: string): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    clearCart(): Promise<void>;
    createOrder(customerName: string, email: string, shippingAddress: string, items: Array<CartItem>): Promise<bigint>;
    deletePortfolioItem(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAboutUs(): Promise<string>;
    getAllOrders(): Promise<Array<Order>>;
    getAllPortfolioItems(): Promise<Array<PortfolioItem>>;
    getAllProducts(): Promise<Array<Product>>;
    getCartItems(): Promise<Array<CartItem>>;
    getOrder(id: bigint): Promise<Order>;
    getPortfolioItem(id: bigint): Promise<PortfolioItem>;
    getProduct(id: bigint): Promise<Product>;
    getShippingInfo(): Promise<string>;
    removeFromCart(productId: bigint): Promise<void>;
    updateAboutUs(newText: string): Promise<void>;
    updatePortfolioItem(id: bigint, title: string, description: string, category: string, imageUrl: string, clientName: string): Promise<void>;
    updateProduct(id: bigint, name: string, description: string, price: bigint, category: string, imageUrl: string): Promise<void>;
    updateShippingInfo(newText: string): Promise<void>;
}
