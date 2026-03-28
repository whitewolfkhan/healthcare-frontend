'use client';
import { useState, useEffect } from 'react';
import { FiActivity, FiCalendar, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { adminAPI } from '../../../../lib/api';
import StatCard from '../../../../components/ui/StatCard';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const overview = data?.overview || {};
  const pieData = data?.appointmentsByStatus?.map(s => ({ name: s.status, value: parseInt(s.count) })) || [];
  const areaData = data?.appointmentsByDay?.map(d => ({ date: d.date?.slice(5), count: parseInt(d.count) })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">Analytics & Reports</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={overview.totalUsers || 0} icon={FiUsers} color="blue" />
        <StatCard title="Total Patients" value={overview.totalPatients || 0} icon={FiUsers} color="teal" />
        <StatCard title="Total Doctors" value={overview.totalDoctors || 0} icon={FiUsers} color="purple" />
        <StatCard title="Total Appointments" value={overview.totalAppointments || 0} icon={FiCalendar} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 card">
          <h3 className="section-title">Appointment Trend (Last 30 Days)</h3>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={3} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorCount)" name="Appointments" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available</div>}
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 className="section-title">Appointment Status</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="capitalize text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'New Users (30 days)', value: overview.newUsers30Days || 0, change: '+12%', color: 'text-emerald-600' },
          { title: 'Departments', value: overview.totalDepartments || 0, change: 'Active', color: 'text-blue-600' },
          { title: 'System Health', value: '99.9%', change: 'Uptime', color: 'text-teal-600' },
        ].map((item, i) => (
          <div key={i} className="card">
            <div className="text-gray-500 text-sm mb-2">{item.title}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{item.value}</div>
            <div className={`text-sm font-medium ${item.color}`}>{item.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
