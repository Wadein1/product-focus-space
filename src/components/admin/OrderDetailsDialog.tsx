import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, OrderStatus, ShippingAddress } from "@/types/admin";
import { Card } from "@/components/ui/card";

interface OrderDetailsDialogProps {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderDetailsDialog({ order, onOpenChange, onStatusUpdate }: OrderDetailsDialogProps) {
  if (!order) return null;

  const shippingAddress = order.shipping_address as ShippingAddress;

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
          <DialogDescription>
            View and manage order information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
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
                <p className="text-sm text-gray-500">Customer Email</p>
                <p className="font-medium">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">${order.total_amount}</p>
              </div>
            </div>
          </Card>

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

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Shipping Information</h3>
            {shippingAddress && (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Street Address</p>
                  <p className="font-medium">{shippingAddress.street}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{shippingAddress.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="font-medium">{shippingAddress.state}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ZIP Code</p>
                  <p className="font-medium">{shippingAddress.zipCode}</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Order Status</h3>
            <Select
              defaultValue={order.status}
              onValueChange={(newStatus) => {
                onStatusUpdate(order.id, newStatus as OrderStatus);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}