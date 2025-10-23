"use client";

import { useEffect, useState } from "react";
import { listRegisterSessions, openRegister } from "@/app/actions/pos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DoorOpen,
  DoorClosed,
  Plus,
  Calendar,
  User,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRegister } from "@/contexts/RegisterContext";
import { CartProvider } from "@/contexts/CartContext";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import POSInterface from "./POSInterface";
import { RegisterSessionWithRelations } from "@/db/schema";

type RegisterListProps = {};

export default function RegisterList({}: RegisterListProps) {
  const [sessions, setSessions] = useState<RegisterSessionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "open">("all");
  const { storeId, setSession } = useRegister();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );
  const [creatingSession, setCreatingSession] = useState(false);
  const [showPOSModal, setShowPOSModal] = useState(false);

  const handleOpenSession = (sessionId: number) => {
    return () => {
      setSelectedSessionId(sessionId);
      setShowPOSModal(true);
    };
  };

  useEffect(() => {
    loadSessions();
  }, [storeId, filter]);

  const handleNewSession = async () => {
    setCreatingSession(true);
    try {
      const result = await openRegister({
        storeId,
        openingFloat: "0",
      });

      if ("error" in result) {
        console.error("Failed to create session:", result.error);
      } else {
        setSession(result.data);
        setSelectedSessionId(result.data.id);
        setShowPOSModal(true);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setCreatingSession(false);
    }
  };

  const loadSessions = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listRegisterSessions({
        storeId,
        openOnly: filter === "open",
      });

      if ("error" in result) {
        setError(result.error || "Failed to load sessions");
      } else {
        setSessions(result.data || []);
      }
    } catch (err) {
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const openSessions = sessions.filter((s) => !s.closedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Register Sessions</h1>
          <p className="text-gray-500 mt-1">
            Manage and view your register sessions
          </p>
        </div>
        <Button onClick={handleNewSession} size="lg" disabled={creatingSession}>
          {creatingSession ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-5 w-5" />
              New Session
            </>
          )}
        </Button>
      </div>

      {/* Open Sessions Alert */}
      {openSessions.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DoorOpen className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    {openSessions.length} Open Session
                    {openSessions.length > 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-green-700">
                    Click to resume selling
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {openSessions.map((session) => (
                  <Button
                    key={session.id}
                    onClick={handleOpenSession(session.id)}
                    variant="default"
                  >
                    Resume Session #{session.id}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All Sessions
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === "open"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Open Only
        </button>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadSessions} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <DoorClosed className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            {filter === "open"
              ? "No open register sessions"
              : "No register sessions yet"}
          </p>
          <Button onClick={handleNewSession}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Session
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const isOpen = !session.closedAt;
            const salesCount = session.sales?.length || 0;

            return (
              <Card
                key={session.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isOpen ? "border-green-200" : ""
                }`}
                onClick={handleOpenSession(session.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {isOpen ? (
                        <DoorOpen className="h-6 w-6 text-green-600 mt-1" />
                      ) : (
                        <DoorClosed className="h-6 w-6 text-gray-400 mt-1" />
                      )}
                      <div>
                        <CardTitle className="text-xl">
                          Session #{session.id}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={isOpen ? "default" : "secondary"}>
                            {isOpen ? "Open" : "Closed"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {salesCount} sale{salesCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Opened
                      </div>
                      <div className="font-medium">
                        {formatDistanceToNow(new Date(session.openedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Opened By
                      </div>
                      <div className="font-medium">
                        {session.openedBy?.name}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Opening Float</div>
                      <div className="font-medium">
                        ₫
                        {Number.parseFloat(
                          session.openingFloat,
                        ).toLocaleString()}
                      </div>
                    </div>

                    {!isOpen && session.discrepancy && (
                      <div>
                        <div className="text-sm text-gray-500">Discrepancy</div>
                        <div
                          className={`font-bold ${
                            Number.parseFloat(session.discrepancy) > 0
                              ? "text-green-600"
                              : Number.parseFloat(session.discrepancy) < 0
                                ? "text-red-600"
                                : "text-gray-900"
                          }`}
                        >
                          {Number.parseFloat(session.discrepancy) > 0 && "+"}₫
                          {Number.parseFloat(
                            session.discrepancy,
                          ).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CartProvider>
        {selectedSessionId && (
          <Dialog open={showPOSModal} onOpenChange={setShowPOSModal}>
            <DialogTitle>Title</DialogTitle>
            <DialogContent className="min-w-[1000px] h-[96vh] gap-0">
              <POSInterface sessionId={selectedSessionId} />
            </DialogContent>
          </Dialog>
        )}
      </CartProvider>
    </div>
  );
}
