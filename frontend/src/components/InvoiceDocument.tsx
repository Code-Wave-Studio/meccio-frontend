import { Printer, X } from 'lucide-react';
import { formatInr, formatUsd } from '@/lib/currency';
import { formatDate } from '@/lib/utils';

export type InvoiceData = {
  invoice_number?: string | null;
  order_number?: string | null;
  issued_at?: string;
  currency?: string;
  payment_status?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  coupon_code?: string | null;
  items: Array<{
    id?: number;
    product_name: string;
    product_sku?: string;
    variant_name?: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  shipping_address?: Record<string, string>;
  billing_address?: Record<string, string>;
  payment?: {
    transaction_id?: string | null;
    razorpay_order_id?: string | null;
    method?: string;
    status?: string;
    paid_at?: string | null;
    amount?: number;
  };
  company?: {
    name?: string;
    legal_name?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    email?: string;
    phone?: string;
    gstin?: string;
    pan?: string;
    footer_note?: string;
    bank_details?: string;
  };
};

function money(n: number, currency?: string) {
  return currency === 'INR' ? formatInr(n) : formatUsd(n);
}

function addrLines(addr?: Record<string, string>) {
  if (!addr) return [];
  return [
    [addr.first_name, addr.last_name].filter(Boolean).join(' '),
    addr.address_line1,
    addr.address_line2,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', '),
    addr.country,
    addr.phone ? `Phone: ${addr.phone}` : '',
  ].filter(Boolean);
}

interface InvoiceDocumentProps {
  invoice: InvoiceData;
  onClose?: () => void;
  printable?: boolean;
}

export default function InvoiceDocument({ invoice, onClose, printable = true }: InvoiceDocumentProps) {
  const company = invoice.company || {};
  const companyLoc = [company.city, company.state, company.postal_code].filter(Boolean).join(', ');

  return (
    <div className="invoice-root bg-white text-charcoal">
      {printable && (
        <div className="flex items-center justify-between gap-3 mb-6 print:hidden">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-stone">Tax Invoice</p>
            <p className="font-display text-xl mt-1">{invoice.invoice_number || invoice.order_number}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-cream text-xs uppercase tracking-wider"
            >
              <Printer size={14} /> Print / PDF
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center w-10 h-10 border border-sand/40 text-stone"
                aria-label="Close invoice"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="border border-sand/40 p-6 sm:p-8 md:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
          <div>
            <p className="font-display text-3xl tracking-wide text-charcoal">{company.name || 'MECCIO'}</p>
            {company.legal_name && company.legal_name !== company.name && (
              <p className="text-sm text-stone mt-1">{company.legal_name}</p>
            )}
            <div className="mt-3 text-sm text-stone leading-relaxed space-y-0.5">
              {company.address && <p>{company.address}</p>}
              {companyLoc && <p>{companyLoc}</p>}
              {company.country && <p>{company.country}</p>}
              {company.gstin && <p>GSTIN: {company.gstin}</p>}
              {company.pan && <p>PAN: {company.pan}</p>}
              {company.email && <p>{company.email}</p>}
              {company.phone && <p>{company.phone}</p>}
            </div>
          </div>
          <div className="sm:text-right space-y-2 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-stone">Invoice</p>
              <p className="font-medium text-base">{invoice.invoice_number || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-stone">Order</p>
              <p className="font-medium">{invoice.order_number}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-stone">Date</p>
              <p>{invoice.issued_at ? formatDate(invoice.issued_at) : '—'}</p>
            </div>
            {invoice.payment?.transaction_id && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-stone">Transaction</p>
                <p className="font-mono text-xs break-all max-w-[220px] sm:ml-auto">
                  {invoice.payment.transaction_id}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-sand/30">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Bill to</p>
            <div className="text-sm leading-relaxed">
              {addrLines(invoice.billing_address || invoice.shipping_address).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Ship to</p>
            <div className="text-sm leading-relaxed">
              {addrLines(invoice.shipping_address).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/20 text-left text-[11px] uppercase tracking-[0.1em] text-stone">
                <th className="py-3 pr-3 font-medium">Item</th>
                <th className="py-3 px-3 font-medium text-center">Qty</th>
                <th className="py-3 px-3 font-medium text-right">Unit</th>
                <th className="py-3 pl-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id ?? i} className="border-b border-sand/30">
                  <td className="py-4 pr-3">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-stone mt-0.5">
                      {[item.product_sku, item.variant_name].filter(Boolean).join(' · ')}
                    </p>
                  </td>
                  <td className="py-4 px-3 text-center">{item.quantity}</td>
                  <td className="py-4 px-3 text-right whitespace-nowrap">
                    {money(item.unit_price, invoice.currency)}
                  </td>
                  <td className="py-4 pl-3 text-right whitespace-nowrap font-medium">
                    {money(item.total_price, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone">Subtotal</span>
              <span>{money(invoice.subtotal, invoice.currency)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-sage">
                <span>Discount{invoice.coupon_code ? ` (${invoice.coupon_code})` : ''}</span>
                <span>-{money(invoice.discount_amount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone">Shipping</span>
              <span>
                {invoice.shipping_amount === 0
                  ? 'Free'
                  : money(invoice.shipping_amount, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone">Tax</span>
              <span>{money(invoice.tax_amount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-charcoal/20 font-medium text-base">
              <span>Total Paid</span>
              <span>{money(invoice.total, invoice.currency)}</span>
            </div>
            <p className="text-xs text-stone pt-1 capitalize">
              Payment: {invoice.payment?.method || 'razorpay'} · {invoice.payment_status || 'paid'}
            </p>
          </div>
        </div>

        {company.bank_details && (
          <div className="pt-4 border-t border-sand/30 text-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Bank details</p>
            <p className="whitespace-pre-wrap text-stone leading-relaxed">{company.bank_details}</p>
          </div>
        )}

        {company.footer_note && (
          <p className="text-xs text-stone leading-relaxed pt-2 border-t border-sand/30">
            {company.footer_note}
          </p>
        )}
      </div>
    </div>
  );
}
