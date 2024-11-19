"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

interface BookingsChartProps {
  data: any[];
  valueKey?: string;
}

export function BookingsChart({ data, valueKey = "count" }: BookingsChartProps) {
  const chartData = useMemo(() => {
    const groupedData = data.reduce((acc: any, item: any) => {
      const date = format(parseISO(item.created_at), "MMM d");
      if (!acc[date]) {
        acc[date] = { date, [valueKey]: 0 };
      }
      acc[date][valueKey] += valueKey === "count" ? 1 : (item[valueKey] || 0);
      return acc;
    }, {});

    return Object.values(groupedData);
  }, [data, valueKey]);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${valueKey === "amount" ? "$" : ""}${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {valueKey === "amount" ? "Revenue" : "Bookings"}
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {valueKey === "amount" ? "$" : ""}
                          {payload[0].value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey={valueKey}
            stroke="#FFD700"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}