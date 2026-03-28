'use client';
import { useState, useEffect, useRef } from 'react';
import { FiImage, FiUpload, FiEye, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { medicalImageAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const imageTypes = ['xray', 'mri', 'ct', 'ultrasound', 'ecg', 'other'];
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function PatientMedicalImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const fileRef = useRef();
  const [form, setForm] = useState({ title: '', imageType: 'xray', bodyPart: '', description: '' });

  const load = () => {
    const params = filter ? { imageType: filter } : {};
    medicalImageAPI.getMedicalImages(params)
      .then(r => setImages(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleUpload = async () => {
    const file = fileRef.current?.files[0];
    if (!file) { toast.error('Please select a file'); return; }
    if (!form.title) { toast.error('Title is required'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    try {
      await medicalImageAPI.uploadImage(formData);
      toast.success('Image uploaded successfully!');
      setShowUpload(false);
      setForm({ title: '', imageType: 'xray', bodyPart: '', description: '' });
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const typeColors = { xray: 'badge-gray', mri: 'badge-purple', ct: 'badge-blue', ultrasound: 'badge-teal', ecg: 'badge-yellow', other: 'badge-gray' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Medical Images</h1>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <FiUpload size={16} /> Upload Image
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!filter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {imageTypes.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.toUpperCase()}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        images.length === 0 ? (
          <div className="card text-center py-12">
            <FiImage className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-400 mb-4">No medical images found</p>
            <button onClick={() => setShowUpload(true)} className="btn-primary inline-flex"><FiUpload size={16} /> Upload Your First Image</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="card p-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelected(img)}>
                <div className="h-40 bg-gray-900 flex items-center justify-center overflow-hidden relative">
                  {img.mimeType?.startsWith('image/') ? (
                    <img src={`${BACKEND}${img.fileUrl}`} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <FiImage size={32} />
                      <span className="text-xs mt-1">{img.imageType?.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiEye className="text-white" size={24} />
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-medium text-gray-900 text-sm truncate">{img.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{format(new Date(img.date), 'MMM dd, yyyy')}</span>
                    <span className={`badge ${img.imageType === 'xray' ? 'badge-gray' : img.imageType === 'mri' ? 'badge-purple' : 'badge-blue'} text-xs`}>{img.imageType?.toUpperCase()}</span>
                  </div>
                  {img.isReviewed && <div className="text-xs text-emerald-600 mt-1 font-medium">✓ Reviewed by doctor</div>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* View Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Medical Image'} size="xl">
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl overflow-hidden" style={{ minHeight: 300 }}>
              {selected.mimeType?.startsWith('image/') ? (
                <img src={`${BACKEND}${selected.fileUrl}`} alt={selected.title} className="w-full max-h-96 object-contain" />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400 flex-col gap-3">
                  <FiImage size={48} />
                  <p className="text-sm">DICOM/Special format - Download to view</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div><span className="text-gray-500">Type:</span> <span className="font-medium ml-1 uppercase">{selected.imageType}</span></div>
              {selected.bodyPart && <div><span className="text-gray-500">Body Part:</span> <span className="font-medium ml-1">{selected.bodyPart}</span></div>}
              <div><span className="text-gray-500">Date:</span> <span className="font-medium ml-1">{format(new Date(selected.date), 'MMMM dd, yyyy')}</span></div>
            </div>
            {selected.description && <div><h4 className="font-semibold text-gray-800 mb-1">Description</h4><p className="text-gray-600 text-sm">{selected.description}</p></div>}
            {selected.findings && <div className="bg-blue-50 p-4 rounded-xl"><h4 className="font-semibold text-blue-800 mb-1">Radiologist Findings</h4><p className="text-blue-700 text-sm">{selected.findings}</p></div>}
            {selected.radiologistNotes && <div><h4 className="font-semibold text-gray-800 mb-1">Doctor Notes</h4><p className="text-gray-600 text-sm">{selected.radiologistNotes}</p></div>}
            <a href={`${BACKEND}${selected.fileUrl}`} download={selected.fileName} className="btn-secondary inline-flex">Download Image</a>
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Medical Image">
        <div className="space-y-4">
          <div>
            <label className="label">Image File *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors" onClick={() => fileRef.current?.click()}>
              <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-sm text-gray-500">Click to select image (JPG, PNG, DICOM)</p>
              <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*,.dcm" className="hidden" onChange={e => { if (e.target.files[0] && !form.title) setForm(f => ({ ...f, title: e.target.files[0].name.split('.')[0] })); }} />
          </div>
          <div>
            <label className="label">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Chest X-Ray, Brain MRI" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Image Type</label>
              <select value={form.imageType} onChange={e => setForm(f => ({ ...f, imageType: e.target.value }))} className="input-field">
                {imageTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Body Part</label>
              <input value={form.bodyPart} onChange={e => setForm(f => ({ ...f, bodyPart: e.target.value }))} placeholder="e.g., Chest, Head, Knee" className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Brief description of the imaging..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowUpload(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleUpload} disabled={uploading} className="btn-primary flex-1">
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
