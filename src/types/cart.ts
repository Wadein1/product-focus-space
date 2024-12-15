export interface CartItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_path?: string;
  cart_id: string;
}