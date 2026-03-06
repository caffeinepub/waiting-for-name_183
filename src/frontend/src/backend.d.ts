import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    email: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
}
export interface IntegrationSettings {
    printifyShopId: string;
    shopifyDomain: string;
    printifyApiKey: string;
    shopifyApiToken: string;
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
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PortfolioItem {
    id: bigint;
    title: string;
    clientName: string;
    description: string;
    imageUrl: string;
    category: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Product {
    id: bigint;
    imageUrls: Array<string>;
    name: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    category: string;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomDesignRequest(customerName: string, email: string, productType: string, description: string, colorPreferences: string, fileUrls: Array<string>, createdAt: string, chatEscalation: boolean): Promise<bigint>;
    addPortfolioItem(title: string, description: string, category: string, imageUrl: string, clientName: string): Promise<bigint>;
    addProduct(name: string, description: string, price: bigint, category: string, imageUrl: string): Promise<bigint>;
    addProductWithImages(name: string, description: string, price: bigint, category: string, imageUrl: string, imageUrls: Array<string>, stock: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(customerName: string, email: string, shippingAddress: string, items: Array<OrderItem>, createdAt: string): Promise<bigint>;
    deleteCustomDesignRequest(id: bigint): Promise<void>;
    deletePortfolioItem(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAboutUs(): Promise<string>;
    getAllCustomDesignRequests(): Promise<Array<CustomDesignRequest>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllPortfolioItems(): Promise<Array<PortfolioItem>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllSiteTexts(): Promise<Array<[string, string]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomDesignRequest(id: bigint): Promise<CustomDesignRequest>;
    getHumanRequestCount(): Promise<bigint>;
    getIntegrationSettings(): Promise<IntegrationSettings>;
    getNotificationEmail(): Promise<string>;
    getOrder(id: bigint): Promise<Order>;
    getPortfolioItem(id: bigint): Promise<PortfolioItem>;
    getProduct(id: bigint): Promise<Product>;
    getShippingInfo(): Promise<string>;
    getSiteText(key: string): Promise<string>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setIntegrationSettings(settings: IntegrationSettings): Promise<void>;
    setNotificationEmail(email: string): Promise<void>;
    setSiteText(key: string, value: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAboutUs(newText: string): Promise<void>;
    updateCustomDesignRequestStatus(id: bigint, status: string): Promise<void>;
    updateOrderStatus(id: bigint, status: string, trackingNumber: string): Promise<void>;
    updatePortfolioItem(id: bigint, title: string, description: string, category: string, imageUrl: string, clientName: string): Promise<void>;
    updateProduct(id: bigint, name: string, description: string, price: bigint, category: string, imageUrl: string): Promise<void>;
    updateProductWithImages(id: bigint, name: string, description: string, price: bigint, category: string, imageUrl: string, imageUrls: Array<string>, stock: bigint): Promise<void>;
    updateShippingInfo(newText: string): Promise<void>;
}
