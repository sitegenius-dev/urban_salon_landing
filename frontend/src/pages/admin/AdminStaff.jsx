 import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, UserCircle, History, Download, Search } from 'lucide-react';

const EMPTY = { name:'', role:'', phone:'', email:'', experience:'', specialization:'', isActive: true };

const STATUS_COLORS = {
  pending:   'text-yellow-400 bg-yellow-900/30',
  confirmed: 'text-green-400 bg-green-900/30',
  completed: 'text-blue-400 bg-blue-900/30',
  cancelled: 'text-red-400 bg-red-900/30',
};

export default function AdminStaff() {
  const [staff,   setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState('');
  const [saving,  setSaving]  = useState(false);

  // History modal
  const [historyModal,    setHistoryModal]    = useState(false);
  const [historyStaff,    setHistoryStaff]    = useState(null);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [historyLoading,  setHistoryLoading]  = useState(false);

  // History filters
  const [hFilter, setHFilter] = useState({ search: '', status: '', dateFrom: '', dateTo: '' });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/admin/all');
      setStaff(Array.isArray(res.data) ? res.data : res.data.staff || []);
    } catch { toast.error('Failed to load staff'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  // Open history modal
  const openHistory = async (s) => {
    setHistoryStaff(s);
    setHistoryModal(true);
    setHistoryLoading(true);
    setHFilter({ search: '', status: '', dateFrom: '', dateTo: '' });
    try {
      const res = await api.get('/bookings/admin/all', { params: { staffId: s.id, limit: 100 } });
      setHistoryBookings(res.data.bookings || []);
    } catch { toast.error('Failed to load bookings'); }
    finally { setHistoryLoading(false); }
  };

  // Apply filters to history bookings
  const filteredHistory = historyBookings.filter(b => {
    if (hFilter.status && b.bookingStatus !== hFilter.status) return false;
    if (hFilter.dateFrom && b.travelDate < hFilter.dateFrom) return false;
    if (hFilter.dateTo   && b.travelDate > hFilter.dateTo)   return false;
    if (hFilter.search) {
      const q = hFilter.search.toLowerCase();
      if (
        !b.passengerName?.toLowerCase().includes(q) &&
        !b.passengerPhone?.includes(q) &&
        !b.bookingId?.toLowerCase().includes(q) &&
        !b.serviceName?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const upcoming  = filteredHistory.filter(b => ['pending','confirmed'].includes(b.bookingStatus));
  const completed = filteredHistory.filter(b => ['completed','cancelled'].includes(b.bookingStatus));

  // Download filtered bookings as CSV
  const downloadCSV = () => {
    if (filteredHistory.length === 0) { toast.error('No bookings to download'); return; }
    const headers = ['Booking ID','Customer','Phone','Service','Date','Slot','Status','Payment','Fare','Adv Paid'];
    const rows = filteredHistory.map(b => [
      b.bookingId,
      b.passengerName,
      b.passengerPhone,
      b.serviceName,
      b.travelDate,
      b.timeSlot,
      b.bookingStatus,
      b.paymentStatus,
      parseFloat(b.totalFare).toFixed(0),
      parseFloat(b.partialPaymentAmount).toFixed(0),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${historyStaff?.name?.replace(/\s+/g,'-')}-bookings.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const openNew = () => {
    setEditing(null); setForm(EMPTY); setImage(null); setPreview(''); setModal(true);
  };

  const openEdit = (s) => {
    setEditing(s.id);
    const spec = Array.isArray(s.specialization) ? s.specialization.join(', ') : (s.specialization || '');
    setForm({ name: s.name, role: s.role, phone: s.phone||'', email: s.email||'',
      experience: s.experience||'', specialization: spec, isActive: s.isActive });
    setImage(null);
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
                    <button onClick={() => openHistory(s)}
                      className="flex-1 py-1.5 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                      <History size={12} /> History
                    </button>
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

      {/* ── History Modal ─────────────────────────────────────────────────── */}
      {historyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                  <UserCircle size={20} className="text-gold" />
                </div>
                <div>
                  <h2 className="text-white font-black">{historyStaff?.name}</h2>
                  <p className="text-gold text-xs">{historyStaff?.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={downloadCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-xs font-bold transition-colors">
                  <Download size={13} /> Download CSV
                </button>
                <button onClick={() => setHistoryModal(false)} className="text-gray-500 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-white/10 bg-[#0d0d0d]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Search */}
                <div className="relative col-span-2 sm:col-span-1">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={hFilter.search}
                    onChange={e => setHFilter(p => ({ ...p, search: e.target.value }))}
                    placeholder="Name, phone, ID..."
                    className="form-input pl-7 text-xs py-1.5"
                  />
                </div>
                {/* Status */}
                <select
                  value={hFilter.status}
                  onChange={e => setHFilter(p => ({ ...p, status: e.target.value }))}
                  className="form-input text-xs py-1.5"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {/* Date From */}
                <input
                  type="date"
                  value={hFilter.dateFrom}
                  onChange={e => setHFilter(p => ({ ...p, dateFrom: e.target.value }))}
                  className="form-input text-xs py-1.5"
                />
                {/* Date To */}
                <input
                  type="date"
                  value={hFilter.dateTo}
                  onChange={e => setHFilter(p => ({ ...p, dateTo: e.target.value }))}
                  className="form-input text-xs py-1.5"
                />
              </div>
              {(hFilter.search || hFilter.status || hFilter.dateFrom || hFilter.dateTo) && (
                <button
                  onClick={() => setHFilter({ search:'', status:'', dateFrom:'', dateTo:'' })}
                  className="mt-2 text-xs text-gray-500 hover:text-gold flex items-center gap-1">
                  <X size={10} /> Clear filters
                </button>
              )}
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {historyLoading ? (
                <div className="flex justify-center py-10"><div className="spinner" /></div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center text-gray-600 py-10">
                  {historyBookings.length === 0 ? 'No bookings assigned yet' : 'No results for current filters'}
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                      <div className="text-white font-black text-xl">{filteredHistory.length}</div>
                      <div className="text-gray-500 text-xs">Total</div>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                      <div className="text-yellow-400 font-black text-xl">{upcoming.length}</div>
                      <div className="text-gray-500 text-xs">Upcoming</div>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                      <div className="text-blue-400 font-black text-xl">{completed.length}</div>
                      <div className="text-gray-500 text-xs">Completed</div>
                    </div>
                  </div>

                  {/* Upcoming */}
                  {upcoming.length > 0 && (
                    <div>
                      <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">
                        🕐 Upcoming ({upcoming.length})
                      </p>
                      <div className="space-y-2">
                        {upcoming.map(b => (
                          <div key={b.id} className="bg-[#0a0a0a] rounded-xl p-3 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-white text-sm font-semibold truncate">{b.passengerName}</div>
                              <div className="text-gray-500 text-xs truncate">{b.serviceName}</div>
                              <div className="text-gray-600 text-xs font-mono">{b.bookingId}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-gold text-sm font-bold">₹{parseFloat(b.totalFare).toFixed(0)}</div>
                              <div className="text-gray-500 text-xs">
                                {new Date(b.travelDate + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                                {' · '}{b.timeSlot}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[b.bookingStatus]}`}>
                                {b.bookingStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed / Cancelled */}
                  {completed.length > 0 && (
                    <div>
                      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
                        ✅ Past ({completed.length})
                      </p>
                      <div className="space-y-2">
                        {completed.map(b => (
                          <div key={b.id} className="bg-[#0a0a0a] rounded-xl p-3 flex items-center justify-between gap-2 opacity-70">
                            <div className="min-w-0">
                              <div className="text-white text-sm font-semibold truncate">{b.passengerName}</div>
                              <div className="text-gray-500 text-xs truncate">{b.serviceName}</div>
                              <div className="text-gray-600 text-xs font-mono">{b.bookingId}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-gold text-sm font-bold">₹{parseFloat(b.totalFare).toFixed(0)}</div>
                              <div className="text-gray-500 text-xs">
                                {new Date(b.travelDate + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                                {' · '}{b.timeSlot}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[b.bookingStatus]}`}>
                                {b.bookingStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ────────────────────────────────────────────────── */}
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