"use client";

import { useEffect, useState } from "react";
import { listStores } from "@/app/actions/stores";
import { listStockByStore } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdjustStockDialog from "@/components/inventory/AdjustStockDialog";
import { Loader2, AlertTriangle, Package } from "lucide-react";
import type { SelectStore, SelectStockItem } from "@/db/schema";

type StockItemWithRelations = SelectStockItem & {
  variant?: {
    name: string;
    sku: string;
    barcode?: string | null;
    product?: {
      name: string;
    };
  };
};

type StockManagerProps = {
  dict: any;
};

export default function StockManager({ dict }: StockManagerProps) {
  const [stores, setStores] = useState<SelectStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [stockItems, setStockItems] = useState<StockItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStock, setSelectedStock] =
    useState<StockItemWithRelations | null>(null);

  useEffect(() => {
    async function loadStores() {
      const result = await listStores();
      if ("data" in result) {
        setStores(result.data);
        if (result.data.length > 0) {
          setSelectedStoreId(result.data[0].id.toString());
        }
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    loadStores();
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;

    async function loadStock() {
      setLoading(true);
      const result = await listStockByStore(Number.parseInt(selectedStoreId));
      if ("data" in result) {
        setStockItems(result.data as StockItemWithRelations[]);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    loadStock();
  }, [selectedStoreId]);

  const selectedStore = stores.find((s) => s.id.toString() === selectedStoreId);

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">
          {dict.inventory.stock.selectStore}
        </label>
        <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={dict.inventory.stock.selectStore} />
          </SelectTrigger>
          <SelectContent>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id.toString()}>
                {store.name} ({store.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStore?.name} - {dict.inventory.stock.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{dict.inventory.stock.noStock}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add stock using purchase orders or manual adjustment
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dict.inventory.stock.product}</TableHead>
                    <TableHead>{dict.inventory.stock.variant}</TableHead>
                    <TableHead>{dict.inventory.stock.sku}</TableHead>
                    <TableHead className="text-right">
                      {dict.inventory.stock.onHand}
                    </TableHead>
                    <TableHead className="text-right">
                      {dict.inventory.stock.reserved}
                    </TableHead>
                    <TableHead className="text-right">
                      {dict.inventory.stock.available}
                    </TableHead>
                    <TableHead className="text-right">
                      {dict.inventory.stock.reorderPoint}
                    </TableHead>
                    <TableHead className="text-right">
                      {dict.inventory.stock.actions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.map((item) => {
                    const isLowStock = item.qtyAvailable <= item.reorderPoint;
                    const isOutOfStock = item.qtyAvailable <= 0;

                    return (
                      <TableRow
                        key={item.id}
                        className={
                          isOutOfStock
                            ? "bg-red-50"
                            : isLowStock
                              ? "bg-yellow-50"
                              : ""
                        }
                      >
                        <TableCell className="font-medium">
                          {item.variant?.product?.name}
                        </TableCell>
                        <TableCell>{item.variant?.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.variant?.sku}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.qtyOnHand}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.qtyReserved}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isOutOfStock && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            {isLowStock && !isOutOfStock && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                            <span
                              className={
                                isOutOfStock
                                  ? "text-red-600 font-semibold"
                                  : isLowStock
                                    ? "text-yellow-600 font-semibold"
                                    : ""
                              }
                            >
                              {item.qtyAvailable}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.reorderPoint}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStock(item)}
                          >
                            {dict.inventory.stock.adjustStock}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {selectedStock && (
        <AdjustStockDialog
          stock={selectedStock}
          isOpen={!!selectedStock}
          onClose={() => setSelectedStock(null)}
          dict={dict}
        />
      )}
    </div>
  );
}
