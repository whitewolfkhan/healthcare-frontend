'use client';
import { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiEdit2, FiUserX, FiUserCheck, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { adminAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = { page, limit: 15 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    adminAPI.getAllUsers(params)
      .then(r => {
        setUsers(r.data.data?.users || []);
        setTotal(r.data.data?.total || 0);
        setTotalPages(r.data.data?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, roleFilter, page]);

  const handleToggleActive = async (user) => {
    try {
      if (!user.isActive) {
        await adminAPI.updateUser(user.id, { isActive: true });
        toast.success('User activated');
      } else {
        await adminAPI.deleteUser(user.id);
        toast.success('User deactivated');
      }
      load();
    } catch { toast.error('Failed'); }
  };

  const handleUpdateUser = async () => {
    setSaving(true);
    try {
      await adminAPI.updateUser(editUser.id, { firstName: editUser.firstName, lastName: editUser.lastName, email: editUser.email, phone: editUser.phone, role: editUser.role });
      toast.success('User updated');
      setEditUser(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const roleBadge = { patient: 'badge-blue', doctor: 'badge-teal', admin: 'badge-purple' };
  const roleColors = { patient: 'bg-blue-100 text-blue-700', doctor: 'bg-teal-100 text-teal-700', admin: 'bg-purple-100 text-purple-700' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="page-title">User Management</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{total} users</span>
      </div>

      {/* Search + Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="input-field pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['', 'patient', 'doctor', 'admin'].map(r => (
              <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize flex-1 sm:flex-none ${roleFilter === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Desktop Table */}
          <div className="card overflow-hidden p-0 hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Role', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                          {u.avatar
                            ? <img src={BACKEND_URL + u.avatar} className="w-full h-full object-cover" />
                            : <div className={`w-full h-full flex items-center justify-center font-bold text-xs ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.firstName?.[0]}{u.lastName?.[0]}</div>}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{u.firstName} {u.lastName}</div>
                          <div className="text-gray-400 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${roleBadge[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{u.phone || '--'}</td>
                    <td className="px-4 py-3"><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{format(new Date(u.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditUser({ ...u })} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit"><FiEdit2 size={13} /></button>
                        <button onClick={() => handleToggleActive(u)} className={`p-1.5 rounded-lg ${u.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`} title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <FiUserX size={13} /> : <FiUserCheck size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">No users found</div>
            ) : users.map(u => (
              <div key={u.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
                      {u.avatar
                        ? <img src={BACKEND_URL + u.avatar} className="w-full h-full object-cover" />
                        : <div className={`w-full h-full flex items-center justify-center font-bold text-sm ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.firstName?.[0]}{u.lastName?.[0]}</div>}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{u.firstName} {u.lastName}</div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5 truncate"><FiMail size={10} /> {u.email}</div>
                      {u.phone && <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5"><FiPhone size={10} /> {u.phone}</div>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => setEditUser({ ...u })} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleToggleActive(u)} className={`p-2 rounded-lg ${u.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                      {u.isActive ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`badge ${roleBadge[u.role] || 'badge-gray'}`}>{u.role}</span>
                  <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><FiCalendar size={10} /> {format(new Date(u.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-4 text-sm">Prev</button>
              <span className="text-sm text-gray-600 px-2">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary py-1.5 px-4 text-sm">Next</button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="label">First Name</label><input value={editUser.firstName} onChange={e => setEditUser(u => ({ ...u, firstName: e.target.value }))} className="input-field" /></div>
              <div><label className="label">Last Name</label><input value={editUser.lastName} onChange={e => setEditUser(u => ({ ...u, lastName: e.target.value }))} className="input-field" /></div>
              <div className="col-span-full"><label className="label">Email</label><input value={editUser.email} onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))} className="input-field" /></div>
              <div><label className="label">Phone</label><input value={editUser.phone || ''} onChange={e => setEditUser(u => ({ ...u, phone: e.target.value }))} className="input-field" /></div>
              <div>
                <label className="label">Role</label>
                <select value={editUser.role} onChange={e => setEditUser(u => ({ ...u, role: e.target.value }))} className="input-field">
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditUser(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleUpdateUser} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
