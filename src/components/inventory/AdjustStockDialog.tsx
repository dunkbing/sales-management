"use client";

import { useActionState } from "react";
import { adjustStock } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { SelectStockItem } from "@/db/schema";

type AdjustStockDialogProps = {
  stock: SelectStockItem & {
    variant?: {
      name: string;
      sku: string;
      product?: {
        name: string;
      };
    };
  };
  isOpen: boolean;
  onClose: () => void;
  dict: any;
};

export default function AdjustStockDialog({
  stock,
  isOpen,
  onClose,
  dict,
}: AdjustStockDialogProps) {
  async function handleSubmit(prevState: any, formData: FormData) {
    const qty = Number.parseInt(formData.get("qty") as string);
    const reason = formData.get("reason") as string;
    const notes = formData.get("notes") as string;

    const result = await adjustStock({
      variantId: stock.variantId,
      storeId: stock.storeId,
      qty,
      reason,
      notes: notes || undefined,
    });

    if ("error" in result) {
      return result;
    }

    onClose();
    window.location.reload();
    return { success: true };
  }

  const [state, formAction, pending] = useActionState(handleSubmit, null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.inventory.stock.adjust.title}</DialogTitle>
          <DialogDescription>
            {dict.inventory.stock.adjust.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm">
            <div className="font-semibold">
              {stock.variant?.product?.name} - {stock.variant?.name}
            </div>
            <div className="text-gray-500">SKU: {stock.variant?.sku}</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">On Hand:</span>{" "}
                <span className="font-semibold">{stock.qtyOnHand}</span>
              </div>
              <div>
                <span className="text-gray-500">Reserved:</span>{" "}
                <span className="font-semibold">{stock.qtyReserved}</span>
              </div>
              <div>
                <span className="text-gray-500">Available:</span>{" "}
                <span className="font-semibold">{stock.qtyAvailable}</span>
              </div>
            </div>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="qty">{dict.inventory.stock.adjust.quantity}</Label>
            <Input
              id="qty"
              name="qty"
              type="number"
              placeholder={dict.inventory.stock.adjust.quantityPlaceholder}
              required
              disabled={pending}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter positive number to add, negative to remove
            </p>
          </div>

          <div>
            <Label htmlFor="reason">{dict.inventory.stock.adjust.reason}</Label>
            <Input
              id="reason"
              name="reason"
              type="text"
              placeholder={dict.inventory.stock.adjust.reasonPlaceholder}
              required
              disabled={pending}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="notes">{dict.inventory.stock.adjust.notes}</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder={dict.inventory.stock.adjust.notesPlaceholder}
              disabled={pending}
              className="mt-2"
            />
          </div>

          {state && "error" in state && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {state.error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
              className="flex-1"
            >
              {dict.common.cancel}
            </Button>
            <Button type="submit" disabled={pending} className="flex-1">
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending
                ? dict.inventory.stock.adjust.adjusting
                : dict.inventory.stock.adjust.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
