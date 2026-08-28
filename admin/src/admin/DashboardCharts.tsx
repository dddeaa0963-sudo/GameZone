import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const DashboardCharts = ({ orders }: { orders: any[] }) => {
  const { dailyData, monthlyData } = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    const monthlyMap: Record<string, number> = {};

    orders.forEach(order => {
      if (!order.date || order.status === 'rejected') return;
      
      // Parse price, handling cases like "15.00 $"
      let amount = 0;
      if (typeof order.price === 'number') {
        amount = order.price;
      } else if (typeof order.price === 'string') {
        const match = order.price.match(/[\d.]+/);
        if (match) amount = parseFloat(match[0]);
      } else if (typeof order.amount === 'number') {
        amount = order.amount;
      } else if (typeof order.amount === 'string') {
        const match = order.amount.match(/[\d.]+/);
        if (match) amount = parseFloat(match[0]);
      }

      // Date format is likely YYYY-MM-DD or similar
      let d = new Date(order.date);
      if (isNaN(d.getTime())) {
          // fallback if date format is not standard
          const parts = order.date.split(' ');
          d = new Date(parts[0]);
      }
      
      if (!isNaN(d.getTime())) {
        const dayKey = d.toISOString().split('T')[0];
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        dailyMap[dayKey] = (dailyMap[dayKey] || 0) + amount;
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + amount;
      }
    });

    // Last 14 days
    const today = new Date();
    const daily = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daily.push({
        date: key,
        displayDate: `${d.getDate()}/${d.getMonth() + 1}`,
        sales: dailyMap[key] || 0
      });
    }

    // Last 6 months
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly.push({
        date: key,
        displayDate: `${d.getMonth() + 1}/${d.getFullYear()}`,
        sales: monthlyMap[key] || 0
      });
    }

    return { dailyData: daily, monthlyData: monthly };
  }, [orders]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-lg text-right" dir="rtl">
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</p>
          <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">
            {payload[0].value.toFixed(2)}$ <span className="font-sans text-xs text-gray-500 font-normal">المبيعات</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">المبيعات اليومية (آخر 14 يوم)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">المبيعات الشهرية (آخر 6 أشهر)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
