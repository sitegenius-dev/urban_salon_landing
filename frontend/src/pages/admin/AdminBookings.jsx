import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Search, Filter, Download, Trash2, Edit2, X, Check } from 'lucide-react';

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'cancelled'];
const PAY_STATUSES = ['unpaid', 'partial', 'paid'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);

  const [filters, setFilters] = useState({
    search: '', status: '', dateFrom: '', dateTo: '',
  });
  const [editId,   setEditId]   = useState(null);
  const [editData, setEditData] = useState({});

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
    finally   { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleFilterChange = (k, v) => {
    setFilters(p => ({ ...p, [k]: v }));
    setPage(1);
  };

  const startEdit = (b) => {
    setEditId(b.id);
    setEditData({ bookingStatus: b.bookingStatus, paymentStatus: b.paymentStatus, adminNote: b.adminNote || '' });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/bookings/admin/${id}`, editData);
      toast.success('Updated');
      setEditId(null);
      fetchBookings();
    } catch { toast.error('Update failed'); }
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
      const a   = document.createElement('a');
      a.href = url;
      a.download = `bookings-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  return (
    <AdminLayout panel="admin">
      <div className="space-y-5">
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
              {STATUSES.filter(Boolean).map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)}
              className="form-input text-sm" placeholder="From date" />
            <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)}
              className="form-input text-sm" placeholder="To date" />
          </div>
          {(filters.search || filters.status || filters.dateFrom || filters.dateTo) && (
            <button onClick={() => { setFilters({ search:'', status:'', dateFrom:'', dateTo:'' }); setPage(1); }}
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
                    <th>Date / Slot</th>
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
                        <div>{new Date(b.travelDate + 'T00:00:00').toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</div>
                        <div className="text-gray-500 text-xs">{b.timeSlot}</div>
                      </td>
                      <td className="text-sm whitespace-nowrap">
                        <div>₹{parseFloat(b.totalFare).toFixed(0)}</div>
                        {b.partialPaymentAmount > 0 && (
                          <div className="text-gray-500 text-xs">Adv: ₹{parseFloat(b.partialPaymentAmount).toFixed(0)}</div>
                        )}
                      </td>

                      {/* Inline edit or display */}
                      {editId === b.id ? (
                        <>
                          <td>
                            <select value={editData.bookingStatus}
                              onChange={e => setEditData(p => ({ ...p, bookingStatus: e.target.value }))}
                              className="form-input text-xs py-1 px-2">
                              {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td>
                            <select value={editData.paymentStatus}
                              onChange={e => setEditData(p => ({ ...p, paymentStatus: e.target.value }))}
                              className="form-input text-xs py-1 px-2">
                              {PAY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button onClick={() => saveEdit(b.id)}
                                className="p-1.5 bg-green-900/50 hover:bg-green-900 text-green-400 rounded">
                                <Check size={14} />
                              </button>
                              <button onClick={() => setEditId(null)}
                                className="p-1.5 bg-red-900/50 hover:bg-red-900 text-red-400 rounded">
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td><span className={`badge badge-${b.bookingStatus}`}>{b.bookingStatus}</span></td>
                          {/* <td><span className={`badge badge-${b.paymentStatus}`}>{b.paymentStatus}</span></td> */}
                          {/* <td> */}
                          <td><span className={`badge badge-${b.paymentStatus}`}>{b.paymentStatus}</span></td>
<td className="text-xs text-gray-400 font-mono">{b.upiTransactionId || '—'}</td>
<td>
                            <div className="flex gap-1">
                              <button onClick={() => startEdit(b)}
                                className="p-1.5 bg-blue-900/40 hover:bg-blue-900 text-blue-400 rounded">
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => deleteBooking(b.id, b.passengerName)}
                                className="p-1.5 bg-red-900/40 hover:bg-red-900 text-red-400 rounded">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    // <tr><td colSpan={8} className="text-center text-gray-600 py-12">No bookings found</td></tr>
                    <tr><td colSpan={9} className="text-center text-gray-600 py-12">No bookings found</td></tr>
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
    </AdminLayout>
  );
}
