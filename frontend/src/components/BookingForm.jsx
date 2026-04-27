import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, Copy } from 'lucide-react';

export default function BookingForm({ services, staff }) {
  // ── Payment flow state ──────────────────────────────────────────────────────
  const [step, setStep] = useState('form'); // 'form' | 'payment' | 'success'
  const [pendingBooking, setPendingBooking] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [paymentQr, setPaymentQr] = useState('');

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    // gender: 'Male',
    // serviceName: '',
    // serviceId: '',
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
  const [servicesOpen, setServicesOpen] = useState(false);

  // ── Fetch QR from settings on mount ────────────────────────────────────────
  useEffect(() => {
    api.get('/settings/public')
      .then(res => {
        if (res.data?.payment_qr_image) setPaymentQr(res.data.payment_qr_image);
      })
      .catch(() => { }); // silent fail — QR optional
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.passengerName.trim()) e.passengerName = 'Name is required';
    if (!form.passengerPhone.trim() || form.passengerPhone.replace(/\D/g, '').length < 7)
      e.passengerPhone = 'Valid phone number required';
    if (!form.travelDate) e.travelDate = 'Appointment date is required';
    // if (!form.serviceName) e.serviceName = 'Please select a service';
    if (form.serviceIds.length === 0) e.serviceName = 'Please select at least one service';
    if (form.passengerEmail && !/\S+@\S+\.\S+/.test(form.passengerEmail))
      e.passengerEmail = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Fetch available slots ───────────────────────────────────────────────────
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

  // ── Handle form field changes ───────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    // if (name === 'serviceId') {
    //   const svc = services.find(s => String(s.id) === value);
    //   setForm(prev => ({ ...prev, serviceId: value, serviceName: svc ? svc.name : '' }));
    // }
    if (name === 'serviceId') {
      const id = value;
      setForm(prev => {
        const alreadySelected = prev.serviceIds.includes(id);
        const newIds = alreadySelected
          ? prev.serviceIds.filter(x => x !== id)
          : [...prev.serviceIds, id];
        const newNames = newIds.map(i => {
          const svc = services.find(s => String(s.id) === String(i));
          return svc ? svc.name : '';
        });
        return { ...prev, serviceIds: newIds, serviceNames: newNames, serviceName: newNames.join(', ') };

      });
      setServicesOpen(false);
    }
    else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'travelDate' && value) {
      fetchSlots(value);
      setForm(prev => ({ ...prev, timeSlot: '' }));
    }
  };

  // ── Submit booking (goes to payment step) ──────────────────────────────────
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     if (!validate()) return;
  //     setLoading(true);
  //     try {
  //       const payload = {
  //         passengerName: form.passengerName.trim(),
  //         passengerPhone: form.passengerPhone.trim(),
  //         // gender: form.gender,
  //         // serviceName: form.serviceName,
  //         serviceName: form.serviceNames.join(', '),
  //         travelDate: form.travelDate,
  //         timeSlot: form.timeSlot,
  //       };
  //       if (form.passengerEmail) payload.passengerEmail = form.passengerEmail;
  //       // if (form.serviceId) payload.serviceId = parseInt(form.serviceId);
  //       // if (form.serviceIds.length > 0) payload.serviceIds = form.serviceIds.map(Number);

  // if (form.serviceIds.length > 0) payload.serviceId = Number(form.serviceIds[0]);
  //       if (form.staffId) payload.staffId = parseInt(form.staffId);
  //       if (form.message) payload.message = form.message;

  //       const res = await api.post('/bookings', payload);
  //       setPendingBooking(res.data.booking);
  //       setStep('payment');
  //     } catch (err) {
  //       toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
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
      // ✅ preview data save करतो — DB मध्ये अजून गेलेलं नाही
      setPendingBooking(res.data.preview);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit UPI transaction ID → confirm booking ────────────────────────────
  // const handlePaymentSubmit = async () => {
  //   if (!upiId.trim()) { setUpiError('UPI Transaction ID required'); return; }
  //   setLoading(true);
  //   try {
  //     // await api.put(`/bookings/admin/${pendingBooking.id}`, {
  //     //   upiTransactionId: upiId.trim(),
  //     //   bookingStatus: 'confirmed',
  //     //   paymentStatus: 'partial',
  //     // });
  //     await api.put(`/bookings/confirm-payment/${pendingBooking.id}`, {
  //       upiTransactionId: upiId.trim(),
  //     });
  //     setSuccess({ ...pendingBooking, upiTransactionId: upiId });
  //     setStep('success');
  //     toast.success('Booking confirmed!');
  //   } catch (err) {
  //     toast.error('Could not confirm payment. Try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handlePaymentSubmit = async () => {
    if (!upiId.trim()) { setUpiError('UPI Transaction ID required'); return; }
    setLoading(true);
    try {
      // ✅ आता इथे पहिल्यांदा DB मध्ये save होतं — transaction ID सोबत
      const res = await api.put(`/bookings/confirm-payment/new`, {
        upiTransactionId: upiId.trim(),
        bookingData: pendingBooking,   // सगळा form data पाठवतो
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

  // ── Reset ───────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setSuccess(null);
    setStep('form');
    setPendingBooking(null);
    setUpiId('');
    setUpiError('');
    setForm({
      passengerName: '', passengerPhone: '', passengerEmail: '', gender: 'Male',
      serviceName: '', serviceIds: [], serviceNames: [], travelDate: '', timeSlot: '', staffId: '', message: ''
    });
    setSlots([]);
  };

  const categories = services.reduce((acc, svc) => {
    const cat = svc.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  const Err = ({ field }) => errors[field]
    ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;

  const inputCls = (field) =>
    `w-full bg-transparent border-0 border-b py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-600 transition-colors ${errors[field] ? 'border-red-400' : 'border-[#DADADA]'
    }`;

  const labelCls = 'block text-sm font-medium text-gray-900 mb-1';

  // ── Payment step ────────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <section id="booking" className="bg-white py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h3 className="text-2xl font-black text-gray-900 mb-2">Complete Payment</h3>
          <p className="text-gray-500 mb-6">
            Scan the QR code and pay the advance amount to confirm your booking.
          </p>

          {/* QR Image */}
          {paymentQr ? (
            <img

              src={`${import.meta.env.VITE_BASE_URL}${paymentQr}`}
              alt="Payment QR"
              className="w-56 h-56 mx-auto mb-6 border rounded-xl object-contain"
            />
          ) : (
            <div className="w-56 h-56 mx-auto mb-6 border rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
              QR not set by admin
            </div>
          )}

          {/* Advance Amount */}
          {pendingBooking?.partialPaymentAmount > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Advance Amount</div>
              <div className="text-2xl font-black text-gray-900">
                ₹{parseFloat(pendingBooking.partialPaymentAmount).toFixed(0)}
              </div>
            </div>
          )}

          {/* UPI Transaction ID */}
          <div className="text-left mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              UPI Transaction ID:
            </label>
            <input
              value={upiId}
              onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
              placeholder="Enter UPI transaction ID after payment"
              className="w-full border-b border-[#DADADA] py-3 text-sm outline-none"
            />
            {upiError && <p className="text-red-500 text-xs mt-1">{upiError}</p>}
          </div>

          <button
            onClick={handlePaymentSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-4 font-bold text-base tracking-wide disabled:opacity-60"
          >
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>

          <button
            onClick={resetForm}
            className="mt-3 text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Cancel & go back
          </button>
        </div>
      </section>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === 'success' || success) {
    return (
      <section id="booking" className="bg-white py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-gray-900 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-500 mb-6">We'll contact you shortly to confirm your appointment.</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest">Your Booking ID</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-black text-gray-900 font-mono">{success.bookingId}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(success.bookingId); toast.success('Copied!'); }}
                className="text-gray-500 hover:text-black p-1"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-left mb-6">
            {[
              { label: 'Customer', value: success.passengerName },
              { label: 'Service', value: success.serviceName },
              { label: 'Date', value: new Date(success.travelDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { label: 'Time Slot', value: success.timeSlot },
              { label: 'Gender', value: success.gender },
              { label: 'Status', value: success.bookingStatus?.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                <div className="font-semibold text-gray-800">{value}</div>
              </div>
            ))}
          </div>

          {/* <button
            onClick={resetForm}
            className="w-full bg-black text-white py-4 rounded-none font-bold text-base tracking-wide"
          >
            Book Another Appointment
          </button> */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-left">
            <p className="text-amber-800 text-sm font-semibold mb-1">📌 Important Note</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              You can track your booking status using the <strong>Tracking</strong> option on this page with your Booking ID shown above.
            </p>
            <p className="text-amber-600 text-xs mt-2 leading-relaxed">
              If you entered an incorrect UPI Transaction ID, you can update it from the tracking form using the "Update Transaction ID" option.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Booking form ────────────────────────────────────────────────────────────
  return (
    <section id="booking" className="bg-white px-5 pt-8 pb-10">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Book Your Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label className={labelCls}>Name:</label>
            <input
              name="passengerName"
              value={form.passengerName}
              onChange={handleChange}
              placeholder="Enter your name"
              className={inputCls('passengerName')}
            />
            <Err field="passengerName" />
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>Phone Number:</label>
            <input
              name="passengerPhone"
              value={form.passengerPhone}
              onChange={handleChange}
              placeholder="Enter your +91 XXXXX XXXXX"
              className={inputCls('passengerPhone')}
            />
            <Err field="passengerPhone" />
          </div>

          {/* Appointment Date */}
          <div>
            <label className={labelCls}>Appointment Date:</label>
            <input
              name="travelDate"
              type="date"
              value={form.travelDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={inputCls('travelDate')}
            />
            <Err field="travelDate" />
          </div>

          {/* Time Slot */}
          <div>
            <label className={labelCls}>Preferred Time Slot:</label>

            {!form.travelDate && (
              <p className="text-gray-400 text-sm py-3 border-b border-[#DADADA]">
                Please select a date first
              </p>
            )}

            {form.travelDate && slotsLoading && (
              <p className="text-gray-400 text-sm py-3 border-b border-[#DADADA]">
                Loading available slots...
              </p>
            )}

            {form.travelDate && !slotsLoading && slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {slots.map(({ slot, available }) => {
                  const isFull = available === 0;
                  const isSelected = form.timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isFull}
                      onClick={() => setForm(prev => ({ ...prev, timeSlot: slot }))}
                      className={`py-2 px-2 text-sm font-medium border transition-all rounded-none
                        ${isFull
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                          : isSelected
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-[#DADADA] hover:border-gray-500'
                        }`}
                    >
                      <div>{slot}</div>
                      <div className={`text-xs font-normal ${isFull ? 'text-gray-400' : 'text-green-600'}`}>
                        {isFull ? 'Full' : `${available} left`}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {form.travelDate && !slotsLoading && slots.length === 0 && (
              <p className="text-red-400 text-sm py-3">No slots available for this date</p>
            )}
          </div>

          {/* Gender + Service Type */}
          {/* <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Gender:</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputCls('gender')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Service Type:</label>
              <select name="serviceId" value={form.serviceId} onChange={handleChange} className={inputCls('serviceName')}>
                <option value="">Select service</option>
                {Object.entries(categories).map(([cat, svcs]) => (
                  <optgroup key={cat} label={cat}>
                    {svcs.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.price > 0 ? ` — ₹${parseFloat(s.price).toFixed(0)}` : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <Err field="serviceName" />
            </div>
          </div> */}
          {/* <div>
            <label className={labelCls}>Service Type:</label>
            <div className="mt-2 max-h-40 overflow-y-auto border border-[#DADADA] p-2 space-y-1">
              {Object.entries(categories).map(([cat, svcs]) => (
                <div key={cat}>
                  <p className="text-xs text-gray-400 uppercase font-semibold mt-1">{cat}</p>
                  {svcs.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        name="serviceId"
                        value={String(s.id)}
                        checked={form.serviceIds.includes(String(s.id))}
                        onChange={handleChange}
                      />
                      <span>{s.name}{s.price > 0 ? ` — ₹${parseFloat(s.price).toFixed(0)}` : ''}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <Err field="serviceName" />
          </div> */}
          {/* Service Type */}
          <div>
            <label className={labelCls}>Service Type:</label>

            {/* Trigger button */}
            <button
              type="button"
              onClick={() => setServicesOpen(prev => !prev)}
              className="w-full flex items-center justify-between border-b border-[#DADADA] py-3 text-sm text-gray-800 outline-none"
            >
              <span className={form.serviceIds.length === 0 ? 'text-gray-400' : 'text-gray-800'}>
                {form.serviceIds.length === 0
                  ? 'Select services'
                  : `${form.serviceIds.length} service(s) selected`}
              </span>
              <span className="text-gray-500">{servicesOpen ? '▲' : '▼'}</span>
            </button>

            {/* Dropdown — conditional render */}
            {servicesOpen && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-[#DADADA] p-2 space-y-1">
                {Object.entries(categories).map(([cat, svcs]) => (
                  <div key={cat}>
                    <p className="text-xs text-gray-400 uppercase font-semibold mt-1">{cat}</p>
                    {svcs.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                        <input
                          type="checkbox"
                          name="serviceId"
                          value={String(s.id)}
                          checked={form.serviceIds.includes(String(s.id))}
                          onChange={handleChange}
                        />
                        <span>{s.name}{s.price > 0 ? ` — ₹${parseFloat(s.price).toFixed(0)}` : ''}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <Err field="serviceName" />
          </div>

          {/* Message */}
          <div>
            <label className={labelCls}>Message:</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              placeholder="Any special request.........."
              className={`${inputCls('message')} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 text-base font-bold tracking-wide disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : 'Book Appointment'}
          </button>

        </form>
      </div>
    </section>
  );
}