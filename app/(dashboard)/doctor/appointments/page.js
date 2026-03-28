'use client';
import { useState, useEffect } from 'react';
import { FiCalendar, FiSearch, FiCheck, FiX, FiEdit2, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { appointmentAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const statusColors = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red', 'no-show': 'badge-gray' };

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    appointmentAPI.getAppointments(params)
      .then(r => setAppointments(r.data.data?.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentAPI.updateAppointment(id, { status });
      toast.success(`Appointment ${status}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await appointmentAPI.updateAppointment(selected.id, { notes, diagnosis, status: 'completed' });
      toast.success('Notes saved and appointment completed');
      setSelected(null);
      load();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Appointments</h1>
      </div>

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

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="card text-center py-12">
              <FiCalendar className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-400">No appointments found</p>
            </div>
          ) : appointments.map(apt => (
            <div key={apt.id} className="card hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                    {`${apt.patient?.user?.firstName?.[0]}${apt.patient?.user?.lastName?.[0]}`}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">{apt.patient?.user?.firstName} {apt.patient?.user?.lastName}</div>
                    <div className="text-gray-500 text-sm">{apt.reason || 'Consultation'}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{format(new Date(apt.appointmentDate + 'T00:00:00'), 'EEEE, MMM dd, yyyy')}</span>
                      <span>{apt.appointmentTime?.slice(0, 5)}</span>
                      <span className="capitalize">{apt.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={statusColors[apt.status] || 'badge-gray'}>{apt.status}</span>
                  <div className="flex gap-1">
                    {apt.status === 'pending' && (
                      <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg">
                        <FiCheck size={13} />
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(apt.status) && (
                      <>
                        <button onClick={() => { setSelected(apt); setNotes(apt.notes || ''); setDiagnosis(apt.diagnosis || ''); }} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg">
                          <FiX size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {apt.diagnosis && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                  <span className="font-medium text-gray-600">Diagnosis: </span>
                  <span className="text-gray-500">{apt.diagnosis}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Complete Appointment">
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="font-semibold text-gray-900">{selected.patient?.user?.firstName} {selected.patient?.user?.lastName}</div>
              <div className="text-sm text-gray-500 mt-1">{format(new Date(selected.appointmentDate + 'T00:00:00'), 'MMMM dd, yyyy')} at {selected.appointmentTime?.slice(0, 5)}</div>
              {selected.reason && <div className="text-sm text-gray-600 mt-1">Reason: {selected.reason}</div>}
            </div>
            <div>
              <label className="label">Diagnosis</label>
              <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={3} className="input-field resize-none" placeholder="Enter diagnosis..." />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="input-field resize-none" placeholder="Clinical notes, observations..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSaveNotes} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Complete & Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
