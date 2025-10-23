"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { findVariantByBarcode } from "@/app/actions/catalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Plus } from "lucide-react";

type VariantResult = {
  id: number;
  productId: number;
  sku: string;
  barcode: string | null;
  name: string;
  price: string;
  product: {
    id: number;
    name: string;
    tenantId: number;
  };
};

export default function ProductSearch() {
  const { dispatch } = useCart();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<VariantResult[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const result = await findVariantByBarcode(search);

      if ("error" in result) {
        setError(result.error || "Product not found");
      } else if ("data" in result) {
        setResults(result.data);
      }
    } catch (err) {
      setError("Failed to search product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (variant: VariantResult) => {
    dispatch({
      type: "ADD",
      payload: {
        variantId: variant.id,
        productName: variant.product.name,
        variantName: variant.name,
        sku: variant.sku,
        qty: 1,
        price: Number.parseFloat(variant.price),
        discount: 0,
        tax: 0,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Search Products</h2>

      <form onSubmit={handleSearch} className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Scan barcode or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </form>

      {results.length > 0 && (
        <div className="border rounded-lg divide-y">
          <div className="p-2 bg-gray-50 font-semibold text-sm">
            {results.length} result{results.length > 1 ? "s" : ""} found
          </div>
          {results.map((variant) => (
            <div
              key={variant.id}
              className="p-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="font-medium">{variant.product.name}</div>
                <div className="text-sm text-gray-600">{variant.name}</div>
                <div className="text-xs text-gray-500">
                  SKU: {variant.sku}
                  {variant.barcode && ` • Barcode: ${variant.barcode}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-semibold text-lg">
                  ${Number.parseFloat(variant.price).toFixed(2)}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(variant)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>• Use a barcode scanner to add items quickly</p>
        <p>• Or type the product name, SKU, or barcode to search</p>
      </div>
    </div>
  );
}
