export interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  product_name: string;
  total_amount: number;
  status: string;
  shipping_address: ShippingAddress;
  design_notes?: string;
  cart_id?: string;
  image_path?: string;
  order_status?: string;
  price: number;
  shipping_cost: number;
  tax_amount: number;
  stl_file_path?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}