import { RawOrder, Order } from '@/types/order';

export const formatShippingAddress = (rawAddress: Record<string, unknown>) => ({
  address: String(rawAddress?.street || rawAddress?.address || ''),
  city: String(rawAddress?.city || ''),
  state: String(rawAddress?.state || ''),
  zipCode: String(rawAddress?.zipCode || '')
});

export const mapRawOrderToOrder = (rawOrder: RawOrder): Order => ({
  ...rawOrder,
  shipping_address: formatShippingAddress(rawOrder.shipping_address)
});