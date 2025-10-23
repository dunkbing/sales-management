"use client";

import RegisterList from "@/components/pos/RegisterList";
import { RegisterProvider } from "@/contexts/RegisterContext";

function POSDashboardContent() {
  return (
    <div className="container mx-auto p-6">
      <RegisterList />
    </div>
  );
}

export default function POSDashboardPage() {
  return (
    <RegisterProvider>
      <POSDashboardContent />
    </RegisterProvider>
  );
}
