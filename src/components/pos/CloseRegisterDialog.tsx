"use client";

import { useState } from "react";
import { closeRegister } from "@/app/actions/pos";
import { useRegister } from "@/contexts/RegisterContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Check, AlertTriangle } from "lucide-react";

type CloseRegisterDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClosed?: () => void;
};

export default function CloseRegisterDialog({
  isOpen,
  onOpenChange,
  onRegisterClosed,
}: CloseRegisterDialogProps) {
  const { session, setSession } = useRegister();
  const [actualCash, setActualCash] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    expectedCash: number;
    actualCash: number;
    discrepancy: number;
  } | null>(null);

  const handleCloseRegister = async () => {
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      const closeResult = await closeRegister({
        sessionId: session.id,
        actualCash,
        notes: notes || undefined,
      });

      if ("error" in closeResult) {
        setError(closeResult.error || "Failed to close register");
      } else {
        setResult({
          expectedCash: closeResult.data.expectedCash,
          actualCash: closeResult.data.actualCash,
          discrepancy: closeResult.data.discrepancy,
        });
      }
    } catch (err) {
      setError("Failed to close register");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setSession(null);
    setResult(null);
    setActualCash("");
    setNotes("");
    onOpenChange(false);
    // Notify parent that register was closed
    onRegisterClosed?.();
  };

  if (result) {
    const isBalanced = Math.abs(result.discrepancy) < 0.01;

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isBalanced ? "bg-green-100" : "bg-yellow-100"
              }`}
            >
              {isBalanced ? (
                <Check className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold">Register Closed</h2>

            <div className="w-full space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Cash:</span>
                <span className="font-semibold">
                  ₫{result.expectedCash.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actual Cash:</span>
                <span className="font-semibold">
                  ₫{result.actualCash.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Discrepancy:</span>
                <span
                  className={`font-bold ${
                    result.discrepancy > 0
                      ? "text-green-600"
                      : result.discrepancy < 0
                        ? "text-red-600"
                        : "text-gray-900"
                  }`}
                >
                  {result.discrepancy > 0 && "+"}₫
                  {result.discrepancy.toLocaleString()}
                </span>
              </div>
            </div>

            {!isBalanced && (
              <p className="text-sm text-gray-500 text-center">
                {result.discrepancy > 0
                  ? "Cash over - there is more cash than expected"
                  : "Cash short - there is less cash than expected"}
              </p>
            )}

            <Button onClick={handleFinish} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Close Register</DialogTitle>
          <DialogDescription>
            Count the cash in the drawer and enter the total amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {session && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Opening Float:</span>
                <span className="font-semibold">
                  ₫{Number.parseFloat(session.openingFloat).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="actual-cash">Actual Cash in Drawer</Label>
            <Input
              id="actual-cash"
              type="number"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              step="1000"
              min="0"
              className="mt-2"
              autoFocus
              placeholder="Count all cash in drawer"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
              placeholder="Any notes about the shift..."
              rows={3}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCloseRegister}
              disabled={loading || !actualCash}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Close Register
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
