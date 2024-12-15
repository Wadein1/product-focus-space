import Navbar from "@/components/Navbar";
import { CartContainer } from "@/components/cart/CartContainer";

const Cart = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <CartContainer />
      </div>
    </div>
  );
};

export default Cart;