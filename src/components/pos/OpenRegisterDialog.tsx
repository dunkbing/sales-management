"use client";

import { useState } from "react";
import { openRegister } from "@/app/actions/pos";
import { useRegister } from "@/contexts/RegisterContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type OpenRegisterDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionCreated?: (sessionId: number) => void;
};

export default function OpenRegisterDialog({
  isOpen,
  onOpenChange,
  onSessionCreated,
}: OpenRegisterDialogProps) {
  const { storeId, setSession } = useRegister();
  const [name, setName] = useState("");
  const [openingFloat, setOpeningFloat] = useState("100000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOpenRegister = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await openRegister({
        storeId,
        openingFloat,
        name: name.trim() || undefined,
      });

      if ("error" in result) {
        setError(result.error || "Failed to open register");
      } else {
        setSession(result.data);
        onOpenChange(false);
        // Reset form
        setName("");
        setOpeningFloat("100000");
        // Notify parent that session was created
        onSessionCreated?.(result.data.id);
      }
    } catch (err) {
      setError("Failed to open register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Open Register</DialogTitle>
          <DialogDescription>
            Create a new register session to start selling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="session-name">
              Session Name <span className="text-gray-400">(Optional)</span>
            </Label>
            <Input
              id="session-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Shift, Counter 1"
              className="mt-2"
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-1">
              Give this session a name to easily identify it later.
            </p>
          </div>

          <div>
            <Label htmlFor="opening-float">Opening Cash Float</Label>
            <Input
              id="opening-float"
              type="number"
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
              step="1000"
              min="0"
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Starting cash amount in the drawer for making change.
            </p>
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
              onClick={handleOpenRegister}
              disabled={loading || !openingFloat}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Open Register
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
