import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrdersTable } from './OrdersTable';
import { DashboardControls } from './DashboardControls';
import { LoadingSpinner } from './LoadingSpinner';
import { Order } from '@/types/order';
import { OrderDetailsDialog } from './OrderDetailsDialog';

interface OrdersTabContentProps {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  onDeleteOrder: (orderId: string) => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  isLoading: boolean;
}

export function OrdersTabContent({
  orders,
  totalPages,
  currentPage,
  setCurrentPage,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedOrder,
  setSelectedOrder,
  onDeleteOrder,
  onStatusUpdate,
  isLoading,
}: OrdersTabContentProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Tracking</CardTitle>
        <DashboardControls
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        />
      </CardHeader>
      <CardContent>
        <OrdersTable 
          orders={orders} 
          onViewDetails={setSelectedOrder}
          onDeleteOrder={onDeleteOrder}
        />
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="py-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>

      <OrderDetailsDialog
        order={selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
        onStatusUpdate={onStatusUpdate}
      />
    </Card>
  );
}