import { supabase } from "@/lib/supabase/client";
import type { CurrencyCode } from "@/types/catalog";
import type { StorefrontOrderStatus } from "@/types/orders";

type AdminShippingAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

type AdminOrderItemRow = {
  id: string;
  product_title: string;
  selected_dimension_label: string;
  selected_frame: string;
  quantity: number;
  line_total: number;
  product_snapshot: {
    imageUrl?: string | null;
  } | null;
};

type AdminOrderRow = {
  id: string;
  order_number: string;
  status: StorefrontOrderStatus;
  payment_status: string;
  currency_code: CurrencyCode;
  subtotal_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  delivery_method: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: AdminShippingAddress | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  updated_at: string;
  order_items: AdminOrderItemRow[] | null;
};

export type AdminOrderItem = {
  id: string;
  title: string;
  dimensionLabel: string;
  frame: string;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  status: StorefrontOrderStatus;
  paymentStatus: string;
  currencyCode: CurrencyCode;
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  deliveryMethod: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: AdminShippingAddress;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
};

export async function listAdminOrders(): Promise<AdminOrder[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, currency_code, subtotal_amount, shipping_amount, tax_amount, total_amount, delivery_method, customer_name, customer_email, customer_phone, shipping_address, razorpay_order_id, razorpay_payment_id, created_at, updated_at, order_items(id, product_title, selected_dimension_label, selected_frame, quantity, line_total, product_snapshot)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return ((data ?? []) as AdminOrderRow[]).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    currencyCode: order.currency_code,
    subtotalAmount: Number(order.subtotal_amount),
    shippingAmount: Number(order.shipping_amount),
    taxAmount: Number(order.tax_amount),
    totalAmount: Number(order.total_amount),
    deliveryMethod: order.delivery_method,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    shippingAddress: order.shipping_address ?? {},
    razorpayOrderId: order.razorpay_order_id,
    razorpayPaymentId: order.razorpay_payment_id,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: (order.order_items ?? []).map((item) => ({
      id: item.id,
      title: item.product_title,
      dimensionLabel: item.selected_dimension_label,
      frame: item.selected_frame,
      quantity: Number(item.quantity),
      lineTotal: Number(item.line_total),
      imageUrl: item.product_snapshot?.imageUrl ?? null,
    })),
  }));
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: StorefrontOrderStatus,
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Order was not updated. Check the admin order update policy.");
  }
}
