import { Card } from "@/components/ui/card";
import { Order } from "@/types/admin";

interface ProductDetailsProps {
  order: Order;
}

export function ProductDetails({ order }: ProductDetailsProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Product Details</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Product Name</p>
          <p className="font-medium">{order.product_name}</p>
        </div>
        {order.image_path && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Product Image</p>
            <img
              src={order.image_path}
              alt={order.product_name}
              className="w-full max-w-md h-48 object-cover rounded-lg"
            />
          </div>
        )}
        {order.design_notes && (
          <div>
            <p className="text-sm text-gray-500">Design Notes</p>
            <p className="font-medium">{order.design_notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}