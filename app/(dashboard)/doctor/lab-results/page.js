'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiFileText, FiEdit2, FiAlertCircle, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { labResultAPI, patientAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const categories = ['blood', 'urine', 'imaging', 'biopsy', 'microbiology', 'chemistry', 'hematology', 'other'];

export default function DoctorLabResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ patientId: '', testName: '', testDate: new Date().toISOString().split('T')[0], category: 'blood', labName: '', summary: '', interpretation: '', doctorNotes: '', isAbnormal: false, resultDate: '', results: '[]' });

  const load = () => {
    labResultAPI.getLabResults()
      .then(r => setResults(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (showModal) patientAPI.getAllPatients({ limit: 100 }).then(r => setPatients(r.data.data?.patients || [])).catch(() => {});
  }, [showModal]);

  const handleSave = async () => {
    if (!form.patientId || !form.testName) { toast.error('Patient and test name required'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (editId) {
        await labResultAPI.updateLabResult(editId, { summary: form.summary, interpretation: form.interpretation, doctorNotes: form.doctorNotes, status: form.resultDate ? 'completed' : 'pending', resultDate: form.resultDate, isAbnormal: form.isAbnormal, results: form.results });
        toast.success('Lab result updated');
      } else {
        await labResultAPI.createLabResult(formData);
        toast.success('Lab result added');
      }
      setShowModal(false);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const filtered = results.filter(r => r.testName?.toLowerCase().includes(search.toLowerCase()) || r.patient?.user?.firstName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Lab Results</h1>
        <button onClick={() => { setEditId(null); setForm({ patientId: '', testName: '', testDate: new Date().toISOString().split('T')[0], category: 'blood', labName: '', summary: '', interpretation: '', doctorNotes: '', isAbnormal: false, resultDate: '' }); setShowModal(true); }} className="btn-primary">
          <FiPlus size={16} /> Add Result
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by test name or patient..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-12"><FiFileText className="mx-auto text-gray-300 mb-3" size={40} /><p className="text-gray-400">No lab results found</p></div>
          ) : filtered.map(r => (
            <div key={r.id} className="card hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{r.testName}</h3>
                    {r.isAbnormal && <FiAlertCircle className="text-red-500" size={14} />}
                  </div>
                  <div className="text-gray-600 text-sm">Patient: {r.patient?.user?.firstName} {r.patient?.user?.lastName}</div>
                  <div className="text-gray-400 text-xs mt-1 flex gap-3">
                    <span>Test: {format(new Date(r.testDate), 'MMM dd, yyyy')}</span>
                    {r.labName && <span>Lab: {r.labName}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`badge ${r.status === 'completed' ? 'badge-green' : r.status === 'reviewed' ? 'badge-blue' : 'badge-yellow'}`}>{r.status}</span>
                  {r.isAbnormal && <span className="badge badge-red">Abnormal</span>}
                  <button onClick={() => { setForm({ ...r, results: JSON.stringify(r.results), isAbnormal: r.isAbnormal }); setEditId(r.id); setShowModal(true); }} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg">
                    <FiEdit2 size={13} />
                  </button>
                </div>
              </div>
              {r.summary && <p className="text-gray-500 text-sm mt-2 line-clamp-1">{r.summary}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Update Lab Result' : 'Add Lab Result'} size="lg">
        <div className="space-y-4">
          {!editId && (
            <>
              <div>
                <label className="label">Patient *</label>
                <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))} className="input-field">
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.user?.firstName} {p.user?.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Test Name *</label>
                  <input value={form.testName} onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} placeholder="e.g., CBC, HbA1c" className="input-field" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div><label className="label">Test Date</label><input type="date" value={form.testDate} onChange={e => setForm(f => ({ ...f, testDate: e.target.value }))} className="input-field" /></div>
                <div><label className="label">Lab Name</label><input value={form.labName || ''} onChange={e => setForm(f => ({ ...f, labName: e.target.value }))} className="input-field" placeholder="Lab/Hospital name" /></div>
              </div>
            </>
          )}
          <div><label className="label">Result Date</label><input type="date" value={form.resultDate || ''} onChange={e => setForm(f => ({ ...f, resultDate: e.target.value }))} className="input-field" /></div>
          <div><label className="label">Summary</label><textarea value={form.summary || ''} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Brief summary of results..." /></div>
          <div><label className="label">Interpretation</label><textarea value={form.interpretation || ''} onChange={e => setForm(f => ({ ...f, interpretation: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Clinical interpretation..." /></div>
          <div><label className="label">Doctor Notes</label><textarea value={form.doctorNotes || ''} onChange={e => setForm(f => ({ ...f, doctorNotes: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Notes for patient..." /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isAbnormal} onChange={e => setForm(f => ({ ...f, isAbnormal: e.target.checked }))} className="rounded border-gray-300 text-red-500" id="abnormal" />
            <label htmlFor="abnormal" className="text-sm font-medium text-gray-700">Mark as Abnormal</label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editId ? 'Update' : 'Add Result'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
