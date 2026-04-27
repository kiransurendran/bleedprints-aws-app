import type { CurrencyCode } from "@/types/catalog";

export interface CheckoutSuccessItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  size: string;
  frame: string;
  lineTotal: number;
}

export interface CheckoutSuccessState {
  orderId: string;
  orderNumber: string;
  currencyCode: CurrencyCode;
  customerName: string;
  deliveryLabel: string;
  shippingAddressLines: string[];
  items: CheckoutSuccessItem[];
}
