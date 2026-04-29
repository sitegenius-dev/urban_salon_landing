import { useState } from 'react';
import api from '../api/axios';
import { Search, X, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: Clock, label: 'Pending' },
  confirmed: { color: 'text-green-400', bg: 'bg-green-900/30', icon: CheckCircle, label: 'Confirmed' },
  completed: { color: 'text-blue-400', bg: 'bg-blue-900/30', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'text-red-400', bg: 'bg-red-900/30', icon: XCircle, label: 'Cancelled' },
};

const PAY_CONFIG = {
  unpaid: { color: 'text-orange-400', label: 'Unpaid' },
  partial: { color: 'text-yellow-400', label: 'Partial' },
  paid: { color: 'text-green-400', label: 'Paid' },
};

function UpiUpdateSection({ bookingId, bookingDbId }) {
  const [open, setOpen] = useState(false);
  const [newUpi, setNewUpi] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpdate = async () => {
    if (!newUpi.trim()) { setMsg('Please enter a transaction ID'); return; }
    setSaving(true);
    setMsg('');
    try {
      await api.put(`/bookings/update-upi/${bookingId}`, { upiTransactionId: newUpi.trim() });
      // setMsg('Transaction ID updated successfully!');
      // setNewUpi('');
      // setOpen(false);
      setMsg('Transaction ID updated successfully!');
setNewUpi('');
setTimeout(() => setOpen(false), 2000);
    } catch {
      setMsg('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-amber-200 rounded-xl overflow-hidden">
      <button
        onClick={() => { setOpen(p => !p); setMsg(''); }}
        className="w-full py-2.5 px-4 bg-amber-50 text-amber-700 text-sm font-medium flex items-center justify-between"
      >
        <span>Update UPI Transaction ID</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="p-4 bg-white space-y-3">
          <p className="text-xs text-gray-500">
            If you entered a wrong transaction ID, enter the correct one below and submit.
          </p>
          <input
            value={newUpi}
            onChange={e => { setNewUpi(e.target.value); setMsg(''); }}
            placeholder="Enter correct UPI Transaction ID"
            className="w-full border-b border-gray-300 py-2 text-sm outline-none"
          />
          {/* {msg && (
            <p className={`text-xs ${msg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
          )} */}
          {msg && (
            <div className={`rounded-lg px-3 py-2.5 text-xs font-medium flex items-center gap-2 ${msg.includes('success')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
              <span>{msg.includes('success') ? '✅' : '❌'}</span>
              <span>{msg}</span>
            </div>
          )}
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="w-full bg-black text-white py-2.5 text-sm font-bold rounded-lg disabled:opacity-60"
          >
            {saving ? 'Updating...' : 'Submit Update'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookingTracker() {
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    const id = bookingId.trim().toUpperCase();
    if (!id) { setError('Please enter a booking ID'); return; }
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const res = await api.get(`/bookings/track/${id}`);
      setBooking(res.data.booking);
    } catch (err) {
      setError(err.response?.status === 404
        ? 'No booking found with that ID. Please check and try again.'
        : 'Failed to fetch booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setBooking(null); setError(''); setBookingId(''); };

  const st = booking ? (STATUS_CONFIG[booking.bookingStatus] || STATUS_CONFIG.pending) : null;
  const pt = booking ? (PAY_CONFIG[booking.paymentStatus] || PAY_CONFIG.unpaid) : null;

  return (
    <section className="py-14  px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-1">Already Booked?</p>
          <h2 className="text-2xl font-black text-gray-900">Track Your Appointment</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your Booking ID to check status</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
          <input
            value={bookingId}
            onChange={e => { setBookingId(e.target.value); setError(''); }}
            placeholder="e.g. RNR-20240401-0001"
            className="pub-input flex-1 font-mono text-sm uppercase"
          />
          <button type="submit" disabled={loading}
            className="btn-gold px-5 py-3 rounded-xl font-bold flex items-center gap-2 flex-shrink-0 disabled:opacity-60">
            {loading
              ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <Search size={16} />}
            {loading ? '' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {booking && st && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Status header */}
            <div className={`px-5 py-4 ${st.bg} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <st.icon size={18} className={st.color} />
                <span className={`font-bold text-sm ${st.color}`}>{st.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs font-mono">{booking.bookingId}</span>
                <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Customer</div>
                <div className="font-semibold text-gray-900">{booking.passengerName}</div>
                <div className="text-gray-500">{booking.passengerPhone}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Service</div>
                <div className="font-semibold text-gray-900">{booking.serviceName}</div>
                {booking.service?.category && (
                  <div className="text-gray-500 text-xs">{booking.service.category}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Appointment</div>
                <div className="font-semibold text-gray-900">
                  {new Date(booking.travelDate + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </div>
                <div className="text-gray-500 text-xs">{booking.timeSlot}</div>
              </div>
              {/* <div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Payment</div>
                <div className={`font-bold ${pt.color}`}>{pt.label}</div>
                {booking.totalFare > 0 && (
                  <div className="text-gray-500 text-xs">₹{parseFloat(booking.totalFare).toFixed(0)} total</div>
                )}
              </div> */}
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Payment</div>
                <div className={`font-bold ${pt.color}`}>{pt.label}</div>
                {booking.totalFare > 0 && (
                  <div className="text-gray-500 text-xs">₹{parseFloat(booking.totalFare).toFixed(0)} total</div>
                )}
                {booking.partialPaymentAmount > 0 && (
                  <div className="text-xs mt-1 text-gray-600 font-medium">
                    Advance paid: ₹{parseFloat(booking.partialPaymentAmount).toFixed(0)}
                  </div>
                )}
                {booking.remainingAmount > 0 && (
                  <div className="text-xs text-gray-400">
                    Remaining: ₹{parseFloat(booking.remainingAmount).toFixed(0)}
                  </div>
                )}
              </div>
              {booking.staff?.name && (
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Assigned Staff</div>
                  <div className="font-semibold text-gray-900">{booking.staff.name}</div>
                  <div className="text-gray-500 text-xs">{booking.staff.role}</div>
                </div>
              )}
              {booking.adminNote && (
                <div className="col-span-2">
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Note from Salon</div>
                  <div className="text-gray-700 bg-gray-50 rounded-lg px-3 py-2 text-xs">{booking.adminNote}</div>
                </div>
              )}
            </div>

            <div className="px-5 pb-4">
              {/* <button onClick={reset}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm hover:border-gold hover:text-gold transition-colors font-medium">
                Track Another Booking
              </button> */}
              <div className="px-5 pb-5 space-y-3">
                {/* Update Transaction ID Section */}
                <UpiUpdateSection bookingId={booking.bookingId} bookingDbId={booking.id} />

                <button onClick={reset}
                  className="w-full py-2.5 border border-gray-200 rounded-xl text-gray-500 text-sm hover:border-gold hover:text-gold transition-colors font-medium">
                  Track Another Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
