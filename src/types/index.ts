export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  category_id: string;
  category?: Category;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  materials?: string;
  weight?: string;
  dimensions?: string;
  variant_type?: string | null;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string | null;
  color_hex?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  stock: number;
  image?: string | null;
  position: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  orders_count: number;
  total_spent: number;
  created_at: string;
}

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  recent_orders: Order[];
  revenue_by_month: { month: string; revenue: number }[];
}
