import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-stone mb-8">
      <Link to="/" className="hover:text-gold transition-colors">Home</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight size={14} className="text-sand" />
          {item.href ? (
            <Link to={item.href} className="hover:text-gold transition-colors">{item.label}</Link>
          ) : (
            <span className="text-charcoal">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
