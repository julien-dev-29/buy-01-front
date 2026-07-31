export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    sellerId: string;
    mediasId: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductPayload {
    name: string;
    description: string;
    price: number;
    mediaIds?: string[];
}