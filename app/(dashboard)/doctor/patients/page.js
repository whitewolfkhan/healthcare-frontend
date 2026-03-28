'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiUser, FiDroplet, FiAlertCircle } from 'react-icons/fi';
import { patientAPI, appointmentAPI, vitalAPI, labResultAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    patientAPI.getAllPatients({ search, limit: 50 })
      .then(r => setPatients(r.data.data?.patients || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  const loadPatientDetails = async (patient) => {
    setSelected(patient);
    setPatientDetails(null);
    setDetailsLoading(true);
    try {
      const [appts, vitals, labs] = await Promise.all([
        appointmentAPI.getAppointments({ patientId: patient.id }),
        vitalAPI.getVitals({ patientId: patient.id, limit: 3 }),
        labResultAPI.getLabResults({ patientId: patient.id }),
      ]);
      setPatientDetails({
        appointments: appts.data.data?.appointments || [],
        vitals: vitals.data.data || [],
        labResults: labs.data.data || [],
      });
    } catch {}
    finally { setDetailsLoading(false); }
  };

  const getAge = (dob) => dob ? Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="page-title">My Patients</h1>

      <div className="card">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients by name or email..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Desktop Table */}
          <div className="card overflow-hidden p-0 hidden lg:block">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Patient', 'Gender', 'Blood Group', 'Age', 'Allergies', 'Action'].map(h => (
                    <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No patients found</td></tr>
                ) : patients.map(p => {
                  const age = getAge(p.dateOfBirth);
                  return (
                    <tr key={p.id} className="table-row">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                            {p.user?.avatar
                              ? <img src={BACKEND_URL + p.user.avatar} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">{p.user?.firstName?.[0]}{p.user?.lastName?.[0]}</div>}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{p.user?.firstName} {p.user?.lastName}</div>
                            <div className="text-gray-400 text-xs">{p.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm capitalize">{p.gender || '--'}</td>
                      <td className="px-4 py-3">{p.bloodGroup ? <span className="badge badge-red text-xs">{p.bloodGroup}</span> : '--'}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{age != null ? `${age} yrs` : '--'}</td>
                      <td className="px-4 py-3">
                        {p.allergies?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.allergies.slice(0, 2).map((a, i) => <span key={i} className="badge badge-yellow text-xs">{a}</span>)}
                            {p.allergies.length > 2 && <span className="text-xs text-gray-400">+{p.allergies.length - 2}</span>}
                          </div>
                        ) : <span className="text-gray-400 text-xs">None</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => loadPatientDetails(p)} className="btn-secondary py-1.5 text-xs flex items-center gap-1">
                          <FiEye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="lg:hidden space-y-3">
            {patients.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">No patients found</div>
            ) : patients.map(p => {
              const age = getAge(p.dateOfBirth);
              return (
                <div key={p.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        {p.user?.avatar
                          ? <img src={BACKEND_URL + p.user.avatar} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-base">{p.user?.firstName?.[0]}{p.user?.lastName?.[0]}</div>}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{p.user?.firstName} {p.user?.lastName}</div>
                        <div className="text-gray-400 text-xs truncate mt-0.5">{p.user?.email}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {p.bloodGroup && <span className="badge badge-red text-xs">{p.bloodGroup}</span>}
                          {p.gender && <span className="text-xs text-gray-500 capitalize flex items-center gap-1"><FiUser size={10} /> {p.gender}</span>}
                          {age != null && <span className="text-xs text-gray-500">{age} yrs</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => loadPatientDetails(p)} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 flex-shrink-0">
                      <FiEye size={12} /> View
                    </button>
                  </div>
                  {p.allergies?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><FiAlertCircle size={10} /> Allergies:</span>
                        {p.allergies.slice(0, 3).map((a, i) => <span key={i} className="badge badge-yellow text-xs">{a}</span>)}
                        {p.allergies.length > 3 && <span className="text-xs text-gray-400">+{p.allergies.length - 3} more</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setPatientDetails(null); }} title={`${selected?.user?.firstName || ''} ${selected?.user?.lastName || ''}`} size="xl">
        {selected && (
          <div className="space-y-5">
            {/* Patient Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {[
                { label: 'Gender', value: selected.gender },
                { label: 'Blood Group', value: selected.bloodGroup },
                { label: 'DOB', value: selected.dateOfBirth ? format(new Date(selected.dateOfBirth), 'MMM dd, yyyy') : '--' },
                { label: 'Phone', value: selected.user?.phone || '--' },
                { label: 'City', value: selected.city || '--' },
                { label: 'Height', value: selected.height ? `${selected.height} cm` : '--' },
                { label: 'Weight', value: selected.weight ? `${selected.weight} kg` : '--' },
                { label: 'BMI', value: selected.height && selected.weight ? (selected.weight / ((selected.height / 100) ** 2)).toFixed(1) : '--' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs">{item.label}</div>
                  <div className="font-semibold text-gray-900 mt-0.5 capitalize text-sm">{item.value || '--'}</div>
                </div>
              ))}
            </div>

            {selected.allergies?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Known Allergies</h4>
                <div className="flex flex-wrap gap-2">{selected.allergies.map((a, i) => <span key={i} className="badge badge-red">{a}</span>)}</div>
              </div>
            )}
            {selected.chronicConditions?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Chronic Conditions</h4>
                <div className="flex flex-wrap gap-2">{selected.chronicConditions.map((c, i) => <span key={i} className="badge badge-yellow">{c}</span>)}</div>
              </div>
            )}

            {detailsLoading && <div className="text-center py-4 text-gray-400 text-sm">Loading details...</div>}

            {!detailsLoading && patientDetails?.vitals?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">Recent Vitals</h4>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead><tr className="border-b border-gray-100">{['Date', 'BP', 'HR', 'Temp', 'SpO2', 'Wt'].map(h => <th key={h} className="table-header text-left py-2 pr-3 text-xs">{h}</th>)}</tr></thead>
                    <tbody>
                      {patientDetails.vitals.map(v => (
                        <tr key={v.id} className="border-b border-gray-50">
                          <td className="py-2 pr-3 text-gray-500 text-xs">{format(new Date(v.recordedAt), 'MMM dd')}</td>
                          <td className="py-2 pr-3 font-medium">{v.bloodPressureSystolic}/{v.bloodPressureDiastolic}</td>
                          <td className="py-2 pr-3">{v.heartRate || '--'}</td>
                          <td className="py-2 pr-3">{v.temperature || '--'}</td>
                          <td className="py-2 pr-3">{v.oxygenSaturation || '--'}</td>
                          <td className="py-2 pr-3">{v.weight || '--'} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!detailsLoading && patientDetails?.appointments?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">Recent Appointments</h4>
                <div className="space-y-2">
                  {patientDetails.appointments.slice(0, 5).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm gap-2 flex-wrap">
                      <div>
                        <span className="font-medium">{format(new Date(apt.appointmentDate + 'T00:00:00'), 'MMM dd, yyyy')}</span>
                        <span className="text-gray-500 ml-2 text-xs">{apt.reason || 'Consultation'}</span>
                      </div>
                      <span className={`badge text-xs ${apt.status === 'completed' ? 'badge-green' : apt.status === 'cancelled' ? 'badge-red' : 'badge-blue'}`}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
