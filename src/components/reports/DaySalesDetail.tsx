"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Sale = {
  id: number;
  createdAt: Date;
  grandTotal: string;
  status: string;
  cashier: {
    name: string;
  };
  customer?: {
    name: string;
  } | null;
  items: Array<{
    qty: number;
    price: string;
    variant: {
      name: string;
      product: {
        name: string;
      };
    };
  }>;
};

type DaySalesDetailProps = {
  date: string;
  data: {
    sales: Sale[];
    totalSales: number;
    totalItems: number;
    transactionCount: number;
  };
  onClose: () => void;
};

export default function DaySalesDetail({
  date,
  data,
  onClose,
}: DaySalesDetailProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Sales for {format(new Date(date), "MMMM d, yyyy")}
              </CardTitle>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>{data.transactionCount} transactions</span>
                <span>•</span>
                <span>{data.totalItems} items sold</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ₫{data.totalSales.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Sales</div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <div className="space-y-3">
        {data.sales.map((sale) => (
          <Card key={sale.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Sale #{sale.id}</CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    {format(new Date(sale.createdAt), "h:mm a")} •{" "}
                    {sale.cashier.name}
                    {sale.customer && ` • ${sale.customer.name}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    ₫{Number.parseFloat(sale.grandTotal).toLocaleString()}
                  </div>
                  <Badge
                    variant={
                      sale.status === "PAID"
                        ? "default"
                        : sale.status === "REFUNDED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {sale.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sale.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {item.variant.product.name}
                      </span>
                      {item.variant.name && (
                        <span className="text-gray-500">
                          {" "}
                          - {item.variant.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">x{item.qty}</span>
                      <span className="font-medium">
                        ₫{Number.parseFloat(item.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
