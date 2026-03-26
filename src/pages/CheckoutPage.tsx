import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [delivery, setDelivery] = useState('standard');
  const [paymentTab, setPaymentTab] = useState('card');
  const shippingCost = delivery === 'express' ? 24.00 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex-1">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Secure Checkout</h1>
          <p className="text-secondary font-medium">Finalize your curation for your space.</p>
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
                  <input className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="Julianne Moore" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Street Address</label>
                  <input className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="124 Curator's Way, Arts District" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">City</label>
                  <input className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Postal Code</label>
                  <input className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="10001" />
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
                  { value: 'standard', label: 'Standard Shipping', time: '5-7 Business Days', price: 'Free' },
                  { value: 'express', label: 'Express Courier', time: '2-3 Business Days', price: '$24.00' },
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
              <div className="flex space-x-4 mb-8 p-1 bg-surface-container-highest rounded-lg w-fit">
                <button onClick={() => setPaymentTab('card')} className={`px-6 py-2 rounded-md text-sm font-bold ${paymentTab === 'card' ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-secondary hover:text-on-surface'}`}>Credit Card</button>
                <button onClick={() => setPaymentTab('upi')} className={`px-6 py-2 rounded-md text-sm font-medium ${paymentTab === 'upi' ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-secondary hover:text-on-surface'}`}>UPI / Digital</button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Card Number</label>
                  <div className="relative">
                    <input className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="0000 0000 0000 0000" />
                    <MaterialIcon icon="credit_card" className="absolute right-4 top-3 text-outline" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">Expiry Date</label>
                    <input className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="MM / YY" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 ml-1">CVC</label>
                    <input className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50" placeholder="123" />
                  </div>
                </div>
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
                    <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/30 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-secondary">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Estimated Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Shipping</span><span className={shippingCost === 0 ? 'text-tertiary' : ''}>{shippingCost === 0 ? 'Calculated at next step' : `$${shippingCost.toFixed(2)}`}</span></div>
              </div>
              <div className="border-t border-outline-variant/30 mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-headline font-extrabold">${total.toFixed(2)}</span>
              </div>

              <div className="mt-6 flex gap-2">
                <input className="flex-1 bg-surface-container-highest border-none rounded-sm px-4 py-2 text-sm focus:ring-1 focus:ring-primary placeholder:text-outline/50" placeholder="Promo Code" />
                <button className="text-sm font-bold uppercase tracking-widest text-primary hover:underline px-2">Apply</button>
              </div>

              <Link to="/order-confirmation" className="block w-full bg-cta-gradient text-white py-4 rounded-lg font-bold text-sm text-center mt-6 hover:opacity-90 transition-opacity uppercase tracking-wider">
                Place Order
              </Link>
              <div className="flex items-center justify-center gap-2 text-xs text-secondary mt-4">
                <MaterialIcon icon="lock" className="text-sm" />
                <span className="uppercase tracking-widest font-bold">Secure Encrypted Transaction</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
