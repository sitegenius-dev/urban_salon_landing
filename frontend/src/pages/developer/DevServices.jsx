import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

const EMPTY = { name:'', category:'', description:'', price:'', duration:'', isActive: true };

export default function DevServices() {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services/admin/all');
      setServices(Array.isArray(res.data) ? res.data : res.data.services || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (svc) => {
    setEditing(svc.id);
    setForm({ name: svc.name, category: svc.category||'', description: svc.description||'',
      price: svc.price, duration: svc.duration||'', isActive: svc.isActive });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === '') { toast.error('Name and price required'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), category: form.category||null,
        description: form.description||null, price: parseFloat(form.price)||0,
        duration: form.duration ? parseInt(form.duration) : null, isActive: form.isActive };
      if (editing) {
        await api.put(`/services/${editing}`, payload);
        toast.success('Updated');
      } else {
        await api.post('/services', payload);
        toast.success('Created');
      }
      setModal(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const deleteService = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/services/${id}`); toast.success('Deleted'); fetchServices(); }
    catch { toast.error('Failed'); }
  };

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
  const grouped = services.reduce((acc, s) => {
    const c = s.category || 'Other'; if (!acc[c]) acc[c] = []; acc[c].push(s); return acc;
  }, {});

  return (
    <AdminLayout panel="developer">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-xl">Services CMS</h1>
            <p className="text-gray-500 text-sm">{services.length} services</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: '#4f8ef7' }}>
            <Plus size={15} /> Add Service
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, svcs]) => (
              <div key={cat} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-[#161616] border-b border-white/10">
                  <h3 className="text-gold font-bold text-sm uppercase tracking-widest">{cat}</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {svcs.map(svc => (
                    <div key={svc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#161616] transition-colors">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${svc.isActive ? 'bg-green-500' : 'bg-gray-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold">{svc.name}</div>
                        {svc.description && <div className="text-gray-500 text-xs truncate">{svc.description}</div>}
                      </div>
                      <div className="text-right flex-shrink-0 mr-4">
                        <div className="text-gold font-bold text-sm">₹{parseFloat(svc.price).toFixed(0)}</div>
                        {svc.duration && <div className="text-gray-600 text-xs">{svc.duration}m</div>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(svc)}
                          className="p-1.5 text-blue-400 hover:bg-blue-900/40 rounded">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => deleteService(svc.id, svc.name)}
                          className="p-1.5 text-red-400 hover:bg-red-900/40 rounded">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="text-center text-gray-600 py-16">No services. Add your first one!</div>
            )}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-white font-bold">{editing ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className="form-input" placeholder="e.g. Hair Color" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Category</label>
                  <input value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
                    className="form-input" list="dev-cats" placeholder="Hair" />
                  <datalist id="dev-cats">
                    {categories.map(c => <option key={c} value={c} />)}
                    {['Hair','Beard','Skin','Makeup','Nails','Waxing'].map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" min="0" value={form.price}
                    onChange={e => setForm(p => ({...p, price: e.target.value}))}
                    className="form-input" placeholder="499" />
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                  className="form-input resize-none" rows={2} placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="form-label">Duration (min)</label>
                  <input type="number" min="0" value={form.duration}
                    onChange={e => setForm(p => ({...p, duration: e.target.value}))}
                    className="form-input" placeholder="45" />
                </div>
                <label className="flex items-center gap-2 pb-2 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-600' : 'bg-gray-700'}`}
                    onClick={() => setForm(p => ({...p, isActive: !p.isActive}))}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-gray-400 text-sm">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: '#4f8ef7' }}>
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
