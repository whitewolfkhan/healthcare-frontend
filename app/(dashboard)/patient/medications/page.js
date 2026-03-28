'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiHeart, FiCheck, FiX, FiEdit2, FiTrash2, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format, isToday, isFuture } from 'date-fns';
import { medicationAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const frequencyLabels = {
  once_daily: 'Once Daily', twice_daily: 'Twice Daily', three_times_daily: '3x Daily',
  four_times_daily: '4x Daily', every_6_hours: 'Every 6h', every_8_hours: 'Every 8h',
  as_needed: 'As Needed', weekly: 'Weekly', monthly: 'Monthly',
};

export default function PatientMedications() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: 'once_daily', times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0], endDate: '',
    instructions: '', purpose: '',
  });

  const load = () => {
    medicationAPI.getMedications({ status: statusFilter || undefined })
      .then(r => setMedications(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleSave = async () => {
    if (!form.name || !form.dosage) { toast.error('Name and dosage are required'); return; }
    setSaving(true);
    try {
      await medicationAPI.createMedication(form);
      toast.success('Medication added!');
      setShowModal(false);
      setForm({ name: '', dosage: '', frequency: 'once_daily', times: ['08:00'], startDate: new Date().toISOString().split('T')[0], endDate: '', instructions: '', purpose: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const handleLogAdherence = async (id, taken) => {
    try {
      await medicationAPI.logAdherence(id, { date: new Date().toISOString().split('T')[0], taken });
      toast.success(taken ? 'Marked as taken!' : 'Marked as skipped');
      load();
    } catch { toast.error('Failed to log'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this medication?')) return;
    try { await medicationAPI.deleteMedication(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Medications</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus size={16} /> Add Medication
        </button>
      </div>

      <div className="flex gap-2">
        {['active', 'completed', 'discontinued', ''].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {medications.length === 0 ? (
            <div className="col-span-2 card text-center py-12">
              <FiHeart className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-400">No medications found</p>
              <button onClick={() => setShowModal(true)} className="btn-primary mt-4 inline-flex">
                <FiPlus size={16} /> Add Medication
              </button>
            </div>
          ) : medications.map(med => {
            const todayAdherence = med.adherence?.find(a => a.date === new Date().toISOString().split('T')[0]);
            const adherenceRate = med.adherence?.length > 0
              ? Math.round((med.adherence.filter(a => a.taken).length / med.adherence.length) * 100) : 0;

            return (
              <div key={med.id} className="card hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{med.name}</h3>
                      <span className={`badge ${med.status === 'active' ? 'badge-green' : med.status === 'completed' ? 'badge-blue' : 'badge-gray'}`}>{med.status}</span>
                    </div>
                    <div className="text-gray-600 text-sm mt-0.5">{med.dosage} · {frequencyLabels[med.frequency]}</div>
                    {med.purpose && <div className="text-gray-400 text-xs mt-0.5">{med.purpose}</div>}
                  </div>
                  <button onClick={() => handleDelete(med.id)} className="text-gray-300 hover:text-red-500 p-1">
                    <FiTrash2 size={14} />
                  </button>
                </div>

                {med.times?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {med.times.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        <FiClock size={10} /> {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Started: {format(new Date(med.startDate), 'MMM dd, yyyy')}</span>
                  {med.endDate && <span>Ends: {format(new Date(med.endDate), 'MMM dd, yyyy')}</span>}
                </div>

                {med.adherence?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Adherence Rate</span>
                      <span className={`text-xs font-semibold ${adherenceRate >= 80 ? 'text-emerald-600' : adherenceRate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{adherenceRate}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${adherenceRate >= 80 ? 'bg-emerald-500' : adherenceRate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${adherenceRate}%` }} />
                    </div>
                  </div>
                )}

                {med.status === 'active' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    {todayAdherence ? (
                      <div className={`flex-1 text-center text-xs py-2 rounded-lg font-medium ${todayAdherence.taken ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {todayAdherence.taken ? '✅ Taken today' : '❌ Skipped today'}
                      </div>
                    ) : (
                      <>
                        <button onClick={() => handleLogAdherence(med.id, true)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors">
                          <FiCheck size={12} /> Taken
                        </button>
                        <button onClick={() => handleLogAdherence(med.id, false)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors">
                          <FiX size={12} /> Skipped
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Medication">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Medication Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Amlodipine, Metformin" className="input-field" />
            </div>
            <div>
              <label className="label">Dosage *</label>
              <input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                placeholder="e.g., 5mg, 500mg" className="input-field" />
            </div>
            <div>
              <label className="label">Frequency</label>
              <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="input-field">
                {Object.entries(frequencyLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">End Date (optional)</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="label">Purpose / Condition</label>
              <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                placeholder="e.g., Blood pressure, Diabetes" className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="label">Instructions</label>
              <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                placeholder="e.g., Take with food, avoid grapefruit" rows={2} className="input-field resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Add Medication'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
