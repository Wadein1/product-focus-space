import { Card } from "@/components/ui/card";
import { Order } from "@/types/order";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductDetailsProps {
  order: Order;
}

interface OrderImage {
  id: string;
  image_path: string;
  quantity: number;
}

export function ProductDetails({ order }: ProductDetailsProps) {
  const { data: orderImages } = useQuery({
    queryKey: ['order-images', order.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_images')
        .select('*')
        .eq('order_id', order.id);

      if (error) throw error;
      return data as OrderImage[];
    },
  });

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Product Details</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Product Name</p>
          <p className="font-medium">{order.product_name}</p>
        </div>
        
        {orderImages && orderImages.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">Product Images</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orderImages.map((image) => (
                <div key={image.id} className="border rounded-lg p-4">
                  <img
                    src={image.image_path}
                    alt={`${order.product_name} - Quantity: ${image.quantity}`}
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm text-gray-500">Quantity: {image.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        ) : order.image_path ? (
          <div>
            <p className="text-sm text-gray-500 mb-2">Product Image</p>
            <img
              src={order.image_path}
              alt={order.product_name}
              className="w-full max-w-md h-48 object-cover rounded-lg"
            />
          </div>
        ) : null}
        
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