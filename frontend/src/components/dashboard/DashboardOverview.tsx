import { Link } from 'react-router-dom';
import { ArrowRight, Heart, MapPin, Package, ShoppingBag } from 'lucide-react';
import { formatInr, formatUsd } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { orderStatusClass, orderStatusLabel } from '@/lib/orderStatus';
import type { Order } from '@/types';
import type { DashboardTab } from './DashboardShell';

interface DashboardOverviewProps {
  orders: Order[];
  wishlistCount: number;
  addressCount: number;
  cartCount: number;
  onTabChange: (tab: DashboardTab) => void;
}

function formatOrderTotal(total: number, currency?: string) {
  return currency === 'INR' ? formatInr(total) : formatUsd(total);
}

export default function DashboardOverview({
  orders,
  wishlistCount,
  addressCount,
  cartCount,
  onTabChange,
}: DashboardOverviewProps) {
  const recentOrders = orders.slice(0, 3);

  const stats: Array<
    | { label: string; value: number; icon: typeof Package; tab: DashboardTab }
    | { label: string; value: number; icon: typeof ShoppingBag; href: string }
  > = [
    { label: 'Orders', value: orders.length, icon: Package, tab: 'orders' },
    { label: 'Wishlist', value: wishlistCount, icon: Heart, tab: 'wishlist' },
    { label: 'Addresses', value: addressCount, icon: MapPin, tab: 'addresses' },
    { label: 'Cart Items', value: cartCount, icon: ShoppingBag, href: '/cart' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className="bg-white border border-sand/40 p-4 sm:p-5 md:p-6 hover:border-gold/50 transition-colors h-full">
              <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-ivory flex items-center justify-center text-gold-dark shrink-0">
                  <Icon size={16} />
                </div>
                <span className="font-display text-2xl sm:text-3xl text-charcoal leading-none">{stat.value}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone uppercase tracking-[0.12em]">{stat.label}</p>
            </div>
          );

          if ('href' in stat) {
            return (
              <Link key={stat.label} to={stat.href} className="block">
                {content}
              </Link>
            );
          }

          return (
            <button
              key={stat.label}
              type="button"
              onClick={() => onTabChange(stat.tab)}
              className="text-left w-full"
            >
              {content}
            </button>
          );
        })}
      </div>

      <section className="bg-white border border-sand/40 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <h2 className="font-display text-xl sm:text-2xl text-charcoal">Recent Orders</h2>
          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => onTabChange('orders')}
              className="text-xs sm:text-sm text-gold-dark hover:underline inline-flex items-center gap-1 shrink-0"
            >
              View all <ArrowRight size={14} />
            </button>
          )}
        </div>

        {recentOrders.length ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => onTabChange('orders')}
                className="w-full flex flex-col xs:flex-row sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:p-4 border border-sand/30 hover:border-gold/40 transition-colors text-left"
              >
                <div className="min-w-0">
                  <p className="font-medium text-charcoal text-sm sm:text-base truncate">{order.order_number}</p>
                  <p className="text-xs sm:text-sm text-stone mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className={`text-[10px] sm:text-xs uppercase tracking-[0.1em] px-2 py-1 border ${orderStatusClass(order.status)}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                  <p className="font-medium text-sm sm:text-base shrink-0">
                    {formatOrderTotal(order.total, order.currency)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 sm:py-12">
            <Package size={36} className="mx-auto mb-4 text-sand" />
            <p className="text-stone mb-5 text-sm sm:text-base">You haven&apos;t placed any orders yet.</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        )}
      </section>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-charcoal to-espresso text-cream p-5 sm:p-6 md:p-8">
          <p className="luxury-subheading text-gold-light mb-2">Need Help?</p>
          <h3 className="font-display text-xl sm:text-2xl mb-2 sm:mb-3">Track your order</h3>
          <p className="text-cream/70 text-sm mb-5 sm:mb-6 leading-relaxed">
            View order details, shipping updates, and returns from your orders tab.
          </p>
          <button
            type="button"
            onClick={() => onTabChange('orders')}
            className="btn-outline border-cream/30 text-cream hover:bg-cream hover:text-charcoal text-xs"
          >
            Go to Orders
          </button>
        </div>

        <div className="bg-white border border-sand/40 p-5 sm:p-6 md:p-8">
          <p className="luxury-subheading mb-2">Saved Details</p>
          <h3 className="font-display text-xl sm:text-2xl text-charcoal mb-2 sm:mb-3">Faster checkout</h3>
          <p className="text-stone text-sm mb-5 sm:mb-6 leading-relaxed">
            {addressCount > 0
              ? `You have ${addressCount} saved address${addressCount === 1 ? '' : 'es'} ready for checkout.`
              : 'Add a shipping address to speed up your next order.'}
          </p>
          <button type="button" onClick={() => onTabChange('addresses')} className="btn-outline text-xs">
            Manage Addresses
          </button>
        </div>
      </div>
    </div>
  );
}
