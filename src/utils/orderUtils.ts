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

export const mapRawOrderToOrder = (rawOrder: RawOrder): Order => ({
  ...rawOrder,
  shipping_address: formatShippingAddress(rawOrder.shipping_address),
  status: rawOrder.status as OrderStatus,
  cart_id: rawOrder.cart_id || undefined,
  image_path: rawOrder.image_path || undefined,
  order_status: rawOrder.order_status || undefined,
  stl_file_path: rawOrder.stl_file_path || undefined,
  tracking_number: rawOrder.tracking_number || undefined,
  design_notes: rawOrder.design_notes || undefined
});