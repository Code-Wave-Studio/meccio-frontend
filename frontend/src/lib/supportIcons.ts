import {
  AlertCircle,
  Bed,
  CheckCircle2,
  Globe,
  Mail,
  Package,
  PackageX,
  Shield,
  Sofa,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  sofa: Sofa,
  bed: Bed,
  utensils: UtensilsCrossed,
  package: Package,
  shield: Shield,
  truck: Truck,
  globe: Globe,
  check: CheckCircle2,
  'package-x': PackageX,
  alert: AlertCircle,
  mail: Mail,
};

export function getSupportIcon(name?: string): LucideIcon {
  return ICON_MAP[name ?? ''] ?? Package;
}
