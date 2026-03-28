'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiFileText, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { prescriptionAPI, patientAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const emptyMed = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ patientId: '', diagnosis: '', medications: [{ ...emptyMed }], instructions: '', nextVisitDate: '', notes: '' });

  const load = () => {
    prescriptionAPI.getPrescriptions()
      .then(r => setPrescriptions(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (showModal) patientAPI.getAllPatients({ limit: 100 }).then(r => setPatients(r.data.data?.patients || [])).catch(() => {});
  }, [showModal]);

  const handleSave = async () => {
    if (!form.patientId || !form.diagnosis) { toast.error('Patient and diagnosis are required'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await prescriptionAPI.updatePrescription(editingId, form);
        toast.success('Prescription updated');
      } else {
        await prescriptionAPI.createPrescription(form);
        toast.success('Prescription created');
      }
      setShowModal(false);
      setForm({ patientId: '', diagnosis: '', medications: [{ ...emptyMed }], instructions: '', nextVisitDate: '', notes: '' });
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const addMed = () => setForm(f => ({ ...f, medications: [...f.medications, { ...emptyMed }] }));
  const removeMed = (i) => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));
  const updateMed = (i, field, value) => setForm(f => ({ ...f, medications: f.medications.map((m, idx) => idx === i ? { ...m, [field]: value } : m) }));

  const handleEdit = (p) => {
    setForm({ patientId: p.patientId, diagnosis: p.diagnosis, medications: p.medications || [{ ...emptyMed }], instructions: p.instructions || '', nextVisitDate: p.nextVisitDate || '', notes: p.notes || '' });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prescription?')) return;
    try { await prescriptionAPI.deletePrescription(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Prescriptions</h1>
        <button onClick={() => { setEditingId(null); setForm({ patientId: '', diagnosis: '', medications: [{ ...emptyMed }], instructions: '', nextVisitDate: '', notes: '' }); setShowModal(true); }} className="btn-primary">
          <FiPlus size={16} /> New Prescription
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {prescriptions.length === 0 ? (
            <div className="card text-center py-12">
              <FiFileText className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-400">No prescriptions yet</p>
            </div>
          ) : prescriptions.map(p => (
            <div key={p.id} className="card hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-gray-900">{p.patient?.user?.firstName} {p.patient?.user?.lastName}</div>
                    <span className={`badge ${p.status === 'active' ? 'badge-green' : p.status === 'completed' ? 'badge-blue' : 'badge-gray'}`}>{p.status}</span>
                  </div>
                  <p className="text-gray-600 text-sm"><span className="font-medium">Diagnosis:</span> {p.diagnosis}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.medications?.map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">{m.name} {m.dosage}</span>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-1.5">Issued: {format(new Date(p.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(p)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"><FiEdit2 size={13} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"><FiTrash2 size={13} /></button>
                </div>
              </div>
              {p.nextVisitDate && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Next visit: {format(new Date(p.nextVisitDate), 'MMMM dd, yyyy')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Prescription' : 'New Prescription'} size="xl">
        <div className="space-y-5">
          <div>
            <label className="label">Patient *</label>
            <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-field">
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.user?.firstName} {p.user?.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Diagnosis *</label>
            <textarea value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Enter diagnosis..." />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Medications</label>
              <button onClick={addMed} className="text-primary-600 text-sm hover:text-primary-700 font-medium flex items-center gap-1"><FiPlus size={14} /> Add</button>
            </div>
            <div className="space-y-3">
              {form.medications.map((med, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 relative">
                  {form.medications.length > 1 && (
                    <button onClick={() => removeMed(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><FiX size={14} /></button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label text-xs">Drug Name</label><input value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} placeholder="e.g., Paracetamol" className="input-field text-sm" /></div>
                    <div><label className="label text-xs">Dosage</label><input value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="e.g., 500mg" className="input-field text-sm" /></div>
                    <div><label className="label text-xs">Frequency</label><input value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} placeholder="e.g., 3x daily" className="input-field text-sm" /></div>
                    <div><label className="label text-xs">Duration</label><input value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} placeholder="e.g., 7 days" className="input-field text-sm" /></div>
                    <div className="col-span-2"><label className="label text-xs">Instructions</label><input value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} placeholder="e.g., After meals" className="input-field text-sm" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Next Visit Date</label>
              <input type="date" value={form.nextVisitDate} onChange={e => setForm(f => ({ ...f, nextVisitDate: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Additional Instructions</label>
            <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Diet, lifestyle, follow-up instructions..." />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create Prescription'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
