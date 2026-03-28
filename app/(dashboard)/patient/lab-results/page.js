'use client';
import { useState, useEffect } from 'react';
import { FiFileText, FiAlertCircle, FiDownload, FiEye, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import { labResultAPI } from '../../../../lib/api';
import Modal from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

const categoryColors = {
  blood: 'badge-red', urine: 'badge-yellow', imaging: 'badge-blue',
  chemistry: 'badge-purple', hematology: 'badge-blue', other: 'badge-gray',
};

export default function PatientLabResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    labResultAPI.getLabResults()
      .then(r => setResults(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter(r => r.testName?.toLowerCase().includes(search.toLowerCase()) || r.labName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Lab Results</h1>
      </div>

      <div className="card">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tests..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-12">
              <FiFileText className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-400">No lab results found</p>
            </div>
          ) : filtered.map(result => (
            <div key={result.id} className="card hover:shadow-md transition-all cursor-pointer" onClick={() => setSelected(result)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{result.testName}</h3>
                    {result.isAbnormal && <FiAlertCircle className="text-red-500 flex-shrink-0" size={14} />}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>Test: {format(new Date(result.testDate), 'MMM dd, yyyy')}</span>
                    {result.resultDate && <span>Result: {format(new Date(result.resultDate), 'MMM dd, yyyy')}</span>}
                    {result.labName && <span>Lab: {result.labName}</span>}
                  </div>
                  {result.summary && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{result.summary}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`badge ${result.status === 'completed' ? 'badge-green' : result.status === 'reviewed' ? 'badge-blue' : 'badge-yellow'}`}>{result.status}</span>
                  {result.category && <span className={categoryColors[result.category] || 'badge-gray'}>{result.category}</span>}
                  {result.isAbnormal && <span className="badge badge-red">Abnormal</span>}
                  <FiEye className="text-gray-400" size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.testName || 'Lab Result'} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Test Date:</span> <span className="font-medium ml-1">{format(new Date(selected.testDate), 'MMMM dd, yyyy')}</span></div>
              {selected.resultDate && <div><span className="text-gray-500">Result Date:</span> <span className="font-medium ml-1">{format(new Date(selected.resultDate), 'MMMM dd, yyyy')}</span></div>}
              {selected.labName && <div><span className="text-gray-500">Laboratory:</span> <span className="font-medium ml-1">{selected.labName}</span></div>}
              <div><span className="text-gray-500">Category:</span> <span className="font-medium ml-1 capitalize">{selected.category}</span></div>
              {selected.doctor && <div className="col-span-2"><span className="text-gray-500">Doctor:</span> <span className="font-medium ml-1">Dr. {selected.doctor?.user?.firstName} {selected.doctor?.user?.lastName}</span></div>}
            </div>

            {selected.results?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Test Results</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Parameter', 'Value', 'Unit', 'Normal Range', 'Status'].map(h => <th key={h} className="table-header text-left p-3">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.results.map((r, i) => (
                        <tr key={i} className={`border-t border-gray-100 ${r.status === 'high' || r.status === 'low' ? 'bg-red-50' : ''}`}>
                          <td className="p-3 font-medium text-gray-800">{r.parameter}</td>
                          <td className={`p-3 font-semibold ${r.status === 'high' || r.status === 'low' ? 'text-red-600' : 'text-gray-900'}`}>{r.value}</td>
                          <td className="p-3 text-gray-500">{r.unit}</td>
                          <td className="p-3 text-gray-500">{r.normalRange}</td>
                          <td className="p-3">
                            {r.status && <span className={`badge ${r.status === 'normal' ? 'badge-green' : r.status === 'high' ? 'badge-red' : r.status === 'low' ? 'badge-yellow' : 'badge-gray'}`}>{r.status}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selected.summary && <div><h4 className="font-semibold text-gray-800 mb-1">Summary</h4><p className="text-gray-600 text-sm">{selected.summary}</p></div>}
            {selected.interpretation && <div><h4 className="font-semibold text-gray-800 mb-1">Interpretation</h4><p className="text-gray-600 text-sm">{selected.interpretation}</p></div>}
            {selected.doctorNotes && <div className="bg-blue-50 p-4 rounded-xl"><h4 className="font-semibold text-blue-800 mb-1">Doctor Notes</h4><p className="text-blue-700 text-sm">{selected.doctorNotes}</p></div>}

            {selected.fileUrl && (
              <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${selected.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex">
                <FiDownload size={14} /> Download Report
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
