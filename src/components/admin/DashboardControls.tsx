import React from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  orderTypeFilter: string;
  onOrderTypeFilterChange: (value: string) => void;
}

export function DashboardControls({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  orderTypeFilter,
  onOrderTypeFilterChange,
}: DashboardControlsProps) {
  return (
    <div className="flex gap-4 mt-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={orderTypeFilter}
        onValueChange={onOrderTypeFilterChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Order type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="regular">Regular Orders</SelectItem>
          <SelectItem value="fundraiser">Fundraiser Orders</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={statusFilter}
        onValueChange={onStatusFilterChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="received">Received</SelectItem>
          <SelectItem value="processed">Processed</SelectItem>
          <SelectItem value="designed">Designed</SelectItem>
          <SelectItem value="producing">Producing</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}