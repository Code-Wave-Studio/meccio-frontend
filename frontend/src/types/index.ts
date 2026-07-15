export interface User {
  id: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  avatar?: string;
}

export interface Product {
  id: number;
  uuid: string;
  sku: string;
  slug: string;
  name: string;
  short_description?: string;
  description?: string;
  brand?: string;
  material?: string;
  color?: string;
  dimensions?: string;
  care_instructions?: string;
  shipping_details?: string;
  price: number;
  price_inr?: number;
  compare_price?: number;
  compare_price_inr?: number;
  stock_quantity: number;
  rating_avg: number;
  rating_count: number;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  is_luxury?: boolean;
  etsy_enabled?: boolean | number;
  etsy_url?: string | null;
  primary_image?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  categories?: Category[];
  collections?: Collection[];
  reviews?: Review[];
  related?: Product[];
}

export interface ProductImage {
  id?: number;
  url: string;
  alt_text?: string;
  is_primary?: boolean;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  size?: string;
  color?: string;
  price_adjustment: number;
  price_adjustment_inr?: number;
  stock_quantity: number;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parent_id?: number;
}

export interface Collection {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  is_featured?: boolean;
}

export interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  unit_price: number;
  unit_price_inr?: number;
  line_total: number;
  line_total_inr?: number;
  image?: string;
  variant_name?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  subtotal_inr?: number;
  item_count: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  currency: string;
  tracking_number?: string;
  tracking_url?: string;
  courier_name?: string;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
  shipping_address?: Address;
  billing_address?: Address;
}

export interface OrderItem {
  id: number;
  product_name: string;
  product_sku: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string | null;
}

export interface Address {
  label?: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface SavedAddress extends Address {
  id: number;
  is_default?: boolean;
  created_at?: string;
}

export interface Review {
  id: number;
  author_name: string;
  rating: number;
  title?: string;
  content: string;
  is_verified?: boolean;
  created_at: string;
}

export interface Testimonial {
  id: number;
  author_name: string;
  author_title?: string;
  author_location?: string;
  author_image?: string;
  content: string;
  rating: number;
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface HomepageData {
  featured_products: Product[];
  new_arrivals: Product[];
  collections: Collection[];
  categories: Category[];
  testimonials: Testimonial[];
}
