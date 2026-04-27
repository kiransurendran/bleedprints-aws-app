import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import { formatMoney } from '@/lib/money';
import { usePageMetadata } from '@/lib/seo';
import type { CheckoutSuccessState } from '@/types/checkout';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const checkoutState = location.state as CheckoutSuccessState | null;
  const items = checkoutState
    ? checkoutState.items.map((item) => ({
        name: item.name,
        spec: `${item.size} • ${item.frame} • Qty ${item.quantity}`,
        price: item.lineTotal,
        image: item.image,
      }))
    : [];
  const hasOrderSummary = items.length > 0;
  const currencyCode = checkoutState?.currencyCode ?? 'USD';
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const orderNumber = checkoutState?.orderNumber ?? searchParams.get('order') ?? '';
  const asideArtwork = items[0]?.image ?? null;

  usePageMetadata({
    title: `Order Confirmation${orderNumber ? ` | ${orderNumber}` : ''} | BleedPrints`,
    description: 'Review your order confirmation, shipping details, and purchased poster summary.',
    path: '/order-confirmation',
    noIndex: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-screen-xl mx-auto flex-1">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center mb-6 shadow-sm">
            <MaterialIcon icon="check_circle" filled className="text-4xl text-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-on-surface">Thank You for Your Order</h1>
          <p className="text-secondary font-body max-w-lg mx-auto leading-relaxed">
            Your order
            {orderNumber ? (
              <>
                {' '}
                <span className="font-bold text-on-surface">#{orderNumber}</span>
              </>
            ) : null}{' '}
            has been placed successfully.{' '}
            {hasOrderSummary
              ? "We've sent a confirmation email to your inbox."
              : 'Open your account to review the live order details once your checkout session is no longer in memory.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            {/* Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-surface-container-highest rounded-xl overflow-hidden shadow-sm">
              <div className="bg-surface-container-lowest p-8">
                <div className="flex items-center gap-3 mb-4 text-secondary">
                  <MaterialIcon icon="local_shipping" />
                  <span className="text-xs font-bold uppercase tracking-widest">Estimated Delivery</span>
                </div>
                <p className="text-xl font-headline font-bold text-on-surface">
                  {hasOrderSummary ? 'Within 5 to 7 business days' : 'Preparing your shipment timeline'}
                </p>
                <p className="text-sm text-secondary mt-1">
                  {checkoutState?.deliveryLabel ?? 'Order delivery details will appear in your account after payment verification.'}
                </p>
              </div>
              <div className="bg-surface-container-lowest p-8">
                <div className="flex items-center gap-3 mb-4 text-secondary">
                  <MaterialIcon icon="location_on" />
                  <span className="text-xs font-bold uppercase tracking-widest">Shipping Address</span>
                </div>
                <p className="text-on-surface font-medium leading-relaxed">
                  {checkoutState?.shippingAddressLines?.length
                    ? checkoutState.shippingAddressLines.map((line) => (
                        <span key={line}>
                          {line}
                          <br />
                        </span>
                      ))
                    : (
                      <span className="text-sm text-secondary">
                        Open your account to view the saved delivery address for this order.
                      </span>
                    )}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-headline font-bold mb-8 flex items-center gap-3">
                Order Summary
                <span className="px-2 py-0.5 bg-surface-container text-[10px] font-bold rounded-full text-secondary uppercase tracking-tighter">
                  {hasOrderSummary ? `${items.length} Items` : 'Awaiting sync'}
                </span>
              </h2>
              {hasOrderSummary ? (
                <>
                  <div className="space-y-8">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-6 items-center">
                        <div className="w-24 h-32 bg-surface-container-low rounded overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-headline font-bold text-on-surface">{item.name}</h3>
                          <p className="text-sm text-secondary mb-2">{item.spec}</p>
                          <p className="font-bold text-on-surface">{formatMoney(item.price, currencyCode)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-outline-variant/30 mt-8 pt-6 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-secondary">Subtotal</span><span>{formatMoney(subtotal, currencyCode)}</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Shipping</span><span className="text-tertiary font-semibold">Included in checkout</span></div>
                    <div className="flex justify-between"><span className="text-secondary">Estimated Tax</span><span>{formatMoney(0, currencyCode)}</span></div>
                  </div>
                  <div className="border-t border-outline-variant/30 mt-4 pt-4 flex justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-2xl font-headline font-extrabold">{formatMoney(subtotal, currencyCode)}</span>
                  </div>
                </>
              ) : (
                <div className="rounded-xl bg-surface-container p-6 text-sm leading-7 text-on-surface-variant">
                  This page no longer shows static placeholder order items. If you refreshed after checkout or opened the confirmation link directly, use your account order history to review the saved order details and payment status.
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-1 text-secondary">
                <MaterialIcon icon="credit_card" />
                <span className="text-xs font-bold uppercase tracking-widest">Payment Method</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <MaterialIcon icon="credit_card" className="text-primary" />
                <div>
                  <p className="font-semibold text-sm">Razorpay Checkout</p>
                  <p className="text-xs text-secondary">Card, UPI, wallets, and netbanking supported</p>
                </div>
              </div>
            </div>

            <Link to="/orders" className="block w-full bg-cta-gradient text-white py-4 rounded-lg font-bold text-sm text-center hover:opacity-90 transition-opacity">
              Track My Order
            </Link>
            <Link
              to="/account"
              className="block w-full bg-surface-container-highest text-on-surface py-4 rounded-lg font-bold text-sm text-center hover:bg-surface-dim transition-colors"
            >
              View Account
            </Link>
            <Link to="/" className="block text-center text-sm font-semibold text-primary hover:underline">
              Continue Shopping
            </Link>

            <div className="bg-surface-container-low p-6 rounded-xl">
              <h3 className="font-bold text-sm mb-2">Need Help?</h3>
              <p className="text-xs text-secondary mb-3">If you have questions about your order or our delivery process, our team is here to assist you.</p>
              <Link to="/support" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                Contact Support <MaterialIcon icon="arrow_forward" className="text-sm" />
              </Link>
            </div>

            <div className="relative h-48 overflow-hidden rounded-xl bg-black">
              {asideArtwork ? (
                <img
                  src={asideArtwork}
                  alt="Recently ordered artwork"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,_#1a1a1a,_#622f2f_52%,_#cf8a4b)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-6">
                <h3 className="font-headline font-bold text-white text-lg">Keep Curating Your Walls</h3>
                <p className="text-white/80 text-xs mb-3">Explore the editorial series and live catalog while this order moves through production.</p>
                <Link
                  to="/series/summer-solstice"
                  className="bg-white text-on-surface px-4 py-2 rounded text-xs font-bold w-fit hover:bg-surface-dim transition-colors"
                >
                  VIEW SERIES
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
