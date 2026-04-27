import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';

const EMPTY = { name: '', category: '', description: '', price: '', duration: '', isActive: true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null); // null = new
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services/admin/all');
      setServices(Array.isArray(res.data) ? res.data : res.data.services || []);
    } catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (svc) => {
    setEditing(svc.id);
    setForm({
      name: svc.name, category: svc.category || '',
      description: svc.description || '', price: svc.price,
      duration: svc.duration || '', isActive: svc.isActive,
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required'); return; }
    if (!form.price && form.price !== 0) { toast.error('Price required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || null,
        description: form.description || null,
        price: parseFloat(form.price) || 0,
        duration: form.duration ? parseInt(form.duration) : null,
        isActive: form.isActive,
      };
      if (editing) {
        await api.put(`/services/${editing}`, payload);
        toast.success('Service updated');
      } else {
        await api.post('/services', payload);
        toast.success('Service created');
      }
      setModal(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const deleteService = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Deleted');
      fetchServices();
    } catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (svc) => {
    try {
      await api.put(`/services/${svc.id}`, { isActive: !svc.isActive });
      fetchServices();
    } catch { toast.error('Update failed'); }
  };

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];

  return (
    <AdminLayout panel="admin">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-xl">Services</h1>
            <p className="text-gray-500 text-sm">{services.length} services total</p>
          </div>
          <button onClick={openNew}
            className="btn-gold px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Plus size={15} /> Add Service
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : (
          <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(svc => (
                    <tr key={svc.id} className="text-gray-300">
                      <td>
                        <div className="font-medium text-sm">{svc.name}</div>
                        {svc.description && <div className="text-gray-500 text-xs mt-0.5 max-w-[200px] truncate">{svc.description}</div>}
                      </td>
                      <td>
                        {svc.category
                          ? <span className="bg-[#1a1a1a] text-gold text-xs px-2 py-0.5 rounded-full">{svc.category}</span>
                          : <span className="text-gray-600 text-xs">—</span>}
                      </td>
                      <td className="font-semibold text-sm">₹{parseFloat(svc.price).toFixed(0)}</td>
                      <td className="text-sm text-gray-400">{svc.duration ? `${svc.duration} min` : '—'}</td>
                      <td>
                        <button onClick={() => toggleActive(svc)}
                          className={`flex items-center gap-1.5 text-xs font-semibold ${svc.isActive ? 'text-green-400' : 'text-gray-600'}`}>
                          {svc.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          {svc.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(svc)}
                            className="p-1.5 bg-blue-900/40 hover:bg-blue-900 text-blue-400 rounded">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => deleteService(svc.id, svc.name)}
                            className="p-1.5 bg-red-900/40 hover:bg-red-900 text-red-400 rounded">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-gray-600 py-12">No services yet. Add one!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-white font-bold">{editing ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="form-input" placeholder="e.g. Hair Color" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Category</label>
                  <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="form-input" list="cats" placeholder="e.g. Hair" />
                  <datalist id="cats">
                    {categories.map(c => <option key={c} value={c} />)}
                    {['Hair','Beard','Skin','Makeup','Nails','Waxing'].map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="form-input" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="form-input resize-none" rows={2} placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Duration (min)</label>
                  <input type="number" min="0" value={form.duration}
                    onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                    className="form-input" placeholder="e.g. 45" />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-600' : 'bg-gray-700'}`}
                      onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
                      <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-gray-400 text-sm">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm font-semibold hover:border-white/30">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
                  {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
