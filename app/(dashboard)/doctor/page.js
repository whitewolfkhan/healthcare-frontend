'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCalendar, FiUsers, FiClock, FiCheck, FiChevronRight, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { doctorAPI } from '../../../lib/api';
import useAuthStore from '../../../lib/store';
import StatCard from '../../../components/ui/StatCard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const statusColors = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorAPI.getDashboard()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = data?.stats || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-teal-600 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome, Dr. {user?.firstName}! 👨‍⚕️</h2>
            <p className="text-teal-100 mt-1">Your patient care dashboard</p>
            <p className="text-teal-200 text-sm">Chattagram Medical Center</p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-3xl font-bold">{format(new Date(), 'dd')}</div>
            <div className="text-teal-200 text-sm">{format(new Date(), 'EEEE, MMM yyyy')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Appointments" value={stats.totalAppointments || 0} icon={FiCalendar} color="blue" />
        <StatCard title="Today's Appointments" value={stats.todayAppointments || 0} icon={FiClock} color="teal" />
        <StatCard title="Completed" value={stats.totalPatients || 0} icon={FiCheck} color="emerald" />
        <StatCard title="Pending" value={stats.pendingAppointments || 0} icon={FiUsers} color="amber" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">Today's & Upcoming Appointments</h3>
          <Link href="/doctor/appointments" className="text-primary-600 text-sm hover:text-primary-700 font-medium flex items-center gap-1">
            View all <FiChevronRight size={14} />
          </Link>
        </div>
        {data?.recentAppointments?.length > 0 ? (
          <div className="space-y-3">
            {data.recentAppointments.map(apt => (
              <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                  {`${apt.patient?.user?.firstName?.[0]}${apt.patient?.user?.lastName?.[0]}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{apt.patient?.user?.firstName} {apt.patient?.user?.lastName}</div>
                  <div className="text-gray-500 text-xs truncate">{apt.reason || 'Consultation'}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-700">{format(new Date(apt.appointmentDate + 'T00:00:00'), 'MMM dd')}</div>
                  <div className="text-xs text-gray-400">{apt.appointmentTime?.slice(0, 5)}</div>
                </div>
                <span className={statusColors[apt.status] || 'badge-gray'}>{apt.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiCalendar className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-400">No upcoming appointments</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: 'View All Appointments', desc: 'Manage your schedule and patient appointments', href: '/doctor/appointments', icon: FiCalendar, color: 'text-blue-600 bg-blue-50' },
          { title: 'Patient Records', desc: 'Access and manage patient medical records', href: '/doctor/patients', icon: FiUsers, color: 'text-teal-600 bg-teal-50' },
          { title: 'Write Prescription', desc: 'Create and manage patient prescriptions', href: '/doctor/prescriptions', icon: FiCheck, color: 'text-emerald-600 bg-emerald-50' },
          { title: 'Lab Results', desc: 'Review and annotate lab test results', href: '/doctor/lab-results', icon: FiClock, color: 'text-purple-600 bg-purple-50' },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="card hover:shadow-md transition-all flex items-center gap-4 group">
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <action.icon size={20} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{action.title}</div>
              <div className="text-gray-500 text-sm">{action.desc}</div>
            </div>
            <FiChevronRight className="ml-auto text-gray-400" size={16} />
          </Link>
        ))}
      </div>
    </div>
  );
}
