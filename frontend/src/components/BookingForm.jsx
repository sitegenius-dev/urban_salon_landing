import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, Copy, ChevronDown, Info, X, Clock, Scissors } from 'lucide-react';

/* ─── tiny helpers ─── */
const Err = ({ msg }) => msg ? <p className="text-red-400 text-xs mt-1 flex items-center gap-1">⚠ {msg}</p> : null;

const inputCls = (err) =>
  `w-full bg-white/60 border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white focus:shadow-sm ${err ? 'border-red-300' : 'border-gray-200'}`;

/* ─── Service Info Popover ─── */
function ServiceInfoPopover({ service, onClose }) {
  return (
    <div className="absolute z-50 left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 text-sm"
      style={{ top: '100%' }}>
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X size={14} />
      </button>
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Scissors size={14} className="text-gray-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 leading-tight">{service.name}</p>
          {service.price > 0 && (
            <p className="text-gray-500 text-xs">₹{parseFloat(service.price).toFixed(0)}</p>
          )}
        </div>
      </div>
      {service.description ? (
        <p className="text-gray-600 text-xs leading-relaxed">{service.description}</p>
      ) : (
        <p className="text-gray-400 text-xs italic">No description available.</p>
      )}
      {service.duration && (
        <div className="mt-2 flex items-center gap-1 text-gray-400 text-xs">
          <Clock size={11} /> {service.duration} min
        </div>
      )}
    </div>
  );
}

