export const ORDER_STATUS_STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
] as const;

export function orderStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function orderStatusClass(status: string): string {
  switch (status) {
    case 'delivered':
      return 'bg-sage/15 text-sage border-sage/30';
    case 'shipped':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'processing':
    case 'confirmed':
      return 'bg-gold/15 text-gold-dark border-gold/30';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-ivory text-stone border-sand/50';
  }
}

export function paymentStatusClass(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-sage/15 text-sage border-sage/30';
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-ivory text-stone border-sand/50';
  }
}
