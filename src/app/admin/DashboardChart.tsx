"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardChart({ data }: { data: any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center text-slate-400">No data available</div>;
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `Rs ${value}`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            formatter={(value: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#0f172a" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRev)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
