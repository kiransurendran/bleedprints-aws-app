import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatMoney } from '@/lib/money';
import { usePageMetadata } from '@/lib/seo';

export default function CartPage() {
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const currencyCode = items[0]?.currencyCode ?? 'INR';
  const checkoutPath = user ? '/checkout' : '/auth?redirect=%2Fcheckout';

  usePageMetadata({
    title: 'Your Cart | BleedPrints',
    description: 'Review the posters in your BleedPrints cart before continuing to checkout.',
    path: '/cart',
    noIndex: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex-1">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Your Gallery Cart</h1>
          <p className="text-secondary font-body">Review your curated selection for the modern wall.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {items.map(item => (
              <div key={item.id} className="bg-surface-container-lowest p-6 flex flex-col sm:flex-row gap-6 group transition-all duration-300">
                <div className="relative overflow-hidden w-full sm:w-48 h-64 sm:h-48 rounded-lg bg-surface-container">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold font-headline text-on-surface">{item.name}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-outline hover:text-destructive transition-colors">
                        <MaterialIcon icon="delete" />
                      </button>
                    </div>
                    {item.series && <p className="text-tertiary font-semibold text-sm mt-1 mb-4">{item.series}</p>}
                    <div className="space-y-1 text-sm text-secondary font-body">
                      <p>Size: <span className="text-on-surface font-medium">{item.size}</span></p>
                      <p>Frame: <span className="text-on-surface font-medium">{item.frame}</span></p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-6 sm:mt-0">
                    <div className="flex items-center bg-surface-container-high rounded-[0.75rem] px-3 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors">
                        <MaterialIcon icon="remove" className="text-sm" />
                      </button>
                      <span className="px-4 font-medium font-body text-on-surface">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors">
                        <MaterialIcon icon="add" className="text-sm" />
                      </button>
                    </div>
                    <p className="text-xl font-bold font-headline text-on-surface">{formatMoney(item.price * item.quantity, item.currencyCode ?? currencyCode)}</p>
                  </div>
                </div>
              </div>
            ))}

            {items.length > 0 && (
              <div className="p-6 bg-secondary-container/30 rounded-xl flex gap-4 items-start">
                <MaterialIcon icon="local_shipping" className="text-secondary" />
                <div>
                  <p className="text-on-surface font-semibold text-sm">Insured Premium Shipping</p>
                  <p className="text-secondary text-xs mt-1">Your order qualifies for archival-grade packaging and insured global delivery.</p>
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-20">
                <MaterialIcon icon="shopping_cart" className="text-6xl text-outline-variant mb-4" />
                <p className="text-xl font-headline font-bold mb-2">Your cart is empty</p>
                <Link to="/" className="text-primary hover:underline">Continue browsing</Link>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-28 h-fit space-y-6">
            <div className="bg-surface-container-lowest p-8 rounded-xl">
              <h2 className="text-xl font-headline font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-secondary">Subtotal ({totalItems} items)</span><span className="font-semibold">{formatMoney(subtotal, currencyCode)}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Estimated Shipping</span><span className="text-secondary">Calculated at checkout</span></div>
                <div className="flex justify-between"><span className="text-secondary">Carbon Offset</span><span className="font-semibold">{formatMoney(0, currencyCode)}</span></div>
              </div>
              <div className="border-t border-outline-variant/30 my-6" />
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs uppercase tracking-widest text-secondary font-bold">Total</span>
                <span className="text-3xl font-headline font-extrabold">{formatMoney(subtotal, currencyCode)}</span>
              </div>
              <p className="text-[10px] text-right text-secondary mb-6">VAT included where applicable</p>

              <Link to={checkoutPath} className="block w-full bg-cta-gradient text-white py-4 rounded-lg font-bold text-sm text-center hover:opacity-90 transition-opacity mb-3">
                {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
              </Link>
              <Link
                to={checkoutPath}
                className="block w-full bg-surface-container-high text-on-surface py-4 rounded-lg font-bold text-sm text-center hover:bg-surface-dim transition-colors mb-4"
              >
                {user ? 'Continue to Payment' : 'Login Required for Payment'}
              </Link>
              <div className="flex items-center justify-center gap-2 text-xs text-secondary">
                <MaterialIcon icon="lock" className="text-sm" />
                <span>{user ? 'Secure SSL Encrypted Checkout' : 'Sign in is required before order placement'}</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Checkout Notes</h3>
              <div className="space-y-3 text-sm text-secondary">
                <p>Pricing now comes directly from the live product dimensions configured in your catalog.</p>
                <p>Shipping speed, taxes, and payment methods are finalized during secure Razorpay checkout.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
