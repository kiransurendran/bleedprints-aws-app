import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatMoney } from '@/lib/money';
import { publicEnv } from '@/lib/env';
import { loadRazorpayScript, type RazorpayCheckoutResponse } from '@/lib/razorpay';
import { usePageMetadata } from '@/lib/seo';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { CheckoutSuccessState } from '@/types/checkout';

type CheckoutFormState = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type CreateRazorpayOrderResponse = {
  orderId: string;
  orderNumber: string;
  currency: 'INR' | 'USD';
  amountSubunits: number;
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  razorpayOrderId: string;
  keyId: string;
};

type VerifyRazorpayPaymentResponse = {
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
};

type EdgeFunctionErrorBody = {
  code?: string;
  details?: unknown;
  error?: unknown;
  message?: unknown;
};

async function getEdgeFunctionErrorMessage(
  error: unknown,
  fallback: string,
) {
  const context = (error as { context?: unknown })?.context;

  if (
    context &&
    typeof context === 'object' &&
    'json' in context &&
    typeof context.json === 'function'
  ) {
    try {
      const body = (await context.json()) as EdgeFunctionErrorBody;
      const primary =
        typeof body.error === 'string'
          ? body.error
          : typeof body.message === 'string'
            ? body.message
            : fallback;
      const details =
        typeof body.details === 'string'
          ? ` Details: ${body.details}`
          : body.code
            ? ` Code: ${body.code}`
            : '';

      return `${primary}${details}`;
    } catch {
      // Fall through to the generic error message if the response body is not JSON.
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [delivery, setDelivery] = useState('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CheckoutFormState>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const shippingCost = delivery === 'express' ? 240 : 70;
  const tax = 0;
  const total = subtotal + shippingCost + tax;
  const currencyCode = items[0]?.currencyCode ?? 'INR';

  const shippingAddressLines = useMemo(
    () =>
      [
        form.fullName,
        form.addressLine1,
        form.addressLine2,
        [form.city, form.state].filter(Boolean).join(', '),
        [form.postalCode, form.country].filter(Boolean).join(' • '),
      ].filter(Boolean),
    [form],
  );

  usePageMetadata({
    title: 'Checkout | BleedPrints',
    description: 'Complete your BleedPrints purchase with secure Supabase-backed checkout and Razorpay payment flow.',
    path: '/checkout',
    noIndex: true,
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm((current) => ({
      ...current,
      fullName: current.fullName || profile.fullName || "",
      email: current.email || profile.email || "",
      phone: current.phone || profile.phone || "",
    }));
  }, [profile]);

  const handleFieldChange = (field: keyof CheckoutFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const validateCheckout = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please log in before placing an order.',
      });
      navigate('/auth?redirect=%2Fcheckout', { replace: true });
      return false;
    }

    if (items.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Add at least one poster before starting checkout.',
      });
      return false;
    }

    if (!supabase || !publicEnv.razorpayKeyId) {
      toast({
        title: 'Checkout is not configured',
        description: 'Add Supabase and the public Razorpay key ID before launching payments.',
      });
      return false;
    }

    const requiredFields: Array<keyof CheckoutFormState> = [
      'fullName',
      'email',
      'phone',
      'addressLine1',
      'city',
      'postalCode',
      'country',
    ];

    const missingField = requiredFields.find((field) => !form[field].trim());
    if (missingField) {
      toast({
        title: 'Missing checkout details',
        description: 'Please complete your shipping details before continuing to payment.',
      });
      return false;
    }

    return true;
  };

  const launchRazorpayCheckout = async (
    order: CreateRazorpayOrderResponse,
    successState: CheckoutSuccessState,
  ) => {
    await loadRazorpayScript();

    if (!window.Razorpay) {
      throw new Error('Razorpay checkout is unavailable in this browser.');
    }

    const razorpay = new window.Razorpay({
      key: order.keyId || publicEnv.razorpayKeyId,
      amount: order.amountSubunits,
      currency: order.currency,
      name: 'BleedPrints',
      description: 'Curated wall art purchase',
      image: '/favicon.ico',
      order_id: order.razorpayOrderId,
      prefill: {
        name: form.fullName,
        email: form.email,
        contact: form.phone,
      },
      notes: {
        bleedprints_order_number: order.orderNumber,
        delivery_method: delivery,
      },
      theme: {
        color: '#1e1a17',
      },
      modal: {
        ondismiss: () => {
          setIsSubmitting(false);
        },
      },
      handler: async (response: RazorpayCheckoutResponse) => {
        try {
          const verification = await supabase.functions.invoke<VerifyRazorpayPaymentResponse>(
            'verify-razorpay-payment',
            {
              body: {
                orderId: order.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            },
          );

          if (verification.error) {
            throw verification.error;
          }

          clearCart();
          navigate(`/order-confirmation?order=${verification.data.orderNumber}`, {
            replace: true,
            state: successState,
          });
        } catch (error) {
          console.error(error);
          const message = await getEdgeFunctionErrorMessage(
            error,
            'The payment succeeded in Razorpay, but we could not verify it in Supabase yet.',
          );
          toast({
            title: 'Payment verification failed',
            description: message,
          });
          setIsSubmitting(false);
        }
      },
    });

    razorpay.open();
  };

  const handleCheckout = async () => {
    if (!validateCheckout() || !supabase) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke<CreateRazorpayOrderResponse>(
        'create-razorpay-order',
        {
          body: {
            deliveryMethod: delivery,
            customer: {
              fullName: form.fullName,
              email: form.email,
              phone: form.phone,
              addressLine1: form.addressLine1,
              addressLine2: form.addressLine2,
              city: form.city,
              state: form.state,
              postalCode: form.postalCode,
              country: form.country,
            },
            items: items.map((item) => ({
              productSlug: item.productSlug,
              dimensionId: item.dimensionId,
              quantity: item.quantity,
              frame: item.frame,
            })),
          },
        },
      );

      if (response.error) {
        throw response.error;
      }

      const order = response.data;

      const successState: CheckoutSuccessState = {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        currencyCode: order.currency,
        customerName: form.fullName,
        deliveryLabel: delivery === 'express' ? 'Express Courier' : 'Standard Shipping',
        shippingAddressLines,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          size: item.size,
          frame: item.frame,
          lineTotal: item.price * item.quantity,
        })),
      };

      await launchRazorpayCheckout(order, successState);
    } catch (error) {
      console.error(error);
      const message = await getEdgeFunctionErrorMessage(
        error,
        'Please check your Supabase schema, Edge Functions, and Razorpay keys.',
      );
      toast({
        title: 'Unable to start payment',
        description: message,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex-1">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Secure Checkout</h1>
          {/* <p className="text-secondary font-medium">Finalize your curation for your space with Supabase-backed orders and Razorpay Checkout.</p> */}
          {/* {profile && (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary mt-3">
              Signed in as {profile.email || profile.fullName || "collector"} for account-linked order tracking
            </p>
          )} */}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-10">
            {/* Shipping */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-8">
                <MaterialIcon icon="local_shipping" className="text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Full Name</label>
                  <input value={form.fullName} onChange={handleFieldChange('fullName')} className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="Julianne Moore" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Email</label>
                  <input value={form.email} onChange={handleFieldChange('email')} className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="julianne@example.com" type="email" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Phone</label>
                  <input value={form.phone} onChange={handleFieldChange('phone')} className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="+91 98765 43210" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Street Address</label>
                  <input value={form.addressLine1} onChange={handleFieldChange('addressLine1')} className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="124 Curator's Way, Arts District" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Apartment / Landmark</label>
                  <input value={form.addressLine2} onChange={handleFieldChange('addressLine2')} className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="Suite 401, Near Museum Road" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">City</label>
                  <input value={form.city} onChange={handleFieldChange('city')} className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">State</label>
                  <input value={form.state} onChange={handleFieldChange('state')} className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="Maharashtra" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Postal Code</label>
                  <input value={form.postalCode} onChange={handleFieldChange('postalCode')} className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="400001" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Country</label>
                  <input value={form.country} onChange={handleFieldChange('country')} className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="India" />
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-8">
                <MaterialIcon icon="speed" className="text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Delivery Method</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'standard', label: 'Standard Shipping', time: '5-7 Business Days', price: formatMoney(70, currencyCode) },
                  { value: 'express', label: 'Express Courier', time: '2-3 Business Days', price: formatMoney(240, currencyCode) },
                ].map(opt => (
                  <label key={opt.value} className="relative flex cursor-pointer rounded-lg bg-surface-container-lowest p-5 outline outline-1 outline-outline-variant/20 hover:bg-surface-dim transition-colors">
                    <input
                      type="radio"
                      name="delivery"
                      value={opt.value}
                      checked={delivery === opt.value}
                      onChange={() => setDelivery(opt.value)}
                      className="mt-1 h-4 w-4 border-outline text-primary focus:ring-primary"
                    />
                    <div className="ml-4">
                      <span className="block text-sm font-bold text-on-surface">{opt.label}</span>
                      <span className="mt-1 block text-xs text-secondary">{opt.time}</span>
                      <span className="mt-2 block text-sm font-semibold text-primary">{opt.price}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-8">
                <MaterialIcon icon="payments" className="text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Payment Details</h2>
              </div>
              <div className="rounded-xl bg-surface-container-lowest p-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-bold text-on-surface">Razorpay Checkout</p>
                    <p className="text-sm text-secondary mt-1">
                      UPI, cards, netbanking, wallets, and other enabled payment methods are handled in Razorpay&apos;s hosted checkout.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary">
                    <MaterialIcon icon="lock" className="text-sm" />
                    Hosted payment flow
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {['UPI', 'Cards', 'Netbanking'].map((method) => (
                  <div key={method} className="rounded-xl bg-surface-container-lowest p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-secondary">{method}</p>
                    <p className="text-sm text-on-surface mt-2">Enabled through your Razorpay dashboard configuration.</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-surface-container-lowest p-8 rounded-xl">
              <h2 className="text-xl font-headline font-bold mb-6">Order Summary</h2>
              <div className="space-y-6 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 rounded overflow-hidden bg-surface-container flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-headline font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-secondary">{item.size} • {item.frame}</p>
                      <p className="text-xs text-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">{formatMoney(item.price * item.quantity, item.currencyCode ?? currencyCode)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/30 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-secondary">Subtotal</span><span>{formatMoney(subtotal, currencyCode)}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Estimated Tax</span><span>{formatMoney(tax, currencyCode)}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Shipping</span><span>{formatMoney(shippingCost, currencyCode)}</span></div>
              </div>
              <div className="border-t border-outline-variant/30 mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-headline font-extrabold">{formatMoney(total, currencyCode)}</span>
              </div>

              <div className="mt-6 rounded-xl bg-surface-container p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Order confidence</p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Your totals are generated from the live catalog pricing in Supabase, and payment is completed in Razorpay&apos;s hosted checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isSubmitting || items.length === 0}
                className="block w-full bg-cta-gradient text-white py-4 rounded-lg font-bold text-sm text-center mt-6 hover:opacity-90 transition-opacity uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Opening Razorpay…' : 'Pay Securely with Razorpay'}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-secondary mt-4">
                <MaterialIcon icon="lock" className="text-sm" />
                <span className="uppercase tracking-widest font-bold">Secure Supabase + Razorpay flow</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
