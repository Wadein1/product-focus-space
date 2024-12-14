import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/types/order";

interface OrderStatusProps {
  currentStatus: OrderStatus;
  onStatusUpdate: (newStatus: OrderStatus) => void;
}

export function OrderStatusSection({ currentStatus, onStatusUpdate }: OrderStatusProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Order Status</h3>
      <Select
        defaultValue={currentStatus}
        onValueChange={(newStatus) => {
          onStatusUpdate(newStatus as OrderStatus);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="received">Received</SelectItem>
          <SelectItem value="processed">Processed</SelectItem>
          <SelectItem value="designed">Designed</SelectItem>
          <SelectItem value="producing">Producing</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
        </SelectContent>
      </Select>
    </Card>
  );
}