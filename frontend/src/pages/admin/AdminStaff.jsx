import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, UserCircle } from 'lucide-react';

const EMPTY = { name:'', role:'', phone:'', email:'', experience:'', specialization:'', isActive: true };

export default function AdminStaff() {
  const [staff,   setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState('');
  const [saving,  setSaving]  = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/admin/all');
      setStaff(Array.isArray(res.data) ? res.data : res.data.staff || []);
    } catch { toast.error('Failed to load staff'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const openNew = () => {
    setEditing(null); setForm(EMPTY); setImage(null); setPreview(''); setModal(true);
  };
  const openEdit = (s) => {
    setEditing(s.id);
    const spec = Array.isArray(s.specialization) ? s.specialization.join(', ') : (s.specialization || '');
    setForm({ name: s.name, role: s.role, phone: s.phone||'', email: s.email||'',
      experience: s.experience||'', specialization: spec, isActive: s.isActive });
    setImage(null);
    // setPreview(s.imageUrl ? (s.imageUrl.startsWith('/') ? s.imageUrl : `/${s.imageUrl}`) : '');
    setPreview(s.imageUrl ? `${import.meta.env.VITE_BASE_URL}${s.imageUrl}` : '');
    setModal(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) { toast.error('Name and role required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (image) fd.append('image', image);

      if (editing) {
        await api.put(`/staff/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Staff updated');
      } else {
        await api.post('/staff', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Staff added');
      }
      setModal(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const deleteStaff = async (id, name) => {
    if (!confirm(`Remove "${name}" from staff?`)) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Deleted');
      fetchStaff();
    } catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (s) => {
    try {
      const fd = new FormData();
      fd.append('isActive', !s.isActive);
      await api.put(`/staff/${s.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchStaff();
    } catch { toast.error('Update failed'); }
  };

  return (
    <AdminLayout panel="admin">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-xl">Staff</h1>
            <p className="text-gray-500 text-sm">{staff.length} members</p>
          </div>
          <button onClick={openNew}
            className="btn-gold px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Plus size={15} /> Add Staff
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map(s => {
              // const imgSrc = s.imageUrl ? (s.imageUrl.startsWith('http') ? s.imageUrl : s.imageUrl) : null;
              const imgSrc = s.imageUrl ? `${import.meta.env.VITE_BASE_URL}${s.imageUrl}` : null;
              const specs  = Array.isArray(s.specialization) ? s.specialization : [];
              return (
                <div key={s.id} className="bg-[#111] border border-white/10 rounded-xl p-5 hover:border-gold/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {imgSrc
                        ? <img src={imgSrc} alt={s.name} className="w-full h-full object-cover" />
                        : <UserCircle size={28} className="text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white font-bold text-sm">{s.name}</div>
                          <div className="text-gold text-xs">{s.role}</div>
                        </div>
                        <button onClick={() => toggleActive(s)}
                          className={s.isActive ? 'text-green-400' : 'text-gray-600'}>
                          {s.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                    {s.phone      && <div>📞 {s.phone}</div>}
                    {s.email      && <div>✉️ {s.email}</div>}
                    {s.experience && <div>⏱ {s.experience}</div>}
                    {specs.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {specs.map((sp, i) => (
                          <span key={i} className="bg-[#1a1a1a] text-gold text-xs px-2 py-0.5 rounded-full border border-gold/20">
                            {sp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEdit(s)}
                      className="flex-1 py-1.5 bg-blue-900/30 hover:bg-blue-900/60 text-blue-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => deleteStaff(s.id, s.name)}
                      className="flex-1 py-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {staff.length === 0 && (
              <div className="col-span-3 text-center text-gray-600 py-16">No staff yet. Add members!</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#111]">
              <h2 className="text-white font-bold">{editing ? 'Edit Staff' : 'New Staff Member'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Image upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                  {preview
                    ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    : <UserCircle size={30} className="text-gray-600" />}
                </div>
                <div>
                  <label className="form-label">Profile Photo</label>
                  <input type="file" accept="image/*" onChange={handleImage}
                    className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#1a1a1a] file:text-gold file:text-xs file:font-semibold hover:file:bg-[#222] cursor-pointer" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                    className="form-input" placeholder="Full name" />
                </div>
                <div>
                  <label className="form-label">Role *</label>
                  <input value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}
                    className="form-input" placeholder="Hair Stylist" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                    className="form-input" placeholder="+91 XXXXX" />
                </div>
                <div>
                  <label className="form-label">Experience</label>
                  <input value={form.experience} onChange={e => setForm(p => ({...p, experience: e.target.value}))}
                    className="form-input" placeholder="5 years" />
                </div>
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className="form-input" placeholder="optional" />
              </div>
              <div>
                <label className="form-label">Specialization <span className="text-gray-600 font-normal normal-case">(comma separated)</span></label>
                <input value={form.specialization} onChange={e => setForm(p => ({...p, specialization: e.target.value}))}
                  className="form-input" placeholder="Hair Color, Beard, Styling" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-600' : 'bg-gray-700'}`}
                  onClick={() => setForm(p => ({...p, isActive: !p.isActive}))}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-gray-400 text-sm">Active</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm font-semibold hover:border-white/30">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
                  {saving ? 'Saving...' : (editing ? 'Update' : 'Add Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
