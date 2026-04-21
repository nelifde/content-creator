"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function UsageAreaChart({
  data,
  dataKey,
  label,
  className,
}: {
  data: { label: string; value: number }[];
  dataKey: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? <p className="mb-2 text-xs text-muted-foreground">{label}</p> : null}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" width={32} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area type="monotone" dataKey={dataKey} stroke="#60a5fa" fill="#60a5fa33" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
