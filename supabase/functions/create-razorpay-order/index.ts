import { createClient } from "npm:@supabase/supabase-js@2.49.8";

import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { buildRazorpayAuthHeader } from "../_shared/razorpay.ts";

type CreateOrderRequest = {
  deliveryMethod: "standard" | "express";
  customer: {
    fullName: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    productSlug?: string;
    dimensionId?: string;
    quantity: number;
    frame?: string;
  }>;
};

type ProductRecord = {
  id: string;
  slug: string;
  title: string;
  currency_code: "INR" | "USD";
  available_for_sale: boolean;
};

type DimensionRecord = {
  id: string;
  product_id: string;
  label: string;
  amount: number;
};

type ProductImageRecord = {
  product_id: string;
  image_url: string;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function resolveCurrentUserId(authHeader: string | null) {
  if (!authHeader || !supabaseAnonKey) {
    return null;
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const { data, error } = await authClient.auth.getUser();

  if (error) {
    console.error("Unable to resolve checkout user:", error.message);
    return null;
  }

  return data.user?.id ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  if (!supabaseUrl || !serviceRoleKey || !razorpayKeyId || !razorpayKeySecret) {
    return jsonResponse(
      { error: "Supabase or Razorpay server secrets are missing." },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json()) as CreateOrderRequest;
    const currentUserId = await resolveCurrentUserId(
      req.headers.get("Authorization"),
    );

    if (!currentUserId) {
      return jsonResponse(
        { error: "Authentication is required before placing an order." },
        { status: 401 },
      );
    }

    if (!body.customer?.fullName || !body.customer?.email || !body.customer?.addressLine1) {
      return jsonResponse(
        { error: "Customer shipping details are incomplete." },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return jsonResponse(
        { error: "At least one cart item is required." },
        { status: 400 },
      );
    }

    const missingIdentifiers = body.items.some(
      (item) => !item.productSlug || !item.dimensionId,
    );

    if (missingIdentifiers) {
      return jsonResponse(
        { error: "Each cart item must include a product slug and dimension id." },
        { status: 400 },
      );
    }

    const productSlugs = [...new Set(body.items.map((item) => item.productSlug!))];
    const dimensionIds = [...new Set(body.items.map((item) => item.dimensionId!))];

    const [
      { data: products, error: productsError },
      { data: dimensions, error: dimensionsError },
    ] =
      await Promise.all([
        supabase
          .from("products")
          .select("id, slug, title, currency_code, available_for_sale")
          .in("slug", productSlugs)
          .eq("is_active", true),
        supabase
          .from("product_dimensions")
          .select("id, product_id, label, amount")
          .in("id", dimensionIds),
      ]);

    if (productsError) {
      throw productsError;
    }

    if (dimensionsError) {
      throw dimensionsError;
    }

    const productBySlug = new Map(
      ((products ?? []) as ProductRecord[]).map((product) => [product.slug, product]),
    );
    const dimensionById = new Map(
      ((dimensions ?? []) as DimensionRecord[]).map((dimension) => [dimension.id, dimension]),
    );
    const productIds = ((products ?? []) as ProductRecord[]).map((product) => product.id);
    const { data: productImages, error: productImagesError } = productIds.length
      ? await supabase
          .from("product_images")
          .select("product_id, image_url")
          .in("product_id", productIds)
          .eq("role", "primary")
      : { data: [], error: null };

    if (productImagesError) {
      throw productImagesError;
    }

    const imageByProductId = new Map(
      ((productImages ?? []) as ProductImageRecord[]).map((image) => [
        image.product_id,
        image.image_url,
      ]),
    );

    const lineItems = body.items.map((item) => {
      const product = productBySlug.get(item.productSlug!);
      const dimension = dimensionById.get(item.dimensionId!);

      if (!product || !dimension || dimension.product_id !== product.id) {
        throw new Error("One or more cart items no longer match the catalog.");
      }

      if (!product.available_for_sale) {
        throw new Error(`"${product.title}" is not currently available for sale.`);
      }

      return {
        product,
        dimension,
        quantity: Math.max(1, item.quantity),
        frame: item.frame || "Unframed",
        lineTotal: Number((dimension.amount * Math.max(1, item.quantity)).toFixed(2)),
      };
    });

    const currencies = [...new Set(lineItems.map((item) => item.product.currency_code))];
    if (currencies.length !== 1) {
      return jsonResponse(
        { error: "Mixed-currency carts are not supported." },
        { status: 400 },
      );
    }

    const currencyCode = currencies[0];
    const subtotalAmount = Number(
      lineItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2),
    );
    const shippingAmount = body.deliveryMethod === "express" ? 240 : 0;
    const taxAmount = 0;
    const totalAmount = Number(
      (subtotalAmount + shippingAmount + taxAmount).toFixed(2),
    );

    const { data: insertedOrder, error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        user_id: currentUserId,
        delivery_method: body.deliveryMethod,
        status: "created",
        payment_status: "created",
        currency_code: currencyCode,
        subtotal_amount: subtotalAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        customer_name: body.customer.fullName,
        customer_email: body.customer.email,
        customer_phone: body.customer.phone || null,
        shipping_address: {
          line1: body.customer.addressLine1,
          line2: body.customer.addressLine2 || null,
          city: body.customer.city,
          state: body.customer.state || null,
          postalCode: body.customer.postalCode,
          country: body.customer.country,
        },
        notes: {
          source: "react-storefront",
        },
      })
      .select("id, order_number")
      .single();

    if (orderInsertError || !insertedOrder) {
      throw orderInsertError ?? new Error("Order record could not be created.");
    }

    const { error: orderItemsError } = await supabase.from("order_items").insert(
      lineItems.map((item) => ({
        order_id: insertedOrder.id,
        product_id: item.product.id,
        product_slug: item.product.slug,
        product_title: item.product.title,
        selected_dimension_id: item.dimension.id,
        selected_dimension_label: item.dimension.label,
        selected_frame: item.frame,
        quantity: item.quantity,
        unit_amount: item.dimension.amount,
        line_total: item.lineTotal,
        product_snapshot: {
          slug: item.product.slug,
          title: item.product.title,
          dimensionLabel: item.dimension.label,
          frame: item.frame,
          imageUrl: imageByProductId.get(item.product.id) ?? null,
          currencyCode: item.product.currency_code,
        },
      })),
    );

    if (orderItemsError) {
      await supabase
        .from("orders")
        .update({
          status: "failed",
          payment_status: "failed",
          notes: {
            source: "react-storefront",
            error: "order-items-insert-failed",
          },
        })
        .eq("id", insertedOrder.id);

      throw orderItemsError;
    }

    const razorpayOrderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: buildRazorpayAuthHeader(razorpayKeyId, razorpayKeySecret),
      },
      body: JSON.stringify({
        amount: Math.round(totalAmount * 100),
        currency: currencyCode,
        receipt: insertedOrder.order_number,
        notes: {
          bleedprints_order_id: insertedOrder.id,
          bleedprints_order_number: insertedOrder.order_number,
          customer_email: body.customer.email.slice(0, 255),
        },
      }),
    });

    if (!razorpayOrderResponse.ok) {
      const razorpayErrorText = await razorpayOrderResponse.text();

      await supabase
        .from("orders")
        .update({
          status: "failed",
          payment_status: "failed",
          notes: {
            source: "react-storefront",
            razorpayError: razorpayErrorText,
          },
        })
        .eq("id", insertedOrder.id);

      return jsonResponse(
        { error: "Razorpay order creation failed.", details: razorpayErrorText },
        { status: 502 },
      );
    }

    const razorpayOrder = await razorpayOrderResponse.json();

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: "payment_pending",
        razorpay_order_id: razorpayOrder.id,
      })
      .eq("id", insertedOrder.id);

    if (orderUpdateError) {
      throw orderUpdateError;
    }

    return jsonResponse({
      orderId: insertedOrder.id,
      orderNumber: insertedOrder.order_number,
      currency: currencyCode,
      amountSubunits: Math.round(totalAmount * 100),
      subtotalAmount,
      shippingAmount,
      taxAmount,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      keyId: razorpayKeyId,
    });
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected checkout error.",
      },
      { status: 500 },
    );
  }
});
