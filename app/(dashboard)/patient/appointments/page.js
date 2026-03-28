'use client';
import { useState, useEffect } from 'react';
import { FiCalendar, FiPlus, FiSearch, FiClock, FiX, FiUser, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { appointmentAPI, doctorAPI, departmentAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const statusColors = {
  pending: 'badge-yellow', confirmed: 'badge-blue',
  completed: 'badge-green', cancelled: 'badge-red', 'no-show': 'badge-gray',
};

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [type, setType] = useState('consultation');
  const [booking, setBooking] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');

  const loadAppointments = () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    appointmentAPI.getAppointments(params)
      .then(r => setAppointments(r.data.data?.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAppointments(); }, [statusFilter]);

  useEffect(() => {
    if (showBookModal) {
      doctorAPI.getAllDoctors({ isAvailable: true }).then(r => setDoctors(r.data.data || [])).catch(() => {});
    }
  }, [showBookModal]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      appointmentAPI.getAvailableSlots(selectedDoctor, selectedDate)
        .then(r => setSlots(r.data.data || []))
        .catch(() => setSlots([]));
    }
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please select doctor, date and time slot');
      return;
    }
    setBooking(true);
    try {
      await appointmentAPI.createAppointment({
        doctorId: selectedDoctor, appointmentDate: selectedDate,
        appointmentTime: selectedTime, type, reason,
      });
      toast.success('Appointment booked successfully!');
      setShowBookModal(false);
      setSelectedDoctor(''); setSelectedDate(''); setSelectedTime(''); setReason('');
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancelAppointment(id, 'Cancelled by patient');
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const filteredDoctors = doctors.filter(d =>
    `${d.user?.firstName} ${d.user?.lastName} ${d.specialization}`.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">My Appointments</h1>
        <button onClick={() => setShowBookModal(true)} className="btn-primary">
          <FiPlus size={16} /> Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="card text-center py-12">
              <FiCalendar className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 font-medium">No appointments found</p>
              <button onClick={() => setShowBookModal(true)} className="btn-primary mt-4 inline-flex">
                <FiPlus size={16} /> Book your first appointment
              </button>
            </div>
          ) : appointments.map(apt => (
            <div key={apt.id} className="card hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-700 font-bold text-sm overflow-hidden">
                    {apt.doctor?.user?.avatar ? <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${apt.doctor.user.avatar}`} className="w-full h-full object-cover" alt="" /> : `${apt.doctor?.user?.firstName?.[0]}${apt.doctor?.user?.lastName?.[0]}`}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</div>
                    <div className="text-gray-500 text-sm">{apt.doctor?.specialization}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FiCalendar size={11} /> {format(new Date(apt.appointmentDate + 'T00:00:00'), 'EEEE, MMM dd, yyyy')}</span>
                      <span className="flex items-center gap-1"><FiClock size={11} /> {apt.appointmentTime?.slice(0, 5)}</span>
                    </div>
                    {apt.reason && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{apt.reason}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={statusColors[apt.status] || 'badge-gray'}>{apt.status}</span>
                  <span className="text-xs text-gray-400 capitalize">{apt.type}</span>
                  {['pending', 'confirmed'].includes(apt.status) && (
                    <button onClick={() => handleCancel(apt.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <FiX size={12} /> Cancel
                    </button>
                  )}
                  {apt.fee && <span className="text-xs font-medium text-gray-700">৳{apt.fee}</span>}
                </div>
              </div>
              {apt.diagnosis && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-600">Diagnosis: </span>
                  <span className="text-xs text-gray-500">{apt.diagnosis}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)} title="Book New Appointment" size="lg">
        <div className="space-y-5">
          {/* Doctor Search */}
          <div>
            <label className="label">Search Doctor</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input value={searchDoctor} onChange={e => setSearchDoctor(e.target.value)}
                placeholder="Search by name or specialization..." className="input-field pl-9" />
            </div>
          </div>

          {/* Doctor List */}
          <div>
            <label className="label">Select Doctor</label>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {filteredDoctors.map(d => (
                <button key={d.id} onClick={() => setSelectedDoctor(d.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${selectedDoctor === d.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                    <FiUser size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">Dr. {d.user?.firstName} {d.user?.lastName}</div>
                    <div className="text-xs text-gray-500">{d.specialization}</div>
                  </div>
                  {d.consultationFee && <div className="text-sm font-semibold text-primary-600 flex-shrink-0">৳{d.consultationFee}</div>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Appointment Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} className="input-field" />
            </div>
            <div>
              <label className="label">Appointment Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="input-field">
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="telemedicine">Telemedicine</option>
              </select>
            </div>
          </div>

          {/* Time Slots */}
          {slots.length > 0 && (
            <div>
              <label className="label">Available Time Slots</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {slots.map(slot => (
                  <button key={slot.time} onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${!slot.available ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : selectedTime === slot.time ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400'}`}>
                    {slot.time.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label">Reason / Symptoms (optional)</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Describe your symptoms or reason for visit..." rows={3} className="input-field resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowBookModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleBook} disabled={booking} className="btn-primary flex-1">
              {booking ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Booking...</span> : <><FiCheck size={16} /> Confirm Booking</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
