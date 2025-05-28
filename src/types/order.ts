
export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export type OrderStatus = 'received' | 'processed' | 'designed' | 'producing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  product_name: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  design_notes?: string;
  cart_id?: string;
  image_path?: string;
  order_status?: string;
  price: number;
  shipping_cost: number;
  tax_amount: number;
  stl_file_path?: string;
  tracking_number?: string;
  fundraiser_id?: string;
  variation_id?: string;
}

export interface RawOrder {
  cart_id: string | null;
  created_at: string;
  customer_email: string;
  design_notes: string | null;
  id: string;
  image_path: string | null;
  order_status: string | null;
  price: number;
  product_name: string;
  shipping_address: Record<string, unknown>;
  shipping_cost: number;
  status: string;
  stl_file_path: string | null;
  tax_amount: number;
  total_amount: number;
  tracking_number: string | null;
  fundraiser_id: string | null;
  variation_id: string | null;
}
