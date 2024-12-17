import { RawOrder, Order, OrderStatus } from '@/types/order';

export const formatShippingAddress = (rawAddress: Record<string, unknown>) => ({
  address: String(rawAddress?.street || rawAddress?.address || ''),
  city: String(rawAddress?.city || ''),
  state: String(rawAddress?.state || ''),
  zipCode: String(rawAddress?.zipCode || '')
});

export const mapRawOrderToOrder = (rawOrder: RawOrder): Order => {
  return {
    id: rawOrder.id,
    created_at: rawOrder.created_at,
    customer_email: rawOrder.customer_email,
    product_name: rawOrder.product_name,
    total_amount: rawOrder.total_amount,
    status: rawOrder.status as OrderStatus,
    shipping_address: formatShippingAddress(rawOrder.shipping_address as Record<string, unknown>),
    design_notes: rawOrder.design_notes || undefined,
    cart_id: rawOrder.cart_id || undefined,
    image_path: rawOrder.image_path || undefined,
    order_status: rawOrder.order_status || undefined,
    price: rawOrder.price,
    shipping_cost: rawOrder.shipping_cost,
    tax_amount: rawOrder.tax_amount,
    stl_file_path: rawOrder.stl_file_path || undefined,
    tracking_number: rawOrder.tracking_number || undefined
  };
};