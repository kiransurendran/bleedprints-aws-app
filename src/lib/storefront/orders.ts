import { supabase } from "@/lib/supabase/client";
import type { StorefrontOrder } from "@/types/orders";

type OrderRow = {
  id: string;
  order_number: string;
  status: StorefrontOrder["status"];
  payment_status: string;
  currency_code: StorefrontOrder["currencyCode"];
  total_amount: number;
  delivery_method: StorefrontOrder["deliveryMethod"];
  created_at: string;
  shipping_address: StorefrontOrder["shippingAddress"];
  order_items: Array<{
    id: string;
    product_title: string;
    selected_dimension_label: string;
    selected_frame: string;
    quantity: number;
    line_total: number;
    product_snapshot: {
      imageUrl?: string | null;
    } | null;
  }> | null;
};

export async function listCustomerOrders(userId: string): Promise<StorefrontOrder[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, currency_code, total_amount, delivery_method, created_at, shipping_address, order_items(id, product_title, selected_dimension_label, selected_frame, quantity, line_total, product_snapshot)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as OrderRow[]).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    currencyCode: order.currency_code,
    totalAmount: Number(order.total_amount),
    deliveryMethod: order.delivery_method,
    createdAt: order.created_at,
    shippingAddress: order.shipping_address || {},
    items: (order.order_items ?? []).map((item) => ({
      id: item.id,
      title: item.product_title,
      dimensionLabel: item.selected_dimension_label,
      frame: item.selected_frame,
      quantity: item.quantity,
      lineTotal: Number(item.line_total),
      imageUrl: item.product_snapshot?.imageUrl ?? null,
    })),
  }));
}
