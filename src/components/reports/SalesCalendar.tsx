"use client";

import { useState, useEffect } from "react";
import { getSalesSummary, SalesSummaryData } from "@/app/actions/pos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";

type SalesCalendarProps = {
  storeId: number;
  onDayClick?: (date: string, data: SalesSummaryData) => void;
};

export default function SalesCalendar({
  storeId,
  onDayClick,
}: SalesCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [salesData, setSalesData] = useState<Record<string, SalesSummaryData>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSalesData();
  }, [currentMonth, storeId]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const result = await getSalesSummary({
        storeId,
        dateFrom: monthStart,
        dateTo: monthEnd,
      });

      if (result.data) {
        setSalesData(result.data);
      }
    } catch (error) {
      console.error("Failed to load sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const dayData = salesData[dateKey];
    if (dayData && onDayClick) {
      onDayClick(dateKey, dayData);
    }
  };

  // Calculate month totals
  const monthTotals = Object.values(salesData).reduce(
    (acc, day) => {
      acc.totalSales += day.totalSales;
      acc.totalTransactions += day.transactionCount;
      acc.totalItems += day.totalItems;
      return acc;
    },
    { totalSales: 0, totalTransactions: 0, totalItems: 0 },
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                  disabled={loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                  disabled={loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ₫{monthTotals.totalSales.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {monthTotals.totalTransactions}
              </div>
              <div className="text-sm text-gray-500">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{monthTotals.totalItems}</div>
              <div className="text-sm text-gray-500">Items Sold</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-sm text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayData = salesData[dateKey];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const hasSales = !!dayData;

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!isCurrentMonth || !hasSales}
                  className={`
                    min-h-[100px] p-2 border rounded-lg text-left transition-all
                    ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : "hover:shadow-md"}
                    ${isTodayDate ? "border-blue-500 border-2" : ""}
                    ${hasSales && isCurrentMonth ? "cursor-pointer hover:bg-blue-50" : ""}
                    ${!hasSales && isCurrentMonth ? "cursor-default" : ""}
                  `}
                >
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      isTodayDate ? "text-blue-600" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  {hasSales && isCurrentMonth && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-green-600">
                        ₫{dayData.totalSales.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dayData.transactionCount} sale
                        {dayData.transactionCount !== 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dayData.totalItems} items
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
