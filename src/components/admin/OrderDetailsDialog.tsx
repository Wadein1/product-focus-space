import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Order, OrderStatus } from "@/types/order";
import { OrderInformation } from "./order-details/OrderInformation";
import { ProductDetails } from "./order-details/ProductDetails";
import { ShippingInformation } from "./order-details/ShippingInformation";
import { OrderStatusSection } from "./order-details/OrderStatus";

interface OrderDetailsDialogProps {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderDetailsDialog({ 
  order, 
  onOpenChange, 
  onStatusUpdate 
}: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
          <DialogDescription>
            View and manage order information
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <div className="grid gap-6 py-4">
            <OrderInformation order={order} />
            <ProductDetails order={order} />
            <ShippingInformation shippingAddress={order.shipping_address} />
            <OrderStatusSection
              currentStatus={order.status}
              onStatusUpdate={(newStatus) => onStatusUpdate(order.id, newStatus)}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}