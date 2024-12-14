import {
  Dialog,
  DialogContent,
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
import { Order, OrderStatus } from "@/types/admin";

interface OrderDetailsDialogProps {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderDetailsDialog({ order, onOpenChange, onStatusUpdate }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Status:</span>
            <div className="col-span-3">
              <Select
                value={order.status}
                onValueChange={(newStatus) => {
                  onStatusUpdate(order.id, newStatus as OrderStatus);
                }}
              >
                <SelectTrigger>
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
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Customer:</span>
            <span className="col-span-3">{order.customer_email}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Product:</span>
            <span className="col-span-3">{order.product_name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Total:</span>
            <span className="col-span-3">${order.total_amount}</span>
          </div>
          {order.shipping_address && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium">Address:</span>
              <span className="col-span-3">
                {`${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zipCode}`}
              </span>
            </div>
          )}
          {order.design_notes && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-medium">Notes:</span>
              <span className="col-span-3">{order.design_notes}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}