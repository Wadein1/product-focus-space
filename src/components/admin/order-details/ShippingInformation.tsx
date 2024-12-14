import { Card } from "@/components/ui/card";
import { ShippingAddress } from "@/types/order";

interface ShippingInformationProps {
  shippingAddress: ShippingAddress;
}

export function ShippingInformation({ shippingAddress }: ShippingInformationProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Shipping Information</h3>
      <div className="space-y-2">
        <div>
          <p className="text-sm text-gray-500">Street Address</p>
          <p className="font-medium">{shippingAddress.address}</p>
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
    </Card>
  );
}