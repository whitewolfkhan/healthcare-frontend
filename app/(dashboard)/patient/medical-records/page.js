'use client';
import { useState, useEffect, useRef } from 'react';
import { FiFileText, FiDownload, FiSearch, FiUpload, FiPlus, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const typeColors = {
  diagnosis: 'badge-red', treatment: 'badge-blue', surgery: 'badge-purple',
  vaccination: 'badge-green', allergy: 'badge-yellow', chronic: 'badge-gray', other: 'badge-gray',
};

const recordTypes = ['diagnosis', 'treatment', 'surgery', 'vaccination', 'allergy', 'chronic', 'other'];

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const fileRef = useRef();
  const [form, setForm] = useState({ title: '', type: 'other', description: '', date: new Date().toISOString().split('T')[0] });

  const load = () => {
    const params = typeFilter ? { type: typeFilter } : {};
    api.get('/medical-records', { params })
      .then(r => setRecords(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [typeFilter]);

  const handleUpload = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setUploading(true);
    const formData = new FormData();
    const file = fileRef.current?.files[0];
    if (file) formData.append('file', file);
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    try {
      await api.post('/medical-records', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Record added');
      setShowUpload(false);
      setForm({ title: '', type: 'other', description: '', date: new Date().toISOString().split('T')[0] });
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const filtered = records.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Medical Records</h1>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <FiPlus size={16} /> Add Record
        </button>
      </div>

      <div className="card space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="input-field pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTypeFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!typeFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
          {recordTypes.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${typeFilter === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-12">
              <FiFileText className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-400 font-medium mb-1">No medical records found</p>
              <p className="text-gray-300 text-sm">Add your medical history or upload documents</p>
              <button onClick={() => setShowUpload(true)} className="btn-primary mt-4 inline-flex"><FiPlus size={16} /> Add Record</button>
            </div>
          ) : filtered.map(record => (
            <div key={record.id} className="card hover:shadow-md cursor-pointer transition-all group" onClick={() => setSelected(record)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiFileText className="text-blue-500" size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{record.title}</h3>
                      <span className={`badge ${typeColors[record.type] || 'badge-gray'} capitalize`}>{record.type}</span>
                    </div>
                    {record.description && <p className="text-gray-500 text-sm line-clamp-1">{record.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>{format(new Date(record.date), 'MMMM dd, yyyy')}</span>
                      {record.uploader && <span>by {record.uploader.firstName} {record.uploader.lastName}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {record.fileUrl && <FiDownload className="text-gray-400 group-hover:text-primary-600 transition-colors" size={16} />}
                  <FiEye className="text-gray-400 group-hover:text-primary-600 transition-colors" size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Medical Record'} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-0.5">Type</div>
                <span className={`badge capitalize ${typeColors[selected.type] || 'badge-gray'}`}>{selected.type}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-0.5">Date</div>
                <div className="font-medium text-gray-900">{format(new Date(selected.date), 'MMMM dd, yyyy')}</div>
              </div>
              {selected.uploader && (
                <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-0.5">Added by</div>
                  <div className="font-medium text-gray-900">{selected.uploader.firstName} {selected.uploader.lastName} ({selected.uploader.role})</div>
                </div>
              )}
            </div>
            {selected.description && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{selected.description}</p>
              </div>
            )}
            {selected.tags?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">{selected.tags.map((t, i) => <span key={i} className="badge badge-gray">{t}</span>)}</div>
              </div>
            )}
            {selected.fileUrl && (
              <div className="pt-2">
                <a href={`${BACKEND}${selected.fileUrl}`} target="_blank" rel="noopener noreferrer" download={selected.fileName} className="btn-secondary inline-flex">
                  <FiDownload size={14} /> Download {selected.fileName || 'Document'}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Record Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Add Medical Record">
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Blood Test Report, Surgery Record" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                {recordTypes.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Brief description of this medical record..." />
          </div>
          <div>
            <label className="label">Attach Document (optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-primary-400 transition-colors" onClick={() => fileRef.current?.click()}>
              <FiUpload className="mx-auto text-gray-400 mb-1.5" size={20} />
              <p className="text-sm text-gray-500">PDF, DOC, JPG, PNG (max 10MB)</p>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowUpload(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleUpload} disabled={uploading} className="btn-primary flex-1">
              {uploading ? 'Saving...' : 'Add Record'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
