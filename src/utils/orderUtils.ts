import { RawOrder, Order, OrderStatus, ShippingAddress } from '@/types/order';
import { Json } from '@/integrations/supabase/types';

type JsonObject = { [key: string]: Json | undefined };

export const formatShippingAddress = (rawAddress: Json): ShippingAddress => {
  // Ensure rawAddress is an object and cast it to JsonObject
  const addressObj = (typeof rawAddress === 'object' && rawAddress !== null && !Array.isArray(rawAddress))
    ? rawAddress as JsonObject
    : {};

  return {
    address: String(addressObj.street || addressObj.address || ''),
    city: String(addressObj.city || ''),
    state: String(addressObj.state || ''),
    zipCode: String(addressObj.zipCode || '')
  };
};

export const mapRawOrderToOrder = (rawOrder: any): Order => {
  try {
    return {
      id: rawOrder.id,
      created_at: rawOrder.created_at,
      customer_email: rawOrder.customer_email,
      shipping_address: formatShippingAddress(rawOrder.shipping_address),
      product_name: rawOrder.product_name,
      price: rawOrder.price,
      shipping_cost: rawOrder.shipping_cost,
      tax_amount: rawOrder.tax_amount,
      total_amount: rawOrder.total_amount,
      status: rawOrder.status as OrderStatus,
      cart_id: rawOrder.cart_id,
      image_path: rawOrder.image_path,
      order_status: rawOrder.order_status,
      stl_file_path: rawOrder.stl_file_path,
      tracking_number: rawOrder.tracking_number,
      design_notes: rawOrder.design_notes,
      first_name: rawOrder.first_name,
      last_name: rawOrder.last_name
    };
  } catch (error) {
    console.error('Error mapping order:', error, rawOrder);
    throw error;
  }
};