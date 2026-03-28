'use client';
import { useState, useEffect } from 'react';
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const deptIcons = ['❤️', '🧠', '🦴', '👶', '🩺', '🔬', '🌸', '👁️', '🦷', '💉', '🏥', '🧬'];

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '🏥' });

  const load = () => {
    adminAPI.getDepartments()
      .then(r => setDepartments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name) { toast.error('Department name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await adminAPI.updateDepartment(editId, form);
        toast.success('Department updated');
      } else {
        await adminAPI.createDepartment(form);
        toast.success('Department created');
      }
      setShowModal(false);
      setForm({ name: '', description: '', icon: '🏥' });
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, description: dept.description || '', icon: dept.icon || '🏥' });
    setEditId(dept.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this department?')) return;
    try { await adminAPI.deleteDepartment(id); toast.success('Deactivated'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Departments</h1>
        <button onClick={() => { setEditId(null); setForm({ name: '', description: '', icon: '🏥' }); setShowModal(true); }} className="btn-primary">
          <FiPlus size={16} /> Add Department
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.length === 0 ? (
            <div className="col-span-3 card text-center py-12">
              <FiGrid className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-400">No departments yet</p>
            </div>
          ) : departments.map(dept => (
            <div key={dept.id} className="card hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{dept.icon || '🏥'}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{dept.name}</h3>
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{dept.description || 'No description'}</p>
                    {dept.doctors?.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <FiUsers size={11} />
                        <span>{dept.doctors.length} doctors</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(dept)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"><FiEdit2 size={13} /></button>
                  <button onClick={() => handleDelete(dept.id)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"><FiTrash2 size={13} /></button>
                </div>
              </div>
              {dept.doctors?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1">
                  {dept.doctors.slice(0, 3).map((d, i) => (
                    <span key={i} className="text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full">Dr. {d.user?.firstName} {d.user?.lastName}</span>
                  ))}
                  {dept.doctors.length > 3 && <span className="text-xs text-gray-400">+{dept.doctors.length - 3} more</span>}
                </div>
              )}
              <div className="mt-2">
                <span className={`badge ${dept.isActive ? 'badge-green' : 'badge-red'}`}>{dept.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Department' : 'New Department'}>
        <div className="space-y-4">
          <div>
            <label className="label">Department Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Cardiology" className="input-field" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Brief description..." />
          </div>
          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {deptIcons.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-10 h-10 text-xl rounded-lg transition-all ${form.icon === icon ? 'bg-primary-100 border-2 border-primary-400' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
