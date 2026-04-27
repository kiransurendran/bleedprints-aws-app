import type { CurrencyCode } from "@/types/catalog";

export type StorefrontOrderStatus =
  | "created"
  | "payment_pending"
  | "payment_authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "fulfilled";

export interface StorefrontOrderItem {
  id: string;
  title: string;
  dimensionLabel: string;
  frame: string;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
}

export interface StorefrontOrder {
  id: string;
  orderNumber: string;
  status: StorefrontOrderStatus;
  paymentStatus: string;
  currencyCode: CurrencyCode;
  totalAmount: number;
  deliveryMethod: "standard" | "express";
  createdAt: string;
  shippingAddress: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  items: StorefrontOrderItem[];
}
