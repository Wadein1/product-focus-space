import { Card } from "@/components/ui/card";
import { Order } from "@/types/order";

interface OrderInformationProps {
  order: Order;
}

export function OrderInformation({ order }: OrderInformationProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Order Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="font-medium">{order.id.slice(0, 8)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-medium">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Customer Name</p>
          <p className="font-medium">
            {order.first_name && order.last_name 
              ? `${order.first_name} ${order.last_name}`
              : 'Not provided'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Customer Email</p>
          <p className="font-medium">{order.customer_email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="font-medium">${order.total_amount}</p>
        </div>
      </div>
    </Card>
  );
}