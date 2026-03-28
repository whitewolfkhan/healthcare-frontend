'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiActivity, FiAlertCircle, FiTrendingUp, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { vitalAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

export default function PatientVitals() {
  const [vitals, setVitals] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeChart, setActiveChart] = useState('bp');
  const [form, setForm] = useState({
    bloodPressureSystolic: '', bloodPressureDiastolic: '', heartRate: '',
    temperature: '', oxygenSaturation: '', weight: '', height: '',
    bloodGlucose: '', notes: '',
  });

  const load = () => {
    Promise.all([vitalAPI.getVitals({ limit: 20 }), vitalAPI.getTrends({ days: 30 })])
      .then(([v, t]) => { setVitals(v.data.data || []); setTrends(t.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
      await vitalAPI.createVital(data);
      toast.success('Vital signs recorded!');
      setShowModal(false);
      setForm({ bloodPressureSystolic: '', bloodPressureDiastolic: '', heartRate: '', temperature: '', oxygenSaturation: '', weight: '', height: '', bloodGlucose: '', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { await vitalAPI.deleteVital(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const chartData = trends.map(v => ({
    date: format(new Date(v.recordedAt), 'MMM dd'),
    systolic: v.bloodPressureSystolic,
    diastolic: v.bloodPressureDiastolic,
    heartRate: v.heartRate,
    weight: parseFloat(v.weight),
    bmi: parseFloat(v.bmi),
    glucose: parseFloat(v.bloodGlucose),
  }));

  const charts = {
    bp: { title: 'Blood Pressure (mmHg)', lines: [{ key: 'systolic', color: '#ef4444', label: 'Systolic' }, { key: 'diastolic', color: '#3b82f6', label: 'Diastolic' }] },
    hr: { title: 'Heart Rate (bpm)', lines: [{ key: 'heartRate', color: '#f59e0b', label: 'Heart Rate' }] },
    weight: { title: 'Weight (kg)', lines: [{ key: 'weight', color: '#10b981', label: 'Weight' }] },
    glucose: { title: 'Blood Glucose (mg/dL)', lines: [{ key: 'glucose', color: '#8b5cf6', label: 'Glucose' }] },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Vital Signs</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus size={16} /> Record Vitals
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title mb-0">Health Trends (30 Days)</h3>
                <div className="flex gap-2">
                  {Object.entries(charts).map(([key, chart]) => (
                    <button key={key} onClick={() => setActiveChart(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeChart === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {key.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {charts[activeChart].lines.map(l => (
                    <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} name={l.label} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Records */}
          <div className="card">
            <h3 className="section-title">Recent Records</h3>
            {vitals.length === 0 ? (
              <div className="text-center py-10">
                <FiActivity className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-400">No vital records yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="table-header text-left py-3 pr-4">Date</th>
                      <th className="table-header text-center py-3 px-3">BP (mmHg)</th>
                      <th className="table-header text-center py-3 px-3">HR (bpm)</th>
                      <th className="table-header text-center py-3 px-3">Temp (°C)</th>
                      <th className="table-header text-center py-3 px-3">SpO2 (%)</th>
                      <th className="table-header text-center py-3 px-3">Weight (kg)</th>
                      <th className="table-header text-center py-3 px-3">BMI</th>
                      <th className="table-header text-center py-3 px-3">Glucose</th>
                      <th className="py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {vitals.map(v => (
                      <tr key={v.id} className="table-row">
                        <td className="py-3 pr-4 text-gray-700">{format(new Date(v.recordedAt), 'MMM dd, yyyy HH:mm')}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={v.bloodPressureSystolic > 140 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                            {v.bloodPressureSystolic && v.bloodPressureDiastolic ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}` : '--'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={v.heartRate > 100 || v.heartRate < 60 ? 'text-red-600 font-medium' : 'text-gray-700'}>{v.heartRate || '--'}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={v.temperature > 37.5 ? 'text-red-600 font-medium' : 'text-gray-700'}>{v.temperature || '--'}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={v.oxygenSaturation < 95 ? 'text-red-600 font-medium' : 'text-gray-700'}>{v.oxygenSaturation || '--'}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-700">{v.weight || '--'}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={v.bmi > 30 || v.bmi < 18.5 ? 'text-amber-600 font-medium' : 'text-gray-700'}>{v.bmi || '--'}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-700">{v.bloodGlucose || '--'}</td>
                        <td className="py-3 text-right">
                          <button onClick={() => handleDelete(v.id)} className="text-gray-400 hover:text-red-500 p-1">
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Vital Signs">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Systolic BP (mmHg)</label>
              <input type="number" placeholder="120" value={form.bloodPressureSystolic}
                onChange={e => setForm(f => ({ ...f, bloodPressureSystolic: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Diastolic BP (mmHg)</label>
              <input type="number" placeholder="80" value={form.bloodPressureDiastolic}
                onChange={e => setForm(f => ({ ...f, bloodPressureDiastolic: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Heart Rate (bpm)</label>
              <input type="number" placeholder="75" value={form.heartRate}
                onChange={e => setForm(f => ({ ...f, heartRate: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Temperature (°C)</label>
              <input type="number" step="0.1" placeholder="37.0" value={form.temperature}
                onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">SpO2 (%)</label>
              <input type="number" placeholder="98" value={form.oxygenSaturation}
                onChange={e => setForm(f => ({ ...f, oxygenSaturation: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Blood Glucose (mg/dL)</label>
              <input type="number" placeholder="90" value={form.bloodGlucose}
                onChange={e => setForm(f => ({ ...f, bloodGlucose: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" step="0.1" placeholder="70" value={form.weight}
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" placeholder="170" value={form.height}
                onChange={e => setForm(f => ({ ...f, height: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional notes..." rows={2} className="input-field resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Vitals'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
