import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Order } from "@/types/order";
import { Download, Trash2 } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export function OrdersTable({ orders, onViewDetails, onDeleteOrder }: OrdersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
        return 'bg-purple-100 text-purple-800';
      case 'designed':
        return 'bg-indigo-100 text-indigo-800';
      case 'producing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async (imageUrl: string, productName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName}-image.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders?.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
            <TableCell>
              {new Date(order.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>{order.customer_email}</TableCell>
            <TableCell>{order.product_name}</TableCell>
            <TableCell>${order.total_amount}</TableCell>
            <TableCell>
              <Badge 
                variant="secondary" 
                className={getStatusColor(order.status)}
              >
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(order)}
              >
                View Details
              </Button>
              {order.image_path && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(order.image_path!, order.product_name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this order? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteOrder(order.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}