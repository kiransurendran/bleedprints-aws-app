import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MaterialIcon from '@/components/MaterialIcon';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/use-orders';
import { formatMoney } from '@/lib/money';
import { usePageMetadata } from '@/lib/seo';

const orderStatusCopy = {
  created: 'Order created',
  payment_pending: 'Payment pending',
  payment_authorized: 'Payment authorized',
  paid: 'Paid',
  failed: 'Payment failed',
  cancelled: 'Cancelled',
  fulfilled: 'Delivered',
} as const;

const deliveryCopy = {
  standard: 'Standard shipping',
  express: 'Express courier',
} as const;

export default function OrderHistoryPage() {
  const { profile, user } = useAuth();
  const { data: orders = [], isLoading } = useOrders(user?.id);

  usePageMetadata({
    title: 'My Orders | BleedPrints',
    description: 'View live order history, delivery details, and purchased poster line items linked to your account.',
    path: '/orders',
    noIndex: true,
  });

  const formatOrderDate = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-screen-xl mx-auto flex-1 min-h-screen">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold font-headline tracking-tighter mb-2">My Orders</h1>
          <p className="text-secondary font-medium">
            Track, manage, and review the live orders linked to {profile?.email || 'your account'}.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-secondary">
            {isLoading ? 'Loading orders…' : `Displaying ${orders.length} orders`}
          </div>
          <div className="ml-auto">
            <div className="rounded-md bg-surface-container px-4 py-2 text-sm text-on-surface-variant">
              Signed in as {profile?.fullName || profile?.email || 'collector'}
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-8">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="animate-pulse rounded-xl bg-surface-container-lowest p-8">
                <div className="h-5 w-52 rounded bg-surface-container" />
                <div className="mt-4 h-4 w-32 rounded bg-surface-container" />
                <div className="mt-8 h-28 rounded bg-surface-container" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="rounded-[1.5rem] bg-surface-container-lowest p-10 text-center shadow-sm">
            <MaterialIcon icon="inventory_2" className="mx-auto text-5xl text-outline-variant" />
            <h2 className="mt-5 text-2xl font-headline font-bold text-on-surface">
              No live orders yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-on-surface-variant">
              Orders placed while signed into this account will appear here automatically once payment is completed.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md ${
                order.status === 'cancelled' || order.status === 'failed'
                  ? 'border border-destructive/20'
                  : ''
              }`}
            >
              <div className={`p-4 md:px-8 flex flex-wrap justify-between items-center gap-4 ${
                order.status === 'cancelled' || order.status === 'failed'
                  ? 'bg-destructive/5'
                  : 'bg-surface-container'
              }`}>
                <div className="flex gap-10">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Order Placed</div>
                    <div className="text-sm font-semibold">{formatOrderDate(order.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Total</div>
                    <div className={`text-sm font-semibold ${
                      order.status === 'cancelled' || order.status === 'failed'
                        ? 'text-destructive'
                        : ''
                    }`}>
                      {formatMoney(order.totalAmount, order.currencyCode)}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Delivery</div>
                    <div className="text-sm font-semibold text-secondary">
                      {deliveryCopy[order.deliveryMethod]}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Order #{order.orderNumber}</div>
                  <div className="mt-1 text-xs font-semibold text-secondary">
                    Payment: {order.paymentStatus.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-grow space-y-8">
                    <div className="flex items-center gap-3">
                      <MaterialIcon
                        icon={
                          order.status === 'fulfilled'
                            ? 'check_circle'
                            : order.status === 'paid' || order.status === 'payment_authorized'
                              ? 'local_shipping'
                              : order.status === 'failed' || order.status === 'cancelled'
                                ? 'cancel'
                                : 'schedule'
                        }
                        filled
                        className={`text-lg ${
                          order.status === 'cancelled' || order.status === 'failed'
                            ? 'text-destructive'
                            : 'text-tertiary'
                        }`}
                      />
                      <span className={`text-lg font-bold font-headline tracking-tight ${
                        order.status === 'cancelled' || order.status === 'failed'
                          ? 'text-destructive'
                          : ''
                      }`}>
                        {orderStatusCopy[order.status]}
                      </span>
                    </div>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-6 items-start">
                        <div className="w-24 h-32 bg-surface-container-low rounded overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline-variant">
                              <MaterialIcon icon="image" className="text-3xl" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-headline font-bold text-lg mb-1">{item.title}</h3>
                          <p className="text-sm text-secondary mb-2">
                            Size: <span className="font-semibold text-on-surface">{item.dimensionLabel}</span>
                          </p>
                          <p className="text-sm text-secondary mb-2">
                            Frame: <span className="font-semibold text-on-surface">{item.frame}</span>
                          </p>
                          <div className={`font-bold ${
                            order.status === 'cancelled' || order.status === 'failed'
                              ? 'text-outline line-through'
                              : 'text-tertiary'
                          }`}>
                            {formatMoney(item.lineTotal, order.currencyCode)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 md:w-56 flex-shrink-0">
                    <div className="rounded-xl bg-surface-container-high p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
                        Ship To
                      </p>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-on-surface">
                        {[
                          order.shippingAddress.line1,
                          order.shippingAddress.line2,
                          [order.shippingAddress.city, order.shippingAddress.state]
                            .filter(Boolean)
                            .join(', '),
                          [order.shippingAddress.postalCode, order.shippingAddress.country]
                            .filter(Boolean)
                            .join(' • '),
                        ]
                          .filter(Boolean)
                          .join('\n')}
                      </p>
                    </div>
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
