import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Search, Download, Trash2, Edit2, X, Save } from 'lucide-react';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
const PAY_STATUSES = ['unpaid', 'partial', 'paid'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '', status: '', dateFrom: '', dateTo: '',
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);   // full booking object
  const [editFields, setEditFields] = useState({});     // only editable fields
  const [saving, setSaving] = useState(false);

  // Staff + Services for dropdowns
  //  const [servicesList, setServicesList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // Load staff and services once
  useEffect(() => {
    api.get('/staff').then(r => setStaffList(r.data.staff || [])).catch(() => { });
    api.get('/services').then(r => setServicesList(r.data.services || [])).catch(() => { });
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await api.get('/bookings/admin/all', { params });
      setBookings(res.data.bookings);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleFilterChange = (k, v) => {
    setFilters(p => ({ ...p, [k]: v }));
    setPage(1);
  };

  // Open modal
  const openEdit = (b) => {
    setModalData(b);
    // Parse existing services — could be comma-separated
    const existingServices = b.serviceName
      ? b.serviceName.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    setSelectedServices(existingServices);
    setEditFields({
      bookingStatus: b.bookingStatus,
      paymentStatus: b.paymentStatus,
      staffId: b.staffId || '',
      serviceName: b.serviceName || '',
      adminNote: b.adminNote || '',
      upiTransactionId: b.upiTransactionId || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setModalData(null); };
  const saveEdit = async () => {
    setSaving(true);
    // Calculate total fare from selected services
    const total = selectedServices.reduce((sum, svcName) => {
      const svc = servicesList.find(s => s.name === svcName);
      return sum + (svc ? parseFloat(svc.price) : 0);
    }, 0);
    const payload = {
      ...editFields,
      serviceName: selectedServices.join(', '),
      ...(total > 0 && { totalFare: total }),
    };
    try {
      await api.put(`/bookings/admin/${modalData.id}`, payload);
      toast.success('Booking updated!');
      closeModal();
      fetchBookings();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const deleteBooking = async (id, name) => {
    if (!confirm(`Delete booking for ${name}?`)) return;
    try {
      await api.delete(`/bookings/admin/${id}`);
      toast.success('Deleted');
      fetchBookings();
    } catch { toast.error('Delete failed'); }
  };

  const exportExcel = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await api.get('/bookings/admin/export', { params, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  return (
    <AdminLayout panel="admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-white font-black text-xl">Bookings</h1>
            <p className="text-gray-500 text-sm">{total} total bookings</p>
          </div>
          <button onClick={exportExcel}
            className="btn-gold px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Download size={15} /> Export Excel
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={filters.search} onChange={e => handleFilterChange('search', e.target.value)}
                placeholder="Search name, phone, ID..." className="form-input pl-8 text-sm" />
            </div>
            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}
              className="form-input text-sm">
              <option value="">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)}
              className="form-input text-sm" />
            <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)}
              className="form-input text-sm" />
          </div>
          {(filters.search || filters.status || filters.dateFrom || filters.dateTo) && (
            <button onClick={() => { setFilters({ search: '', status: '', dateFrom: '', dateTo: '' }); setPage(1); }}
              className="mt-3 text-xs text-gray-500 hover:text-gold flex items-center gap-1">
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48"><div className="spinner" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    {/* <th>Date / Slot</th> */}
                    <th>Appt. Date / Slot</th>
                    <th>Booked On</th>
                    <th>Fare</th>
                    <th>Booking Status</th>
                    <th>Payment</th>
                    <th>UPI Txn ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="text-gray-300">
                      <td className="text-gold font-mono text-xs whitespace-nowrap">{b.bookingId}</td>
                      <td>
                        <div className="font-medium text-sm">{b.passengerName}</div>
                        <div className="text-gray-500 text-xs">{b.passengerPhone}</div>
                        <div className="text-gray-600 text-xs">{b.gender}</div>
                      </td>
                      <td className="text-sm max-w-[120px] truncate">{b.serviceName}</td>
                      <td className="text-sm whitespace-nowrap">
                        <div>{new Date(b.travelDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div className="text-gray-500 text-xs">{b.timeSlot}</div>
                      </td>
                      <td className="text-sm whitespace-nowrap">
                        <div>{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div className="text-gray-500 text-xs">{new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                      </td>
                      <td className="text-sm whitespace-nowrap">
                        <div>₹{parseFloat(b.totalFare).toFixed(0)}</div>
                        {b.partialPaymentAmount > 0 && (
                          <div className="text-gray-500 text-xs">Adv: ₹{parseFloat(b.partialPaymentAmount).toFixed(0)}</div>
                        )}
                      </td>
                      <td><span className={`badge badge-${b.bookingStatus}`}>{b.bookingStatus}</span></td>
                      <td><span className={`badge badge-${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                      <td className="text-xs text-gray-400 font-mono">{b.upiTransactionId || '—'}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(b)}
                            className="p-1.5 bg-blue-900/40 hover:bg-blue-900 text-blue-400 rounded">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => deleteBooking(b.id, b.passengerName)}
                            className="p-1.5 bg-red-900/40 hover:bg-red-900 text-red-400 rounded">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={10} className="text-center text-gray-600 py-12">No bookings found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-gray-500 text-xs">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 bg-[#1a1a1a] text-gray-300 rounded-lg text-xs disabled:opacity-40 hover:border-gold border border-white/10">
                  Prev
                </button>
                <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 bg-[#1a1a1a] text-gray-300 rounded-lg text-xs disabled:opacity-40 hover:border-gold border border-white/10">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {modalOpen && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-white font-black text-lg">Edit Booking</h2>
                <p className="text-gold font-mono text-xs mt-0.5">{modalData.bookingId}</p>
              </div>
              <button onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">

              {/* Customer Info — READ ONLY */}
              <div className="bg-[#0a0a0a] rounded-xl p-4 space-y-2">
                <p className="text-gold text-xs font-bold uppercase tracking-widest mb-3">Customer Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-600 text-xs">Name</label>
                    <input value={modalData.passengerName} disabled
                      className="form-input text-sm mt-1 opacity-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Phone</label>
                    <input value={modalData.passengerPhone} disabled
                      className="form-input text-sm mt-1 opacity-50 cursor-not-allowed" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-600 text-xs">Email</label>
                    <input value={modalData.passengerEmail || '—'} disabled
                      className="form-input text-sm mt-1 opacity-50 cursor-not-allowed" />
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <p className="text-gold text-xs font-bold uppercase tracking-widest">Booking Details</p>

                {/* Service */}
                {/* Services — Multi Select */}
                <div>
                  <label className="form-label">
                    Services
                    {selectedServices.length > 0 && (
                      <span className="ml-2 text-gold text-xs font-normal">
                        {selectedServices.length} selected — ₹{selectedServices.reduce((sum, name) => {
                          const s = servicesList.find(x => x.name === name);
                          return sum + (s ? parseFloat(s.price) : 0);
                        }, 0).toFixed(0)}
                      </span>
                    )}
                  </label>

                  {/* Selected chips */}
                  {selectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedServices.map(name => (
                        <span key={name}
                          className="flex items-center gap-1 bg-gold/20 text-gold text-xs px-2 py-1 rounded-lg">
                          {name}
                          <button type="button"
                            onClick={() => setSelectedServices(p => p.filter(s => s !== name))}
                            className="hover:text-red-400 transition-colors">
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Dropdown to add */}
                  <select
                    value=""
                    onChange={e => {
                      const val = e.target.value;
                      if (val && !selectedServices.includes(val)) {
                        setSelectedServices(p => [...p, val]);
                      }
                    }}
                    className="form-input text-sm"
                  >
                    <option value="">+ Add a Service</option>
                    {servicesList
                      .filter(s => !selectedServices.includes(s.name))
                      .map(s => (
                        <option key={s.id} value={s.name}>
                          {s.name} — ₹{s.price}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Staff */}
                <div>
                  <label className="form-label">Assign Staff</label>
                  <select
                    value={editFields.staffId}
                    onChange={e => setEditFields(p => ({ ...p, staffId: e.target.value }))}
                    className="form-input text-sm"
                  >
                    <option value="">— No Staff Assigned —</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
                    ))}
                  </select>
                </div>

                {/* Booking Status */}
                <div>
                  <label className="form-label">Booking Status</label>
                  <select
                    value={editFields.bookingStatus}
                    onChange={e => setEditFields(p => ({ ...p, bookingStatus: e.target.value }))}
                    className="form-input text-sm"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="form-label">Payment Status</label>
                  <select
                    value={editFields.paymentStatus}
                    onChange={e => setEditFields(p => ({ ...p, paymentStatus: e.target.value }))}
                    className="form-input text-sm"
                  >
                    {PAY_STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* UPI Transaction ID */}
                <div>
                  <label className="form-label">UPI Transaction ID</label>
                  <input
                    type="text"
                    value={editFields.upiTransactionId}
                    onChange={e => setEditFields(p => ({ ...p, upiTransactionId: e.target.value }))}
                    placeholder="Enter UPI Txn ID"
                    className="form-input text-sm"
                  />
                </div>

                {/* Admin Note */}
                <div>
                  <label className="form-label">Admin Note</label>
                  <textarea
                    value={editFields.adminNote}
                    onChange={e => setEditFields(p => ({ ...p, adminNote: e.target.value }))}
                    placeholder="Internal note..."
                    rows={3}
                    className="form-input text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/10 flex gap-3">
              <button onClick={closeModal}
                className="flex-1 border border-white/10 text-gray-300 rounded-xl py-2.5 text-sm font-bold hover:border-white/30 transition-colors">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 bg-gold text-black rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving
                  ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}