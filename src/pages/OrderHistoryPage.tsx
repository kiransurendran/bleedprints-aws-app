import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';

const orders = [
  {
    id: 'AB-92841',
    date: 'October 14, 2023',
    total: '$245.00',
    shipTo: 'Jonathan Reed',
    status: 'delivered',
    statusLabel: 'Delivered Oct 18',
    items: [
      { name: 'The Brutalist Monolith No. 4', size: 'A2 (42.0 x 59.4 cm)', price: '$120.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtPoTOJlO9IAbbCNprkPKFlTGCBQK-PS10p6YYuOwNZdQiMK_d90oHxIKGdYV8Hb3y4dMsOxtkTGrqbgCDxUTM9Ec_p0fS1izJ9m0qCQHw3SnO9uQxg-2CxW8mo2CAlbVkJYuBjwELvwlmLos4eSA9PPXToS9hQzRrHIHz23heicWv0_LCPsm9Gn4KhItBeKIMD9YlrswfjG4jl56r43V64IAc8zzRTuBWOnM7GxCQLIbuG2zskNyMTtVRKtatAkTw7bQ0AXEqhg' },
      { name: 'Geometric Flow Study', size: 'A3 (29.7 x 42.0 cm)', price: '$125.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATh0jwkiSjf7PYQk2GGvsIcCdtJx8rYkX1jazhwjHsydnQyXdcIbrD8MKMxpsO3CaNDx4UBJUtVGnpUeytP-juFl9aCk1Jc_ycz3UrUSDk1T9AVGsKy6kVTbz_GyvSWNV3kt9rKmNoRWuvdgwvI5iOnFxXm4MNkSCMS4bKce03mYCP_aY3E1UI9d5sbEjk2H0pkDzUiaHN0ndkWwkAhVHCMhWqRwF4V-fXaDQ20twGf6uOMvD8tAMj06dp1xHU-gxJOcinMcdNmg' },
    ],
    actions: ['Track Package', 'Return or replace items', 'Write a product review'],
  },
  {
    id: 'AB-93102',
    date: 'October 28, 2023',
    total: '$85.00',
    status: 'transit',
    statusLabel: 'In Transit - Arriving Thursday',
    items: [
      { name: 'The Dessau Legacy', size: 'A4 (21.0 x 29.7 cm)', price: '$85.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-zQwo0j3zlbvs6TzhLj4jNyMCJyugjn_2oR2RcNDQpUQRx9kFiv9zB5RmNOVwIGowPXebDEFq3keHmtwq3QTivEeLTNpVILYYopSCM9opeKaZQPouCamJOkXFlOTKRX3N-vjImqTd058o8s27fmQj6ukiHb7gelsqphJTOAGCKmVfu2VDJRCOYYP0wCMzUnnVwggf9xGoku0SE62x6hiWY49oB6nZ308ugJ1Th8jPCVd6pZp_Bzzzh4r8FDEDvNk4q16vv2LCZQ' },
    ],
    actions: ['Track Package', 'Edit Delivery Instructions'],
  },
  {
    id: 'AB-91004',
    date: 'September 02, 2023',
    total: '$0.00 (Refunded)',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    items: [
      { name: 'Serene Tonalities', size: 'A2 (42.0 x 59.4 cm)', price: '$110.00', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6B1WFplu9CoUeQ6TZkWTNFjE7xEzVITxqnG6qLb7-co8kn4PulSIZfH2Li6MiGYtNl3HQventLJCbf6_PqAEOGdRr09q4ZZ-30_Jbp44yDADq8z82bRe3pnuzzpjUszWnA3e6rWKqo8-mn5UcUnEKOjn6D4wMBXUic2lLFp_kMNTiqSum8t1BmyhJCAUhBxQ3wgtPcmG77NPtJyP_TL3g506OHD3cnTycggJAkoPHAUtdRta4gK01Y71VMJZmyPfv6dK13d-hfg' },
    ],
    actions: ['View Refund Status', 'Re-order Item'],
  },
];

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-screen-xl mx-auto flex-1 min-h-screen">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter mb-2">My Orders</h1>
          <p className="text-secondary font-medium">Track, manage and rediscover your curated architectural collection.</p>
        </header>

        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-secondary">Displaying {orders.length} orders</div>
          <div className="ml-auto">
            <select className="bg-surface-container border-none rounded-md text-sm px-4 py-2 focus:ring-1 focus:ring-primary">
              <option>Last 3 months</option>
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>
        </div>

        <div className="space-y-8">
          {orders.map(order => (
            <div
              key={order.id}
              className={`bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md ${
                order.status === 'cancelled' ? 'border border-destructive/20' : ''
              }`}
            >
              {/* Order Header */}
              <div className={`p-4 md:px-8 flex flex-wrap justify-between items-center gap-4 ${
                order.status === 'cancelled' ? 'bg-destructive/5' : 'bg-surface-container'
              }`}>
                <div className="flex gap-10">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Order Placed</div>
                    <div className="text-sm font-semibold">{order.date}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Total</div>
                    <div className={`text-sm font-semibold ${order.status === 'cancelled' ? 'text-destructive' : ''}`}>{order.total}</div>
                  </div>
                  {order.shipTo && (
                    <div className="hidden sm:block">
                      <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Ship To</div>
                      <div className="text-sm font-semibold text-secondary">{order.shipTo}</div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Order #{order.id}</div>
                  <button className="text-xs font-semibold text-primary hover:underline mt-1">Order Details</button>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-grow space-y-8">
                    <div className="flex items-center gap-3">
                      <MaterialIcon
                        icon={order.status === 'delivered' ? 'check_circle' : order.status === 'transit' ? 'local_shipping' : 'cancel'}
                        filled
                        className={`text-lg ${order.status === 'cancelled' ? 'text-destructive' : 'text-tertiary'}`}
                      />
                      <span className={`text-lg font-bold font-headline tracking-tight ${order.status === 'cancelled' ? 'text-destructive' : ''}`}>
                        {order.statusLabel}
                      </span>
                    </div>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-6 items-start">
                        <div className="w-24 h-32 bg-surface-container-low rounded overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-headline font-bold text-lg mb-1">{item.name}</h3>
                          <p className="text-sm text-secondary mb-2">Size: <span className="font-semibold text-on-surface">{item.size}</span></p>
                          <div className={`font-bold ${order.status === 'cancelled' ? 'text-outline line-through' : 'text-tertiary'}`}>{item.price}</div>
                          {order.status === 'delivered' && (
                            <button className="mt-4 bg-cta-gradient text-white px-6 py-2 rounded-md text-sm font-semibold shadow-sm hover:opacity-90 transition-all flex items-center gap-2">
                              <MaterialIcon icon="replay" className="text-sm" /> Buy it again
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 md:w-56 flex-shrink-0">
                    {order.actions.map((action, i) => (
                      <button
                        key={i}
                        className={`w-full py-3 rounded-lg text-sm font-semibold transition-all ${
                          i === 0
                            ? 'bg-cta-gradient text-white hover:opacity-90'
                            : order.status === 'cancelled' && i === 1
                            ? 'bg-destructive text-white hover:opacity-90'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-dim'
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