/* ─── Selected Services Modal ─── */
function SelectedServicesModal({ services, serviceIds, onRemove, onClose }) {
  if (serviceIds.length === 0) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black text-gray-900">Selected Services</h3>
            <p className="text-xs text-gray-400">{serviceIds.length} service{serviceIds.length > 1 ? 's' : ''} selected</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Services list */}
        <div className="overflow-y-auto max-h-96 divide-y divide-gray-50 px-5 py-3">
          {serviceIds.map(id => {
            const svc = services.find(s => String(s.id) === String(id));
            if (!svc) return null;
            return (
              <div key={id} className="py-4 flex items-start gap-3">
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Scissors size={15} className="text-gray-600" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900">{svc.name}</p>
                    {svc.price > 0 && (
                      <span className="text-sm font-black text-gray-800 flex-shrink-0">₹{parseFloat(svc.price).toFixed(0)}</span>
                    )}
                  </div>
                  {svc.description && (
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">{svc.description}</p>
                  )}
                  {svc.duration && (
                    <div className="flex items-center gap-1 mt-1.5 text-gray-400 text-xs">
                      <Clock size={10} /> {svc.duration} min
                    </div>
                  )}
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => onRemove(String(svc.id))}
                    className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                  >
                    − Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-bold">
            Done ✓
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Service Selector Dropdown ─── */
function ServiceSelector({ services, serviceIds, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [activeInfo, setActiveInfo] = useState(null); // service object
  const ref = useRef(null);

  const categories = services.reduce((acc, svc) => {
    const cat = svc.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setActiveInfo(null); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedNames = serviceIds.map(id => {
    const s = services.find(svc => String(svc.id) === String(id));
    return s?.name || '';
  }).filter(Boolean);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm border transition-all outline-none ${error ? 'border-red-300' : 'border-gray-200'} ${open ? 'border-gray-400 bg-white shadow-sm' : 'bg-white/60 hover:border-gray-300'}`}
      >
        <span className={serviceIds.length === 0 ? 'text-gray-400' : 'text-gray-800 font-medium'}>
          {serviceIds.length === 0 ? 'Select services' : `${selectedNames.join(', ')}`}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-40 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
            {Object.entries(categories).map(([cat, svcs]) => (
              <div key={cat}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4 pt-3 pb-1">{cat}</p>
                {svcs.map(s => {
                  const checked = serviceIds.includes(String(s.id));
                  const isInfoOpen = activeInfo?.id === s.id;
                  return (
                    <div key={s.id} className="relative">
                      <label className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-gray-50 ${checked ? 'bg-gray-50' : ''}`}>
                        {/* custom checkbox */}
                        <span className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${checked ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                          {checked && <span className="block w-2 h-2 rounded-sm bg-white" />}
                        </span>
                        <input
                          type="checkbox"
                          name="serviceId"
                          value={String(s.id)}
                          checked={checked}
                          onChange={onChange}
                          className="sr-only"
                        />
                        <span className="flex-1 text-sm text-gray-800">{s.name}</span>
                        {s.price > 0 && (
                          <span className="text-xs text-gray-400 font-medium">₹{parseFloat(s.price).toFixed(0)}</span>
                        )}
                        {/* Info icon */}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveInfo(isInfoOpen ? null : s); }}
                          className={`p-1 rounded-full transition-colors ${isInfoOpen ? 'text-gray-700 bg-gray-100' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                          <Info size={13} />
                        </button>
                      </label>
                      {/* Info popover */}
                      {isInfoOpen && (
                        <div className="px-4 pb-3">
                          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed border border-gray-100">
                            {s.description || 'No description available for this service.'}
                            {s.duration && (
                              <div className="mt-1.5 flex items-center gap-1 text-gray-400">
                                <Clock size={10} /> {s.duration} min
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Footer summary */}
          {serviceIds.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-gray-500">{serviceIds.length} selected</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-gray-800 hover:text-black"
              >
                Done ✓
              </button>
            </div>
          )}
        </div>
      )}

      <Err msg={error} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                    */
/* ══════════════════════════════════════════════════════════════════ */
export default function BookingForm({ services, staff }) {
  const [step, setStep] = useState('form');
  const [pendingBooking, setPendingBooking] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [paymentQr, setPaymentQr] = useState('');

  const [form, setForm] = useState({
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    serviceName: '',
    serviceIds: [],
    serviceNames: [],
    travelDate: '',
    timeSlot: '',
    staffId: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  useEffect(() => {
    api.get('/settings/public')
      .then(res => { if (res.data?.payment_qr_image) setPaymentQr(res.data.payment_qr_image); })
      .catch(() => { });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.passengerName.trim()) e.passengerName = 'Name is required';
    if (!form.passengerPhone.trim() || form.passengerPhone.replace(/\D/g, '').length < 7)
      e.passengerPhone = 'Valid phone number required';
    if (!form.travelDate) e.travelDate = 'Appointment date is required';
    if (form.serviceIds.length === 0) e.serviceName = 'Please select at least one service';
    if (form.passengerEmail && !/\S+@\S+\.\S+/.test(form.passengerEmail))
      e.passengerEmail = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fetchSlots = async (date) => {
    setSlotsLoading(true);
    try {
      const res = await api.get(`/bookings/available-slots?date=${date}`);
      setSlots(res.data.slots);
    } catch {
      toast.error('Could not load available slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'serviceId') {
      const id = value;
      setForm(prev => {
        const alreadySelected = prev.serviceIds.includes(id);
        const newIds = alreadySelected ? prev.serviceIds.filter(x => x !== id) : [...prev.serviceIds, id];
        const newNames = newIds.map(i => {
          const svc = services.find(s => String(s.id) === String(i));
          return svc ? svc.name : '';
        });
        return { ...prev, serviceIds: newIds, serviceNames: newNames, serviceName: newNames.join(', ') };
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'travelDate' && value) {
      fetchSlots(value);
      setForm(prev => ({ ...prev, timeSlot: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        passengerName: form.passengerName.trim(),
        passengerPhone: form.passengerPhone.trim(),
        serviceName: form.serviceNames.join(', '),
        travelDate: form.travelDate,
        timeSlot: form.timeSlot,
      };
      if (form.passengerEmail) payload.passengerEmail = form.passengerEmail;
      if (form.serviceIds.length > 0) payload.serviceIds = form.serviceIds.map(Number);
      if (form.serviceIds.length > 0) payload.serviceId = Number(form.serviceIds[0]);
      if (form.staffId) payload.staffId = parseInt(form.staffId);
      if (form.message) payload.message = form.message;
      const res = await api.post('/bookings', payload);
      setPendingBooking(res.data.preview);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!upiId.trim()) { setUpiError('UPI Transaction ID required'); return; }
    setLoading(true);
    try {
      const res = await api.put(`/bookings/confirm-payment/new`, {
        upiTransactionId: upiId.trim(),
        bookingData: pendingBooking,
      });
      setSuccess(res.data.booking);
      setStep('success');
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error('Could not confirm payment. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(null); setStep('form'); setPendingBooking(null);
    setUpiId(''); setUpiError('');
    setForm({ passengerName: '', passengerPhone: '', passengerEmail: '', gender: 'Male', serviceName: '', serviceIds: [], serviceNames: [], travelDate: '', timeSlot: '', staffId: '', message: '' });
    setSlots([]);
  };

  /* ── PAYMENT STEP ── */
  if (step === 'payment') {
    return (
      <section id="booking" className="bg-white py-12 px-4">
        <div className="max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">₹</span>
            </div>
            <h3 className="text-xl font-black text-gray-900">Complete Payment</h3>
            <p className="text-gray-400 text-sm mt-1">Scan & pay the advance to confirm your slot</p>
          </div>

          {/* QR Card */}
          <div className="border border-gray-100 rounded-2xl p-5 mb-4 text-center shadow-sm">
            {paymentQr ? (
              <img src={`${import.meta.env.VITE_BASE_URL}${paymentQr}`} alt="Payment QR"
                className="w-44 h-44 mx-auto mb-3 object-contain" />
            ) : (
              <div className="w-44 h-44 mx-auto mb-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 text-xs">QR not set</div>
            )}
            {pendingBooking?.partialPaymentAmount > 0 && (
              <>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Advance</p>
                <p className="text-3xl font-black text-gray-900">₹{parseFloat(pendingBooking.partialPaymentAmount).toFixed(0)}</p>
              </>
            )}
          </div>

          {/* UPI Input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">UPI Transaction ID</label>
            <input
              value={upiId}
              onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
              placeholder="Enter transaction ID after payment"
              className={inputCls(upiError)}
            />
            <Err msg={upiError} />
          </div>

          <button onClick={handlePaymentSubmit} disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide disabled:opacity-50 transition-opacity">
            {loading ? 'Confirming…' : 'Confirm Booking →'}
          </button>
          <button onClick={resetForm} className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
            ← Cancel & go back
          </button>
        </div>
      </section>
    );
  }

  /* ── SUCCESS STEP ── */
  if (step === 'success' || success) {
    return (
      // <section id="booking" className="bg-white py-12 px-4">
      //   <div className="max-w-sm mx-auto text-center">
      //     <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
      <section id="booking" className="bg-[#f0f0f0] py-12 px-4">
        <div className="max-w-sm mx-auto text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-black text-gray-900 mb-1">Booking Confirmed!</h3>
          <p className="text-gray-400 text-sm mb-5">We'll contact you shortly to confirm your appointment.</p>

          {/* Booking ID */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Booking ID</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-black text-gray-900 font-mono">{success.bookingId}</span>
              <button onClick={() => { navigator.clipboard.writeText(success.bookingId); toast.success('Copied!'); }}
                className="text-gray-400 hover:text-black p-1 transition-colors">
                <Copy size={15} />
              </button>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 text-sm text-left mb-4">
            {[
              { label: 'Customer', value: success.passengerName },
              { label: 'Service', value: success.serviceName },
              { label: 'Date', value: new Date(success.travelDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { label: 'Time Slot', value: success.timeSlot },
              { label: 'Gender', value: success.gender },
              { label: 'Status', value: success.bookingStatus?.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                <div className="font-semibold text-gray-800 text-sm">{value}</div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
            <p className="text-amber-800 text-xs font-semibold mb-1">📌 Important</p>
            <p className="text-amber-700 text-xs leading-relaxed">Track your booking using the <strong>Tracking</strong> option with your Booking ID. You can also update an incorrect UPI Transaction ID from the tracking form.</p>
          </div>
        </div>
      </section>
    );
  }

  /* ── BOOKING FORM ── */
  return (
    // <section id="booking" className="bg-white px-4 pt-8 pb-10">
    <section id="booking" className="bg-[#f0f0f0] px-4 pt-8 pb-10">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-black text-gray-900 mb-1">Book Appointment</h2>
        <p className="text-gray-400 text-sm mb-6">Fill in your details to reserve your slot</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Row 1: Name + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Name</label>
              <input name="passengerName" value={form.passengerName} onChange={handleChange}
                placeholder="Your name" className={inputCls(errors.passengerName)} />
              <Err msg={errors.passengerName} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Phone</label>
              <input name="passengerPhone" value={form.passengerPhone} onChange={handleChange}
                placeholder="+91 XXXXX XXXXX" className={inputCls(errors.passengerPhone)} />
              <Err msg={errors.passengerPhone} />
            </div>
          </div>

          {/* Row 2: Date + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Date</label>
              <input name="travelDate" type="date" value={form.travelDate} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} className={inputCls(errors.travelDate)} />
              <Err msg={errors.travelDate} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Email <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
              <input name="passengerEmail" value={form.passengerEmail} onChange={handleChange}
                placeholder="you@email.com" className={inputCls(errors.passengerEmail)} />
              <Err msg={errors.passengerEmail} />
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Time Slot</label>
            {!form.travelDate && (
              <p className="text-gray-400 text-xs italic py-3">Select a date first to see available slots</p>
            )}
            {form.travelDate && slotsLoading && (
              <div className="flex items-center gap-2 py-3 text-gray-400 text-xs">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                Loading slots…
              </div>
            )}
            {form.travelDate && !slotsLoading && slots.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {slots.map(({ slot, available }) => {
                  const isFull = available === 0;
                  const isSelected = form.timeSlot === slot;
                  return (
                    <button key={slot} type="button" disabled={isFull}
                      onClick={() => setForm(prev => ({ ...prev, timeSlot: slot }))}
                      className={`py-2 px-1 text-xs font-medium border rounded-xl transition-all text-center
                        ${isFull ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                          : isSelected ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                      <div className="font-semibold">{slot}</div>
                      <div className={`text-[10px] font-normal mt-0.5 ${isFull ? 'text-gray-300' : isSelected ? 'text-gray-300' : 'text-green-600'}`}>
                        {isFull ? 'Full' : `${available} left`}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {form.travelDate && !slotsLoading && slots.length === 0 && (
              <p className="text-red-400 text-xs italic py-2">No slots available for this date</p>
            )}
          </div>

          {/* Service Selector */}
          {/* Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Services <span className="text-gray-300 normal-case font-normal">(tap ⓘ for details)</span>
            </label>
            <ServiceSelector
              services={services}
              serviceIds={form.serviceIds}
              onChange={handleChange}
              error={errors.serviceName}
            />

            {/* ── View selected button ── */}
            {form.serviceIds.length > 0 && (
              <button
                type="button"
                onClick={() => setShowServicesModal(true)}
                className="mt-2 flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-black transition-colors bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full"
              >
                <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                  {form.serviceIds.length}
                </span>
                View selected services & details
                <span className="ml-auto text-gray-400">→</span>
              </button>
            )}
          </div>

          {/* Modal */}
          {showServicesModal && (
            <SelectedServicesModal
              services={services}
              serviceIds={form.serviceIds}
              onRemove={(id) => handleChange({ target: { name: 'serviceId', value: id } })}
              onClose={() => setShowServicesModal(false)}
            />
          )}
          {/* <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Services <span className="text-gray-300 normal-case font-normal">(tap ⓘ for details)</span>
            </label>
            <ServiceSelector
              services={services}
              serviceIds={form.serviceIds}
              onChange={handleChange}
              error={errors.serviceName}
            />
          </div> */}

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Message <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={2}
              placeholder="Any special request…" className={`${inputCls('message')} resize-none`} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
            ) : 'Book Appointment →'}
          </button>

        </form>
      </div>
    </section>
  );
}