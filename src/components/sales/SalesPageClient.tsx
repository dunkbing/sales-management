"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import SalesTable from "@/components/sales/SalesTable";
import SalesCalendar from "@/components/reports/SalesCalendar";
import DaySalesDetail from "@/components/reports/DaySalesDetail";
import { useRegister } from "@/contexts/RegisterContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Calendar } from "lucide-react";

type SalesStats = {
  totalSales: number;
  totalRevenue: string;
  paidSales: number;
  averageOrderValue: string;
};

type SalesSummaryData = {
  date: string;
  sales: any[];
  totalSales: number;
  totalItems: number;
  transactionCount: number;
};

type SalesPageClientProps = {
  sales: any[];
  stats: SalesStats | null;
  dict: any;
  lang: string;
};

export default function SalesPageClient({
  sales,
  stats,
  dict,
  lang,
}: SalesPageClientProps) {
  const { storeId } = useRegister();
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    data: SalesSummaryData;
  } | null>(null);

  const handleDayClick = (date: string, data: SalesSummaryData) => {
    setSelectedDay({ date, data });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{dict.sales.title}</h1>
        <p className="text-gray-500">{dict.sales.description}</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-gray-500">
              {dict.sales.stats.totalOrders}
            </div>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-500">
              {dict.sales.stats.totalRevenue}
            </div>
            <div className="text-2xl font-bold">
              {Number(stats.totalRevenue).toLocaleString("vi-VN")} ₫
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-500">{dict.sales.stats.paid}</div>
            <div className="text-2xl font-bold">{stats.paidSales}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-500">Average Order</div>
            <div className="text-2xl font-bold">
              {Number(stats.averageOrderValue).toLocaleString("vi-VN")} ₫
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <Table className="h-4 w-4" />
            Sales List
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <SalesTable sales={sales} dict={dict} lang={lang} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          {selectedDay ? (
            <DaySalesDetail
              date={selectedDay.date}
              data={selectedDay.data}
              onClose={() => setSelectedDay(null)}
            />
          ) : (
            <SalesCalendar storeId={storeId} onDayClick={handleDayClick} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
