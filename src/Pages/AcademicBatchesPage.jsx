import React, { useState, useEffect } from 'react';
import Navbar from '../Components/layouts/Navbar';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Calendar, BookOpen, Layers } from 'lucide-react';
import Alert from '../Components/common/Alert';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AcademicBatchesPage() {
  const { accessToken, refreshAccessToken } = useAuth();
  
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    academic_year: new Date().getFullYear().toString(),
    grade: '',
    admission_date: '',
    model_exam_date: '',
    final_exam_date: '',
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      let token = accessToken || await refreshAccessToken();
      const res = await fetch(`${API_BASE_URL}/trainers/academic-batches/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBatches(data.results || data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to fetch academic batches.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [accessToken]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingBatch(null);
    setFormData({
      name: '',
      academic_year: new Date().getFullYear().toString(),
      grade: '',
      admission_date: '',
      model_exam_date: '',
      final_exam_date: '',
    });
    setShowModal(true);
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      academic_year: batch.academic_year,
      grade: batch.grade || '',
      admission_date: batch.admission_date || '',
      model_exam_date: batch.model_exam_date || '',
      final_exam_date: batch.final_exam_date || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let token = accessToken || await refreshAccessToken();
      const url = editingBatch 
        ? `${API_BASE_URL}/trainers/academic-batches/${editingBatch.id}/` 
        : `${API_BASE_URL}/trainers/academic-batches/`;
      const method = editingBatch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save batch');
      
      setMessage({ type: 'success', text: `Batch successfully ${editingBatch ? 'updated' : 'created'}!` });
      setShowModal(false);
      fetchBatches();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save academic batch.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      let token = accessToken || await refreshAccessToken();
      const res = await fetch(`${API_BASE_URL}/trainers/academic-batches/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchBatches();
      setMessage({ type: 'success', text: 'Batch deleted.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete batch.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Batches</h1>
            <p className="text-gray-500 mt-1">Manage academic years, grades, and batches.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} /> Create Batch
          </button>
        </div>

        {message && <Alert type={message.type} message={message.text} className="mb-6" />}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading batches...</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(
              batches.reduce((acc, batch) => {
                if (!acc[batch.academic_year]) acc[batch.academic_year] = {};
                if (!acc[batch.academic_year][batch.grade]) acc[batch.academic_year][batch.grade] = [];
                acc[batch.academic_year][batch.grade].push(batch);
                return acc;
              }, {})
            ).sort((a, b) => b[0].localeCompare(a[0])).map(([year, grades]) => (
              <div key={year} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-indigo-600" />
                    Academic Year {year}
                  </h2>
                </div>
                <div className="p-6 space-y-8">
                  {Object.entries(grades).sort((a, b) => a[0].localeCompare(b[0])).map(([grade, gradeBatches]) => (
                    <div key={grade}>
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Layers className="text-blue-500" />
                        {grade}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-4 border-l-2 border-blue-100">
                        {gradeBatches.map(batch => (
                          <div key={batch.id} className="bg-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative group">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-lg font-bold text-gray-900">{batch.name}</h4>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(batch)} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded"><Edit size={14} /></button>
                                <button onClick={() => handleDelete(batch.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"><Trash2 size={14} /></button>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" /> 
                                <span>Admissions: {batch.admission_date || 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen size={14} className="text-gray-400" /> 
                                <span>Model Exams: {batch.model_exam_date || 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen size={14} className="text-gray-400" /> 
                                <span>Final Exams: {batch.final_exam_date || 'TBD'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {batches.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No academic batches found.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">{editingBatch ? 'Edit Batch' : 'Create Batch'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 2024 Science A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                  <input type="text" name="academic_year" required value={formData.academic_year} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 2024-2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade / Level *</label>
                  <input type="text" name="grade" required value={formData.grade} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Grade 10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                    <input type="date" name="admission_date" value={formData.admission_date} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Exams Date</label>
                    <input type="date" name="model_exam_date" value={formData.model_exam_date} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Final Exams Date</label>
                    <input type="date" name="final_exam_date" value={formData.final_exam_date} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-8">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Batch</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
