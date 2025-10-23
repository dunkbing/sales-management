"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useRegister } from "@/contexts/RegisterContext";
import { getRegisterSession } from "@/app/actions/pos";
import ProductSearch from "./ProductSearch";
import CartDisplay from "./CartDisplay";
import PaymentModal from "./PaymentModal";
import CloseRegisterDialog from "./CloseRegisterDialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, DoorClosed } from "lucide-react";

type POSInterfaceProps = {
  sessionId: number;
  onClose?: () => void;
};

export default function POSInterface({
  sessionId,
  onClose,
}: POSInterfaceProps) {
  const { state, total } = useCart();
  const { session, setSession } = useRegister();
  const [showPayment, setShowPayment] = useState(false);
  const [showCloseRegister, setShowCloseRegister] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load session from URL param
  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getRegisterSession(sessionId);
        if ("error" in result) {
          setError(result.error || "Failed to load session");
        } else {
          // Check if session is already closed
          if (result.data?.closedAt) {
            setError("This register session is already closed");
          } else {
            setSession(result.data || null);
          }
        }
      } catch (err) {
        setError("Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, setSession]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <DoorClosed className="h-16 w-16 mx-auto text-red-400" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Session Not Available
            </h2>
            <p className="text-gray-600 mt-1">
              {error || "Unable to load register session"}
            </p>
          </div>
          {onClose && (
            <Button onClick={onClose}>Back to Register Dashboard</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full">
        {/* Left Panel - Cart */}
        <div className="w-1/2 border-r bg-white p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold">Cart</h2>
                <p className="text-xs text-gray-500">Session #{session?.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                {state.lines.length} items
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCloseRegister(true)}
              >
                <DoorClosed className="h-4 w-4 mr-1" />
                Close Register
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <CartDisplay />
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₫{total.toLocaleString()}</span>
            </div>
            <Button
              onClick={() => setShowPayment(true)}
              disabled={state.lines.length === 0}
              className="w-full h-12 text-lg"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Checkout
            </Button>
          </div>
        </div>

        {/* Right Panel - Product Search */}
        <div className="w-1/2 bg-gray-50 p-4">
          <ProductSearch />
        </div>
      </div>

      {/* Dialogs */}
      <CloseRegisterDialog
        isOpen={showCloseRegister}
        onOpenChange={setShowCloseRegister}
        onRegisterClosed={onClose}
      />
      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
