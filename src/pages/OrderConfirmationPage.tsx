import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';

const orderItems = [
  { name: 'The Bauhaus Series: No. 04', spec: '24" x 36" • Oak Frame', price: 185.00, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-zQwo0j3zlbvs6TzhLj4jNyMCJyugjn_2oR2RcNDQpUQRx9kFiv9zB5RmNOVwIGowPXebDEFq3keHmtwq3QTivEeLTNpVILYYopSCM9opeKaZQPouCamJOkXFlOTKRX3N-vjImqTd058o8s27fmQj6ukiHb7gelsqphJTOAGCKmVfu2VDJRCOYYP0wCMzUnnVwggf9xGoku0SE62x6hiWY49oB6nZ308ugJ1Th8jPCVd6pZp_Bzzzh4r8FDEDvNk4q16vv2LCZQ' },
  { name: 'Midnight Botanicals', spec: '18" x 24" • Black Aluminum Frame', price: 120.00, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfJwFSyV7eJI9bHZfHLASpeSHB6gibpsmEX9gyI289Gy82pdcY0vqP58Da1ZyNorqIjTVa-zPaG9kefZVz9fkQXQ2-SRTwuRBcsl8z5UM1gc4y6TZ_kMuFE1uTdLlR9CoIkfRCLioNid7-Vv_oOl7O-kj5uUPPp-cObDzP0uP8j86HY0DWFqfzJmemrNfHEHk1CfQuJX8ZPMc8QrUZqMabA-cwDvvuQP367kL_a0WIiND045q79kidyp7xinzfEdbCcmITRPzBcQ' },
  { name: 'Structure 09: Concrete Echoes', spec: '18" x 24" • Unframed Print', price: 65.00, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwvLxxCtZi21YHV0UdN77kkqM35tqpARwXkHtGBUl19Zg6w2KqFjcGPdfMCKSVuzF8q8SGwk_vklI0iGfIE-6FaL8AABag62ANvlodEDgtu3Okq3cpXfNP5_rhOQA9YUohNLfVrv0jZNlsCj_P_AXHJxKJImoSF-s9gOPabd8D45UJretpkgzBLyphF9AItxd1dmf4eQ5IgZLnGBcRPCPqmhIhdnXd' },
];

export default function OrderConfirmationPage() {
  const subtotal = orderItems.reduce((s, i) => s + i.price, 0);

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
            Your order <span className="font-bold text-on-surface">#ORD-77291</span> has been placed successfully. We've sent a confirmation email to your inbox.
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
                <p className="text-xl font-headline font-bold text-on-surface">Oct 24 - Oct 27, 2024</p>
                <p className="text-sm text-secondary mt-1">Standard Architectural Shipping</p>
              </div>
              <div className="bg-surface-container-lowest p-8">
                <div className="flex items-center gap-3 mb-4 text-secondary">
                  <MaterialIcon icon="location_on" />
                  <span className="text-xs font-bold uppercase tracking-widest">Shipping Address</span>
                </div>
                <p className="text-on-surface font-medium leading-relaxed">
                  Julianne V. Sterling<br />
                  882 Brutalist Ave, Suite 401<br />
                  New York, NY 10013
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-headline font-bold mb-8 flex items-center gap-3">
                Order Summary
                <span className="px-2 py-0.5 bg-surface-container text-[10px] font-bold rounded-full text-secondary uppercase tracking-tighter">3 Items</span>
              </h2>
              <div className="space-y-8">
                {orderItems.map((item, i) => (
                  <div key={i} className="flex gap-6 items-center">
                    <div className="w-24 h-32 bg-surface-container-low rounded overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-headline font-bold text-on-surface">{item.name}</h3>
                      <p className="text-sm text-secondary mb-2">{item.spec}</p>
                      <p className="font-bold text-on-surface">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/30 mt-8 pt-6 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-secondary">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-secondary">Shipping</span><span className="text-tertiary font-semibold">Free</span></div>
                <div className="flex justify-between"><span className="text-secondary">Estimated Tax</span><span>${(subtotal * 0.085).toFixed(2)}</span></div>
              </div>
              <div className="border-t border-outline-variant/30 mt-4 pt-4 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="text-2xl font-headline font-extrabold">${(subtotal + subtotal * 0.085).toFixed(2)}</span>
              </div>
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
                  <p className="font-semibold text-sm">Visa ending in 4492</p>
                  <p className="text-xs text-secondary">Expires 12/26</p>
                </div>
              </div>
            </div>

            <Link to="/orders" className="block w-full bg-cta-gradient text-white py-4 rounded-lg font-bold text-sm text-center hover:opacity-90 transition-opacity">
              Track My Order
            </Link>
            <button className="w-full bg-surface-container-highest text-on-surface py-4 rounded-lg font-bold text-sm hover:bg-surface-dim transition-colors">
              View Full Details
            </button>
            <Link to="/" className="block text-center text-sm font-semibold text-primary hover:underline">
              Continue Shopping
            </Link>

            <div className="bg-surface-container-low p-6 rounded-xl">
              <h3 className="font-bold text-sm mb-2">Need Help?</h3>
              <p className="text-xs text-secondary mb-3">If you have questions about your order or our delivery process, our team is here to assist you.</p>
              <a href="#" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                Contact Support <MaterialIcon icon="arrow_forward" className="text-sm" />
              </a>
            </div>

            <div className="relative rounded-xl overflow-hidden h-48">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCizPB8qtm98KvT2YfKVVQz7iJ0riV5gKgDkVxm3H4phYTgvL3mBBsyH0FtjOAlGNufmnrZmKW8mCMgBtv2SsjvfsocknhwkGrxYDKG_nzw8h_NDQcXJODTKlqSLnFyWGAy1whQONP0GsilDTnFP4h0KM2ewxMMyPmcYCOjRZf0UB-Z8dRFL3e2-xn5FjtseCuxArE48l4ymKgKzrVsVS53ekPciZK1pEt9tjQTwX4Tx4FhrOeOw5w44PNww21FIAmILNhXH5tmGg"
                alt="Join the Collective"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="font-headline font-bold text-white text-lg">Join the Collective</h3>
                <p className="text-white/80 text-xs mb-3">Get early access to exclusive drops and artist collaborations.</p>
                <button className="bg-white text-on-surface px-4 py-2 rounded text-xs font-bold w-fit hover:bg-surface-dim transition-colors">SIGN UP</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
