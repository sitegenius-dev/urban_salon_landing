import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { CalendarDays, Users, Scissors, TrendingUp, IndianRupee, Clock } from 'lucide-react';

const STATUS_COLORS = {
  pending:   '#D4AF37',
  confirmed: '#00cc88',
  completed: '#4488ff',
  cancelled: '#ff4444',
};

const PIE_COLORS = ['#D4AF37','#00cc88','#4488ff','#ff4444','#ff8800','#cc44ff'];

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout panel="admin">
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    </AdminLayout>
  );

  const cards = [
    { label: 'Total Bookings',  value: stats?.totalBookings  ?? 0, icon: CalendarDays, color: '#D4AF37' },
    { label: "Today's Bookings", value: stats?.todayBookings ?? 0, icon: Clock,         color: '#4488ff' },
    { label: 'Active Staff',    value: stats?.totalStaff    ?? 0, icon: Users,          color: '#00cc88' },
    { label: 'Active Services', value: stats?.totalServices  ?? 0, icon: Scissors,       color: '#ff8800' },
    { label: 'Total Revenue',   value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`,  icon: TrendingUp,   color: '#D4AF37' },
    { label: 'Amount Collected',value: `₹${(stats?.totalCollected ?? 0).toLocaleString('en-IN')}`,icon: IndianRupee,  color: '#00cc88' },
  ];

  const statusData = (stats?.statusBreakdown || []).map(s => ({
    name: s.bookingStatus,
    value: parseInt(s.count),
  }));

  return (
    <AdminLayout panel="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-white font-black text-xl">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(c => (
            <div key={c.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-xs uppercase tracking-widest">{c.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: c.color + '22' }}>
                  <c.icon size={16} style={{ color: c.color }} />
                </div>
              </div>
              <p className="text-white font-black text-2xl">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar chart */}
          <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4 text-sm">Bookings – Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.last7Days || []} barSize={24}>
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff' }}
                  cursor={{ fill: 'rgba(212,175,55,0.08)' }} />
                <Bar dataKey="bookings" fill="#D4AF37" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4 text-sm">Booking Status</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend formatter={(v) => <span style={{ color: '#aaa', fontSize: 12 }}>{v}</span>} />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Services breakdown */}
        {(stats?.bookingsByRoute?.length > 0) && (
          <div className="bg-[#111] border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4 text-sm">Top Services Booked</h3>
            <div className="space-y-3">
              {stats.bookingsByRoute.map((item, i) => {
                const max = stats.bookingsByRoute[0]?.count || 1;
                const pct = Math.round((item.count / max) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-28 truncate">{item.name}</span>
                    <div className="flex-1 bg-[#1a1a1a] rounded-full h-2">
                      <div className="bg-gold h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gold text-xs font-bold w-6 text-right">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        
      </div>
    </AdminLayout>
  );
}
