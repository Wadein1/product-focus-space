export interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  product_name: string;
  total_amount: number;
  status: string;
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  design_notes?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';