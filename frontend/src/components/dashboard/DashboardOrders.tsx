import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Package } from 'lucide-react';
import { orderApi, resolveMediaUrl } from '@/lib/api';
import { formatInr, formatUsd } from '@/lib/currency';
import { ORDER_STATUS_STEPS, orderStatusClass, orderStatusLabel, paymentStatusClass } from '@/lib/orderStatus';
import { cn, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

function formatOrderTotal(total: number, currency?: string) {
  return currency === 'INR' ? formatInr(total) : formatUsd(total);
}

function OrderDetailPanel({ orderNumber }: { orderNumber: string }) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => orderApi.get(orderNumber).then((r) => r.data.data as Order),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    );
  }

  if (!order) return null;

  const currentStep = ORDER_STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="border-t border-sand/40 bg-ivory/40 p-4 sm:p-5 md:p-6 space-y-5 sm:space-y-6">
      <div className="flex flex-wrap gap-2">
        <span className={`text-[10px] sm:text-xs uppercase tracking-[0.1em] px-2.5 py-1 border ${orderStatusClass(order.status)}`}>
          {orderStatusLabel(order.status)}
        </span>
        <span className={`text-[10px] sm:text-xs uppercase tracking-[0.1em] px-2.5 py-1 border ${paymentStatusClass(order.payment_status)}`}>
          Payment: {orderStatusLabel(order.payment_status)}
        </span>
        {order.payment_method && (
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.1em] px-2.5 py-1 border border-sand/40 bg-white text-stone">
            {order.payment_method}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        {ORDER_STATUS_STEPS.map((step, index) => (
          <div
            key={step.key}
            className={cn(
              'text-center p-2 sm:p-3 border text-[9px] sm:text-xs uppercase tracking-[0.06em] sm:tracking-[0.08em]',
              index <= currentStep ? 'bg-charcoal text-cream border-charcoal' : 'bg-white text-stone border-sand/40',
            )}
          >
            {step.label}
          </div>
        ))}
      </div>

      {(order.tracking_number || order.courier_name) && (
        <div className="bg-white border border-sand/30 p-4 text-sm space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-stone mb-2">Courier Tracking</p>
          {order.courier_name && (
            <p><span className="text-stone">Courier:</span> <span className="font-medium">{order.courier_name}</span></p>
          )}
          {order.tracking_number && (
            <p><span className="text-stone">AWB / Tracking No.:</span> <span className="font-medium break-all">{order.tracking_number}</span></p>
          )}
          {order.tracking_url && (
            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:underline inline-flex items-center gap-1 mt-1">
              Track shipment <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {order.items && order.items.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-[0.14em] text-stone mb-3">Items Ordered</h4>
          <div className="space-y-3">
            {order.items.map((item) => {
              const img = item.product_image ? resolveMediaUrl(item.product_image) : null;
              return (
                <div key={item.id} className="flex gap-3 sm:gap-4 text-sm bg-white border border-sand/30 p-3 sm:p-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-ivory border border-sand/30 overflow-hidden">
                    {img ? (
                      <img src={img} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} className="text-sand" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-charcoal text-sm line-clamp-2">{item.product_name}</p>
                    <p className="text-stone text-xs mt-1">SKU: {item.product_sku}</p>
                    {item.variant_name && <p className="text-stone text-xs mt-0.5">Size: {item.variant_name}</p>}
                    <p className="text-stone text-xs mt-1">
                      Qty: {item.quantity} × {formatOrderTotal(item.unit_price, order.currency)}
                    </p>
                  </div>
                  <p className="font-medium shrink-0 text-sm self-start">
                    {formatOrderTotal(item.total_price, order.currency)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.shipping_address && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs uppercase tracking-[0.14em] text-stone mb-3">Shipping Address</h4>
            <address className="not-italic text-sm text-charcoal leading-relaxed">
              {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
              {order.shipping_address.address_line1}<br />
              {order.shipping_address.address_line2 && <>{order.shipping_address.address_line2}<br /></>}
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
              {order.shipping_address.country}
              {order.shipping_address.phone && <><br />Phone: {order.shipping_address.phone}</>}
            </address>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.14em] text-stone mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatOrderTotal(order.subtotal, order.currency)}</span></div>
              <div className="flex justify-between"><span className="text-stone">Shipping</span><span>{order.shipping_amount === 0 ? 'Free' : formatOrderTotal(order.shipping_amount, order.currency)}</span></div>
              <div className="flex justify-between"><span className="text-stone">Tax</span><span>{formatOrderTotal(order.tax_amount, order.currency)}</span></div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sage"><span>Discount</span><span>-{formatOrderTotal(order.discount_amount, order.currency)}</span></div>
              )}
              <div className="flex justify-between font-medium pt-2 border-t border-sand/40">
                <span>Total</span><span>{formatOrderTotal(order.total, order.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {order.notes && (
        <div>
          <h4 className="text-xs uppercase tracking-[0.14em] text-stone mb-2">Order Notes</h4>
          <p className="text-sm text-charcoal whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}

      <Link
        to={`/order-tracking?order=${order.order_number}`}
        className="inline-flex text-sm text-gold-dark hover:underline"
      >
        Open full tracking page
      </Link>
    </div>
  );
}

interface DashboardOrdersProps {
  orders: Order[];
  isLoading: boolean;
}

export default function DashboardOrders({ orders, isLoading }: DashboardOrdersProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-sand/40">
      <div className="p-4 sm:p-6 md:p-8 border-b border-sand/40">
        <h2 className="font-display text-xl sm:text-2xl text-charcoal">Your Orders</h2>
        <p className="text-xs sm:text-sm text-stone mt-1">{orders.length} order{orders.length === 1 ? '' : 's'} on your account</p>
      </div>

      {!orders.length ? (
        <div className="text-center py-12 sm:py-16 px-5">
          <Package size={40} className="mx-auto mb-4 text-sand" />
          <p className="font-display text-lg sm:text-xl mb-3">No orders yet</p>
          <p className="text-stone text-sm mb-6">When you place an order, it will appear here with full details and tracking.</p>
          <Link to="/shop" className="btn-primary">Browse Collection</Link>
        </div>
      ) : (
        <div className="divide-y divide-sand/30">
          {orders.map((order) => {
            const isOpen = expanded === order.order_number;
            return (
              <div key={order.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : order.order_number)}
                  className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 md:px-8 hover:bg-ivory/30 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal text-sm sm:text-base truncate">{order.order_number}</p>
                    <p className="text-xs sm:text-sm text-stone mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <span className={`text-[10px] sm:text-xs uppercase tracking-[0.1em] px-2 py-1 border ${orderStatusClass(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                    <p className="font-medium text-sm sm:text-base min-w-[4.5rem] text-right">
                      {formatOrderTotal(order.total, order.currency)}
                    </p>
                    {isOpen ? <ChevronUp size={18} className="text-stone shrink-0" /> : <ChevronDown size={18} className="text-stone shrink-0" />}
                  </div>
                </button>
                {isOpen && <OrderDetailPanel orderNumber={order.order_number} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
