'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUsers, FiCalendar, FiGrid, FiActivity, FiChevronRight, FiUserPlus } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format } from 'date-fns';
import { adminAPI } from '../../../lib/api';
import useAuthStore from '../../../lib/store';
import StatCard from '../../../components/ui/StatCard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const { user } = useAuthStore();
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
  const barData = data?.appointmentsByDay?.slice(-14).map(d => ({ date: d.date?.slice(5), count: parseInt(d.count) })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Admin Dashboard 🏥</h2>
        <p className="text-blue-100 mt-1">HealthCare System Overview — Chattagram, Bangladesh</p>
        <p className="text-blue-200 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={overview.totalUsers || 0} icon={FiUsers} color="blue" href="/admin/users" />
        <StatCard title="Patients" value={overview.totalPatients || 0} icon={FiUsers} color="teal" />
        <StatCard title="Doctors" value={overview.totalDoctors || 0} icon={FiUsers} color="purple" />
        <StatCard title="Appointments" value={overview.totalAppointments || 0} icon={FiCalendar} color="amber" />
        <StatCard title="New Users (30d)" value={overview.newUsers30Days || 0} icon={FiUserPlus} color="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 card">
          <h3 className="section-title">Appointments Last 14 Days</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available</div>}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="section-title">Appointment Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Recent Appointments</h3>
          <Link href="/admin/analytics" className="text-primary-600 text-sm hover:text-primary-700 font-medium flex items-center gap-1">Analytics <FiChevronRight size={14} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Patient', 'Doctor', 'Date', 'Type', 'Status'].map(h => <th key={h} className="table-header text-left py-3 pr-4">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data?.recentAppointments?.slice(0, 8).map(apt => (
                <tr key={apt.id} className="table-row">
                  <td className="py-3 pr-4 font-medium text-gray-900">{apt.patient?.user?.firstName} {apt.patient?.user?.lastName}</td>
                  <td className="py-3 pr-4 text-gray-600">Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</td>
                  <td className="py-3 pr-4 text-gray-500">{format(new Date(apt.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="py-3 pr-4 capitalize text-gray-500">{apt.type}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${apt.status === 'completed' ? 'badge-green' : apt.status === 'cancelled' ? 'badge-red' : apt.status === 'confirmed' ? 'badge-blue' : 'badge-yellow'}`}>{apt.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Manage Users', desc: 'Add, edit, deactivate accounts', href: '/admin/users', icon: FiUsers, color: 'text-blue-600 bg-blue-50' },
          { title: 'Departments', desc: 'Manage hospital departments', href: '/admin/departments', icon: FiGrid, color: 'text-teal-600 bg-teal-50' },
          { title: 'Full Analytics', desc: 'Detailed reports & insights', href: '/admin/analytics', icon: FiActivity, color: 'text-purple-600 bg-purple-50' },
        ].map((item, i) => (
          <Link key={i} href={item.href} className="card hover:shadow-md transition-all flex items-center gap-4 group">
            <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <item.icon size={20} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{item.title}</div>
              <div className="text-gray-400 text-sm">{item.desc}</div>
            </div>
            <FiChevronRight className="text-gray-400" size={16} />
          </Link>
        ))}
      </div>
    </div>
  );
}
