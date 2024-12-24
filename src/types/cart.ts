export interface CartItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_path?: string;
  cart_id: string;
  chain_color?: string;
  isRegularProduct?: boolean; // Add this property to distinguish product types
}