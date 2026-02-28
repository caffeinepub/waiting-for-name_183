import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PortfolioItem {
    id: bigint;
    title: string;
    clientName: string;
    description: string;
    imageUrl: string;
    category: string;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
}
export interface CustomDesignRequest {
    id: bigint;
    customerName: string;
    status: string;
    createdAt: string;
    description: string;
    fileUrls: Array<string>;
    productType: string;
    email: string;
    colorPreferences: string;
    chatEscalation: boolean;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: string;
    trackingNumber: string;
    createdAt: string;
    email: string;
    shippingAddress: string;
    items: Array<OrderItem>;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    price: bigint;
}
export interface backendInterface {
    addCustomDesignRequest(customerName: string, email: string, productType: string, description: string, colorPreferences: string, fileUrls: Array<string>, createdAt: string, chatEscalation: boolean): Promise<bigint>;
    addPortfolioItem(title: string, description: string, category: string, imageUrl: string, clientName: string): Promise<bigint>;
    addProduct(name: string, description: string, price: bigint, category: string, imageUrl: string): Promise<bigint>;
    createOrder(customerName: string, email: string, shippingAddress: string, items: Array<OrderItem>, createdAt: string): Promise<bigint>;
    deleteCustomDesignRequest(id: bigint): Promise<void>;
    deletePortfolioItem(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAboutUs(): Promise<string>;
    getAllCustomDesignRequests(): Promise<Array<CustomDesignRequest>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllPortfolioItems(): Promise<Array<PortfolioItem>>;
    getAllProducts(): Promise<Array<Product>>;
    getCustomDesignRequest(id: bigint): Promise<CustomDesignRequest>;
    getOrder(id: bigint): Promise<Order>;
    getPortfolioItem(id: bigint): Promise<PortfolioItem>;
    getProduct(id: bigint): Promise<Product>;
    getShippingInfo(): Promise<string>;
    updateAboutUs(newText: string): Promise<void>;
    updateCustomDesignRequestStatus(id: bigint, status: string): Promise<void>;
    updateOrderStatus(id: bigint, status: string, trackingNumber: string): Promise<void>;
    updatePortfolioItem(id: bigint, title: string, description: string, category: string, imageUrl: string, clientName: string): Promise<void>;
    updateProduct(id: bigint, name: string, description: string, price: bigint, category: string, imageUrl: string): Promise<void>;
    updateShippingInfo(newText: string): Promise<void>;
}
