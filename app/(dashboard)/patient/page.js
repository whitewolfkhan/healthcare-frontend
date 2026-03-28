'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCalendar, FiFileText, FiActivity, FiHeart, FiAlertCircle, FiPlus, FiClock, FiUser, FiChevronRight } from 'react-icons/fi';
import { patientAPI } from '../../../lib/api';
import useAuthStore from '../../../lib/store';
import { format } from 'date-fns';
import StatCard from '../../../components/ui/StatCard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const statusColors = {
  pending: 'badge-yellow',
  confirmed: 'badge-blue',
  completed: 'badge-green',
  cancelled: 'badge-red',
  'no-show': 'badge-gray',
};

export default function PatientDashboard() {
  const { user, profile } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getDashboardStats()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = data?.stats || {};
  const vitals = data?.recentVitals?.[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-primary-600 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Good {getGreeting()}, {user?.firstName}! 👋</h2>
            <p className="text-blue-100 mt-1">Here's your health overview for today</p>
            <p className="text-blue-200 text-sm mt-0.5">Chattagram, Bangladesh</p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-3xl font-bold">{format(new Date(), 'dd')}</div>
              <div className="text-blue-200 text-sm">{format(new Date(), 'MMM yyyy')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Appointments" value={stats.totalAppointments || 0} icon={FiCalendar} color="blue" href="/patient/appointments" />
        <StatCard title="Active Prescriptions" value={stats.activePrescriptions || 0} icon={FiFileText} color="teal" href="/patient/medical-records" />
        <StatCard title="Lab Results" value={stats.totalLabResults || 0} icon={FiFileText} color="purple" href="/patient/lab-results" />
        <StatCard title="Active Medications" value={stats.activeMedications || 0} icon={FiHeart} color="rose" href="/patient/medications" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Upcoming Appointments</h3>
            <Link href="/patient/appointments" className="text-primary-600 text-sm hover:text-primary-700 font-medium flex items-center gap-1">
              View all <FiChevronRight size={14} />
            </Link>
          </div>
          {data?.upcomingAppointments?.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingAppointments.map(apt => (
                <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-primary-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</div>
                    <div className="text-gray-500 text-xs truncate">{apt.reason || 'Consultation'}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <FiCalendar size={12} className="text-gray-400" />
                      {format(new Date(apt.appointmentDate), 'MMM dd')}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                      <FiClock size={11} />
                      {apt.appointmentTime?.slice(0, 5)}
                    </div>
                  </div>
                  <span className={statusColors[apt.status] || 'badge-gray'}>{apt.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCalendar className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-400 text-sm">No upcoming appointments</p>
              <Link href="/patient/appointments" className="btn-primary mt-3 text-sm inline-flex">
                <FiPlus size={14} /> Book Appointment
              </Link>
            </div>
          )}
        </div>

        {/* Latest Vitals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Latest Vitals</h3>
            <Link href="/patient/vitals" className="text-primary-600 text-sm hover:text-primary-700 font-medium flex items-center gap-1">
              Track <FiChevronRight size={14} />
            </Link>
          </div>
          {vitals ? (
            <div className="space-y-3">
              {[
                { label: 'Blood Pressure', value: vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}` : '--', unit: 'mmHg', icon: '🫀', abnormal: vitals.bloodPressureSystolic > 140 },
                { label: 'Heart Rate', value: vitals.heartRate || '--', unit: 'bpm', icon: '💓', abnormal: vitals.heartRate > 100 || vitals.heartRate < 60 },
                { label: 'Temperature', value: vitals.temperature || '--', unit: '°C', icon: '🌡️', abnormal: vitals.temperature > 37.5 },
                { label: 'SpO2', value: vitals.oxygenSaturation || '--', unit: '%', icon: '🫁', abnormal: vitals.oxygenSaturation < 95 },
                { label: 'BMI', value: vitals.bmi || '--', unit: '', icon: '⚖️', abnormal: vitals.bmi > 30 || vitals.bmi < 18.5 },
              ].map((v, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{v.icon}</span>
                    <span className="text-sm text-gray-600">{v.label}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${v.abnormal ? 'text-red-600' : 'text-gray-900'}`}>{v.value}</span>
                    <span className="text-xs text-gray-400 ml-1">{v.unit}</span>
                    {v.abnormal && <FiAlertCircle className="inline ml-1 text-red-500" size={12} />}
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">Recorded: {format(new Date(vitals.recordedAt), 'MMM dd, yyyy')}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiActivity className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="text-gray-400 text-sm">No vitals recorded</p>
              <Link href="/patient/vitals" className="btn-primary mt-3 text-sm inline-flex">
                <FiPlus size={14} /> Record Vitals
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="section-title">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Book Appointment', icon: FiCalendar, href: '/patient/appointments', color: 'text-blue-600 bg-blue-50' },
            { label: 'View Lab Results', icon: FiFileText, href: '/patient/lab-results', color: 'text-purple-600 bg-purple-50' },
            { label: 'Track Medication', icon: FiHeart, href: '/patient/medications', color: 'text-rose-600 bg-rose-50' },
            { label: 'Log Vitals', icon: FiActivity, href: '/patient/vitals', color: 'text-teal-600 bg-teal-50' },
          ].map((action, i) => (
            <Link key={i} href={action.href} className={`flex flex-col items-center gap-2 p-4 ${action.color} rounded-xl hover:opacity-80 transition-opacity`}>
              <action.icon size={22} />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
