import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import MaterialIcon from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { toast } from "@/components/ui/use-toast";
import {
  listAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
} from "@/lib/admin/orders";
import { formatMoney } from "@/lib/money";
import { usePageMetadata } from "@/lib/seo";
import { supabase } from "@/lib/supabase/client";
import type { StorefrontOrderStatus } from "@/types/orders";
import { publicEnv } from "@/lib/env";

const orderStatusOptions: StorefrontOrderStatus[] = [
  "created",
  "payment_pending",
  "payment_authorized",
  "paid",
  "failed",
  "cancelled",
  "fulfilled",
];

const orderStatusLabels: Record<StorefrontOrderStatus, string> = {
  created: "Created",
  payment_pending: "Payment pending",
  payment_authorized: "Payment authorized",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  fulfilled: "Fulfilled",
};

function formatAdminDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getShippingAddressSummary(address: AdminOrder["shippingAddress"]) {
  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function normalizeAdminError(error: unknown, fallback: string): string {
  const candidate = error as {
    code?: string;
    message?: string;
    details?: string | null;
    hint?: string | null;
  };

  const message = candidate?.message ?? fallback;
  const details = candidate?.details ? ` Details: ${candidate.details}` : "";
  const hint = candidate?.hint ? ` Hint: ${candidate.hint}` : "";
  const combined = `${message}${details}${hint}`.trim();
  const lowercase = combined.toLowerCase();

  if (
    lowercase.includes("row-level security") ||
    lowercase.includes("permission denied") ||
    candidate?.code === "42501"
  ) {
    return "Supabase is blocking writes. Make sure your account has admin privileges.";
  }

  return combined || fallback;
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState("date-newest");

  usePageMetadata({
    title: "Manage Orders | Admin Studio",
    description: "Review, filter, and fulfill storefront orders.",
    path: `${publicEnv.adminDashboardPath}/orders`,
    noIndex: true,
  });

  const {
    data: adminOrders = [],
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: listAdminOrders,
    enabled: Boolean(supabase),
  });

  const handleUpdateOrderStatus = async (
    order: AdminOrder,
    status: StorefrontOrderStatus,
  ) => {
    if (order.status === status) {
      return;
    }

    setUpdatingOrderId(order.id);

    try {
      await updateAdminOrderStatus(order.id, status);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);

      toast({
        title: "Order updated",
        description: `${order.orderNumber} is now ${orderStatusLabels[status].toLowerCase()}.`,
      });
    } catch (orderError) {
      console.error(orderError);
      const message = normalizeAdminError(
        orderError,
        "Order status could not be updated.",
      );
      toast({
        title: "Unable to update order",
        description: message,
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let pendingShipmentsCount = 0;
    let fulfilledCount = 0;

    adminOrders.forEach((order) => {
      // Calculate revenue from successful payments
      if (order.paymentStatus === "verified" || order.status === "paid") {
        totalRevenue += order.totalAmount;
      }
      
      // Calculate pending shipments (paid or authorized orders that are not yet fulfilled or cancelled)
      const isPaid = order.paymentStatus === "verified" || order.status === "paid";
      const isFulfilledOrCancelled = order.status === "fulfilled" || order.status === "cancelled";
      if (isPaid && !isFulfilledOrCancelled) {
        pendingShipmentsCount++;
      }

      if (order.status === "fulfilled") {
        fulfilledCount++;
      }
    });

    return {
      totalRevenue,
      pendingShipmentsCount,
      fulfilledCount,
    };
  }, [adminOrders]);

  // Filtered & Sorted orders list
  const filteredOrders = useMemo(() => {
    let result = [...adminOrders];

    // Search query
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          (order.customerName || "").toLowerCase().includes(query) ||
          (order.customerEmail || "").toLowerCase().includes(query) ||
          (order.customerPhone || "").toLowerCase().includes(query)
      );
    }

    // Order status filter
    if (orderStatus !== "all") {
      result = result.filter((order) => order.status === orderStatus);
    }

    // Payment status filter
    if (paymentStatus !== "all") {
      result = result.filter((order) => order.paymentStatus === paymentStatus);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "date-oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "amount-high") {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === "amount-low") {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

    return result;
  }, [adminOrders, search, orderStatus, paymentStatus, sortBy]);

  const ordersErrorMessage = ordersError
    ? normalizeAdminError(
        ordersError,
        "Orders could not be loaded. Please ensure your signed-in account is an admin.",
      )
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-28 pb-16 px-4 md:px-8 max-w-[1500px] mx-auto flex-1 w-full">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary mb-2">
              Secure Admin Studio
            </p>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">
              Order Operations
            </h1>
            <p className="text-sm text-on-surface-variant mt-2 max-w-3xl">
              Track live customer checkout results, verify razorpay transactions, and update order fulfillment statuses.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetchOrders()}
            disabled={isOrdersFetching}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-low text-on-surface font-semibold hover:bg-surface-dim transition-colors disabled:opacity-60"
          >
            <MaterialIcon icon="refresh" className={`text-base ${isOrdersFetching ? 'animate-spin' : ''}`} />
            {isOrdersFetching ? "Refreshing..." : "Refresh Catalog"}
          </button>
        </div>

        {/* Tab Bar Navigation */}
        <div className="flex border-b border-outline-variant/20 mb-8 gap-6 text-sm">
          <Link
            to={publicEnv.adminDashboardPath}
            className="pb-4 font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Products & Categories
          </Link>
          <Link
            to={`${publicEnv.adminDashboardPath}/orders`}
            className="pb-4 font-semibold text-primary border-b-2 border-primary relative"
          >
            Orders
          </Link>
        </div>

        {ordersErrorMessage && (
          <div className="mb-8 rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-sm text-on-surface">
            {ordersErrorMessage}
          </div>
        )}

        {/* KPI Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">Total Orders</p>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface mt-2">
                {isOrdersLoading ? "..." : adminOrders.length}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Checkouts received</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <MaterialIcon icon="receipt_long" className="text-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">Total Revenue</p>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface mt-2 text-tertiary">
                {isOrdersLoading ? "..." : formatMoney(stats.totalRevenue, "INR")}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">From verified payments</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary">
              <MaterialIcon icon="payments" className="text-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">Pending Shipments</p>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface mt-2 text-primary">
                {isOrdersLoading ? "..." : stats.pendingShipmentsCount}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Awaiting dispatch</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary-container/30 flex items-center justify-center text-primary">
              <MaterialIcon icon="local_shipping" className="text-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">Completed Orders</p>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface mt-2">
                {isOrdersLoading ? "..." : stats.fulfilledCount}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Successfully fulfilled</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <MaterialIcon icon="done_all" className="text-xl" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1">
                Search Customers or Orders
              </span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search order #, customer name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-container-highest rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary transition-all"
                />
                <div className="absolute left-4 top-3 text-on-surface-variant/70">
                  <MaterialIcon icon="search" className="text-lg" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1">
                Order Status
              </span>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm font-semibold"
              >
                <option value="all">All Statuses</option>
                {orderStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {orderStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1">
                Payment Status
              </span>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm font-semibold"
              >
                <option value="all">All Payments</option>
                <option value="verified">Verified / Paid</option>
                <option value="failed">Failed</option>
                <option value="created">Created</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-outline-variant/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-on-surface-variant font-medium">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: "date-newest", label: "Newest First" },
                  { value: "date-oldest", label: "Oldest First" },
                  { value: "amount-high", label: "Amount: High to Low" },
                  { value: "amount-low", label: "Amount: Low to High" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      sortBy === option.value
                        ? "bg-primary text-white"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-dim"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-bold uppercase tracking-widest text-secondary">
              Showing {filteredOrders.length} of {adminOrders.length} orders
            </div>
          </div>
        </div>

        {/* Orders Table Section */}
        <section className="rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/20 p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">
                  <th className="border-b border-outline-variant/20 py-3 pr-4">Order Details</th>
                  <th className="border-b border-outline-variant/20 py-3 pr-4">Customer info</th>
                  <th className="border-b border-outline-variant/20 py-3 pr-4">Items / Details</th>
                  <th className="border-b border-outline-variant/20 py-3 pr-4">Pricing Breakdown</th>
                  <th className="border-b border-outline-variant/20 py-3 pr-4">Payment</th>
                  <th className="border-b border-outline-variant/20 py-3 pr-4">Fulfillment Status</th>
                  <th className="border-b border-outline-variant/20 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const addressSummary = getShippingAddressSummary(order.shippingAddress);
                  const visibleItems = order.items.slice(0, 4);
                  const hiddenItemCount = order.items.length - visibleItems.length;

                  return (
                    <tr key={order.id} className="align-top hover:bg-surface-container/10 transition-colors">
                      <td className="border-b border-outline-variant/10 py-5 pr-4">
                        <p className="font-semibold text-on-surface text-base">
                          {order.orderNumber}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {formatAdminDate(order.createdAt)}
                        </p>
                        {order.razorpayOrderId && (
                          <div className="mt-3 flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded text-secondary">RP Order</span>
                            <span className="text-[11px] font-mono text-on-surface-variant max-w-[120px] truncate" title={order.razorpayOrderId}>
                              {order.razorpayOrderId}
                            </span>
                          </div>
                        )}
                      </td>
                      
                      <td className="border-b border-outline-variant/10 py-5 pr-4">
                        <p className="font-semibold text-on-surface">
                          {order.customerName || "Customer"}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant font-medium">
                          {order.customerEmail || "No email"}
                        </p>
                        {order.customerPhone && (
                          <p className="mt-1 text-xs text-on-surface-variant">
                            {order.customerPhone}
                          </p>
                        )}
                        <p className="mt-2.5 max-w-[260px] text-xs leading-5 text-on-surface-variant italic border-l-2 border-outline-variant/30 pl-2">
                          {addressSummary || "No shipping address provided"}
                        </p>
                      </td>

                      <td className="border-b border-outline-variant/10 py-5 pr-4">
                        {visibleItems.length ? (
                          <div className="space-y-3">
                            {visibleItems.map((item) => (
                              <div key={item.id} className="flex gap-3 items-center">
                                <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-surface-container-low border border-outline-variant/10 shadow-sm">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-outline-variant">
                                      <MaterialIcon icon="image" className="text-base" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-on-surface text-xs max-w-[160px] truncate">
                                    {item.title}
                                  </p>
                                  <p className="mt-0.5 text-[10px] text-on-surface-variant">
                                    {item.dimensionLabel} • {item.frame} • Qty {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {hiddenItemCount > 0 && (
                              <p className="text-[11px] font-bold text-primary pl-12">
                                +{hiddenItemCount} more item{hiddenItemCount === 1 ? "" : "s"}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-on-surface-variant text-xs">No items in order</span>
                        )}
                      </td>

                      <td className="border-b border-outline-variant/10 py-5 pr-4">
                        <p className="font-bold text-on-surface text-base">
                          {formatMoney(order.totalAmount, order.currencyCode)}
                        </p>
                        <div className="mt-1.5 space-y-0.5 text-[11px] text-on-surface-variant">
                          <div className="flex justify-between gap-4">
                            <span>Subtotal:</span>
                            <span className="font-medium">{formatMoney(order.subtotalAmount, order.currencyCode)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Delivery:</span>
                            <span className="font-medium">{formatMoney(order.shippingAmount, order.currencyCode)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="border-b border-outline-variant/10 py-5 pr-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                            order.paymentStatus === "verified"
                              ? "bg-secondary-container/40 text-on-surface border border-secondary/20"
                              : order.paymentStatus === "failed"
                                ? "bg-destructive/10 text-destructive border border-destructive/20"
                                : "bg-surface-container-high text-on-surface-variant"
                          }`}
                        >
                          {order.paymentStatus === "verified" ? "Paid / Verified" : order.paymentStatus}
                        </span>
                        {order.razorpayPaymentId && (
                          <div className="mt-2 text-[10px] text-on-surface-variant">
                            <span className="font-bold">TXN:</span> <code className="font-mono">{order.razorpayPaymentId}</code>
                          </div>
                        )}
                      </td>

                      <td className="border-b border-outline-variant/10 py-5 pr-4">
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.id}
                          onChange={(event) =>
                            void handleUpdateOrderStatus(
                              order,
                              event.target.value as StorefrontOrderStatus,
                            )
                          }
                          className={`w-full min-w-44 rounded-xl px-4 py-3 text-sm font-semibold border transition-all ${
                            order.status === "fulfilled"
                              ? "bg-secondary-container/20 text-on-surface border-secondary/30"
                              : order.status === "cancelled"
                                ? "bg-surface-container-high text-on-surface-variant/50 border-transparent"
                                : order.status === "paid"
                                  ? "bg-tertiary-container/20 text-tertiary border-tertiary/20 font-bold"
                                  : "bg-surface-container-highest text-on-surface border-outline-variant/20"
                          } disabled:opacity-60`}
                        >
                          {orderStatusOptions.map((status) => (
                            <option key={status} value={status} className="bg-surface-container-lowest text-on-surface">
                              {orderStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="border-b border-outline-variant/10 py-5 text-on-surface-variant text-xs">
                        {formatAdminDate(order.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!isOrdersLoading && filteredOrders.length === 0 && (
            <div className="mt-5 rounded-2xl bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
              No orders found matching the current search filters.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
