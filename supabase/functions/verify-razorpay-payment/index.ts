import { createClient } from "npm:@supabase/supabase-js@2.49.8";

import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { signRazorpayPayload } from "../_shared/razorpay.ts";

type VerifyPaymentRequest = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  if (!supabaseUrl || !serviceRoleKey || !razorpayKeySecret) {
    return jsonResponse(
      { error: "Supabase or Razorpay server secrets are missing." },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json()) as VerifyPaymentRequest;

    if (!body.orderId || !body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) {
      return jsonResponse(
        { error: "Payment verification payload is incomplete." },
        { status: 400 },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, razorpay_order_id")
      .eq("id", body.orderId)
      .single();

    if (orderError || !order) {
      throw orderError ?? new Error("Order not found.");
    }

    if (order.razorpay_order_id !== body.razorpayOrderId) {
      return jsonResponse(
        { error: "Razorpay order id does not match the stored order." },
        { status: 400 },
      );
    }

    const generatedSignature = await signRazorpayPayload(
      `${body.razorpayOrderId}|${body.razorpayPaymentId}`,
      razorpayKeySecret,
    );

    if (generatedSignature !== body.razorpaySignature) {
      await supabase
        .from("orders")
        .update({
          status: "failed",
          payment_status: "failed",
          razorpay_payment_id: body.razorpayPaymentId,
          razorpay_signature: body.razorpaySignature,
        })
        .eq("id", body.orderId);

      return jsonResponse(
        { error: "Razorpay payment signature verification failed." },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_status: "verified",
        razorpay_payment_id: body.razorpayPaymentId,
        razorpay_signature: body.razorpaySignature,
      })
      .eq("id", body.orderId);

    if (updateError) {
      throw updateError;
    }

    return jsonResponse({
      orderId: body.orderId,
      orderNumber: order.order_number,
      paymentStatus: "verified",
    });
  } catch (error) {
    console.error(error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected payment verification error.",
      },
      { status: 500 },
    );
  }
});
