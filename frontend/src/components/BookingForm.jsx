 import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  CheckCircle, Copy, ChevronLeft, Clock,
  Trash2, ChevronRight, User, Phone, Mail,
  MessageSquare,
} from 'lucide-react';

const BASE = import.meta.env.VITE_BASE_URL || '';

function ServiceThumb({ src, name }) {
  const [err, setErr] = useState(false);
  const hue = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const fullSrc = src ? (src.startsWith('http') ? src : `${BASE}${src}`) : null;
  if (fullSrc && !err)
    return <img src={fullSrc} alt={name} onError={() => setErr(true)} className="w-full h-full object-cover" />;
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
      style={{ background: `linear-gradient(135deg,hsl(${hue},55%,58%),hsl(${hue + 45},60%,38%))` }}
    >
      {(name || '?').slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── STEP 1: Cart ──────────────────────────────────────────────────────
function CartStep({ services, cartIds, onRemove, onBack, onNext }) {
  const items = cartIds.map(id => services.find(s => String(s.id) === String(id))).filter(Boolean);
  const total = items.reduce((s, svc) => s + parseFloat(svc.price || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="text-[17px] font-bold text-gray-900">Your Cart</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {items.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">Your cart is empty</div>
        )}
        {items.map(svc => (
          <div key={svc.id} className="flex items-center gap-3 py-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <ServiceThumb src={svc.imageUrl} name={svc.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{svc.name}</p>
              {svc.duration && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock size={10} /> {svc.duration} min
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-bold text-gray-900">₹{parseFloat(svc.price || 0).toFixed(0)}</span>
              <button onClick={() => onRemove(String(svc.id))} className="p-1.5 text-gray-300 hover:text-red-400">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              Total ({items.length} service{items.length > 1 ? 's' : ''})
            </span>
            <span className="text-[18px] font-black text-gray-900">₹{total.toFixed(0)}</span>
          </div>
          <button
            onClick={onNext}
            className="w-full bg-black text-white py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2"
          >
            Continue to Schedule <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── STEP 2: Date + Time picker ────────────────────────────────────────
function ScheduleStep({ onBack, onNext, date, setDate, slot, setSlot, totalDuration }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const fmt = d => d.toISOString().split('T')[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const fetchSlots = async d => {
    setLoading(true);
    setSlot('');
    try {
      const res = await api.get(`/bookings/available-slots?date=${d}`);
      setSlots(res.data.slots || []);
    } catch {
      toast.error('Could not load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = d => {
    setDate(d);
    fetchSlots(d);
  };

  const durationText = totalDuration
    ? `Service will take approx. ${
        totalDuration >= 60
          ? `${Math.floor(totalDuration / 60)} hr${Math.floor(totalDuration / 60) > 1 ? 's' : ''}${
              totalDuration % 60 ? ` & ${totalDuration % 60} mins` : ''
            }`
          : `${totalDuration} mins`
      }`
    : '';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h2 className="text-[17px] font-bold text-gray-900">When should we arrive?</h2>
          {durationText && <p className="text-xs text-gray-400 mt-0.5">{durationText}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-5 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {dates.map(d => {
              const val = fmt(d);
              const isSel = date === val;
              const isToday = fmt(d) === fmt(today);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleDateSelect(val)}
                  className={`flex-shrink-0 flex flex-col items-center px-3.5 py-3 rounded-2xl border-2 transition-all min-w-[58px] ${
                    isSel
                      ? 'border-violet-600 bg-violet-50 text-violet-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span className={`text-[11px] font-semibold ${isSel ? 'text-violet-500' : 'text-gray-400'}`}>
                    {isToday ? 'Today' : dayNames[d.getDay()]}
                  </span>
                  <span className="text-[22px] font-black leading-tight">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pt-2 pb-6">
          <p className="text-[15px] font-bold text-gray-900 mb-4">Select start time of service</p>
          {!date && <p className="text-sm text-gray-400 italic">Select a date first</p>}
          {date && loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
              Loading slots…
            </div>
          )}
          {date && !loading && slots.length === 0 && (
            <p className="text-sm text-red-400 italic text-center py-8">No slots available for this date</p>
          )}
          {date && !loading && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5">
              {slots.map(({ slot: s, available }) => {
                const isFull = available === 0;
                const isSel = slot === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSlot(s)}
                    className={`py-4 px-2 rounded-xl border-2 text-center text-[13px] font-semibold transition-all ${
                      isFull
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        : isSel
                        ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-violet-400 hover:text-violet-600'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onNext}
          disabled={!date || !slot}
          className="w-full bg-black text-white py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 disabled:opacity-30"
        >
          Proceed to checkout <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ✅ ROOT FIX: Field is defined HERE — at module level, OUTSIDE DetailsStep.
//
// Original bug: Field was defined as a const INSIDE DetailsStep's function
// body. Every time DetailsStep re-rendered (on every keystroke), React saw
// a brand-new component type for Field, unmounted the old one, and mounted
// a fresh one — which instantly blurred the input and lost focus.
//
// Moving Field outside means React always sees the same component type,
// so it updates props in-place without ever unmounting the input.
// ══════════════════════════════════════════════════════════════════════
function Field({
  name, label, icon: Icon, placeholder,
  type = 'text', optional = false, textarea = false,
  form, onChange, focused, setFocused, error,
}) {
  const isFocused = focused === name;
  const hasError = !!error;
  const borderColor = hasError ? '#ef4444' : isFocused ? '#7c3aed' : '#e5e7eb';

  return (
    <div className="px-5 py-5 border-b border-gray-100">
      <label htmlFor={name} className="flex items-center gap-2 mb-3 cursor-pointer">
        <Icon
          size={14}
          className={hasError ? 'text-red-400' : isFocused ? 'text-violet-600' : 'text-gray-400'}
        />
        <span
          className={`text-[11px] font-bold uppercase tracking-widest ${
            hasError ? 'text-red-400' : isFocused ? 'text-violet-600' : 'text-gray-400'
          }`}
        >
          {label}
        </span>
        {optional && (
          <span className="text-[11px] text-gray-300 normal-case font-normal tracking-normal ml-1">
            (optional)
          </span>
        )}
      </label>

      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={form[name] || ''}
          onChange={onChange}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused('')}
          placeholder={placeholder}
          rows={3}
          autoComplete="off"
          className="w-full text-[15px] text-gray-900 bg-transparent outline-none resize-none border-0 rounded-none px-0 pb-2 placeholder:text-gray-400"
          style={{
            borderBottom: `2px solid ${borderColor}`,
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={form[name] || ''}
          onChange={onChange}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused('')}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          className="w-full text-[15px] text-gray-900 bg-transparent outline-none border-0 rounded-none px-0 pb-2 placeholder:text-gray-400"
          style={{
            borderBottom: `2px solid ${borderColor}`,
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
        />
      )}

      {hasError && (
        <p style={{ color: '#f87171', fontSize: '11px', marginTop: '6px' }}>⚠ {error}</p>
      )}
    </div>
  );
}

// ── STEP 3: Details ───────────────────────────────────────────────────
function DetailsStep({ onBack, onSubmit, loading, form, setForm }) {
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.passengerName.trim()) e.passengerName = 'Name is required';
    if (!form.passengerPhone.trim() || form.passengerPhone.replace(/\D/g, '').length < 7)
      e.passengerPhone = 'Valid phone required';
    if (form.passengerEmail && !/\S+@\S+\.\S+/.test(form.passengerEmail))
      e.passengerEmail = 'Enter valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) onSubmit(e);
  };

  const sharedProps = { form, onChange: handleChange, focused, setFocused };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button type="button" onClick={onBack} className="p-1.5 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="text-[17px] font-bold text-gray-900">Your Details</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form id="booking-details-form" onSubmit={handleSubmit} noValidate>
          <Field {...sharedProps} name="passengerName" label="Full Name"  icon={User}           placeholder="Enter your full name"    error={errors.passengerName} />
          <Field {...sharedProps} name="passengerPhone" label="Phone"     icon={Phone}          placeholder="+91 XXXXX XXXXX" type="tel" error={errors.passengerPhone} />
          <Field {...sharedProps} name="passengerEmail" label="Email"     icon={Mail}           placeholder="you@email.com" type="email" optional error={errors.passengerEmail} />
          <Field {...sharedProps} name="message"        label="Note"      icon={MessageSquare}  placeholder="Any special request…" optional textarea error={errors.message} />
        </form>
      </div>

      <div className="border-t border-gray-100">
        <button
          type="submit"
          form="booking-details-form"
          disabled={loading}
          className="w-full bg-black text-white py-5 text-[16px] font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            <>Proceed to Pay <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────
function SuccessScreen({ booking, onDone }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center overflow-y-auto">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-5">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="text-[22px] font-black text-gray-900 mb-1">Booking Confirmed!</h2>
      <p className="text-gray-400 text-sm mb-7">We'll contact you shortly to confirm your appointment.</p>

      <div className="w-full bg-gray-50 rounded-2xl p-4 mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Booking ID</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl font-black text-gray-900 font-mono">{booking.bookingId}</span>
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(booking.bookingId); toast.success('Copied!'); }}
            className="text-gray-400 hover:text-black p-1"
          >
            <Copy size={15} />
          </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 text-sm text-left mb-6">
        {[
          { label: 'Customer', value: booking.passengerName },
          { label: 'Service', value: booking.serviceName },
          {
            label: 'Date',
            value: new Date(booking.travelDate + 'T00:00:00').toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            }),
          },
          { label: 'Time Slot', value: booking.timeSlot },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-0.5">{label}</div>
            <div className="font-semibold text-gray-800 text-sm">{value}</div>
          </div>
        ))}
      </div>

      <button type="button" onClick={onDone}
        className="w-full py-4 bg-black text-white rounded-2xl text-[15px] font-bold">
        Done
      </button>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────
export default function BookingForm({
  services,
  preSelectedIds = [],
  onRemoveFromCart,
  onClose,
  isOpen,
}) {
  const [step, setStep] = useState('cart');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    message: '',
  });

  const cartItems = preSelectedIds
    .map(id => services.find(s => String(s.id) === String(id)))
    .filter(Boolean);
  const totalDuration = cartItems.reduce((s, svc) => s + (Number(svc.duration) || 0), 0);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const ids = preSelectedIds.map(String);
      const names = ids
        .map(id => services.find(s => String(s.id) === id)?.name)
        .filter(Boolean);

      const payload = {
        passengerName: form.passengerName.trim(),
        passengerPhone: form.passengerPhone.trim(),
        serviceName: names.join(', '),
        travelDate: date,
        timeSlot: slot,
        serviceIds: ids.map(Number),
        serviceId: Number(ids[0]),
      };
      if (form.passengerEmail) payload.passengerEmail = form.passengerEmail;
      if (form.message) payload.message = form.message;

      const res = await api.post('/bookings', payload);
      const preview = res.data.preview;
      const orderRes = await api.post('/bookings/create-order', {
        amount: preview.partialPaymentAmount,
        bookingData: preview,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: preview.partialPaymentAmount * 100,
        currency: 'INR',
        name: 'Your Salon Name',
        description: preview.serviceName,
        order_id: orderRes.data.orderId,
        prefill: {
          name: form.passengerName,
          contact: form.passengerPhone,
          email: form.passengerEmail || '',
        },
        theme: { color: '#7c3aed' },
        handler: async response => {
          try {
            const verifyRes = await api.post('/bookings/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: preview,
            });
            setSuccess(verifyRes.data.booking);
            setStep('success');
            toast.success('Booking confirmed!');
          } catch {
            toast.error('Payment done but verification failed. Please call us.');
          }
        },
        modal: { ondismiss: () => toast('Payment cancelled') },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setStep('cart');
    setSuccess(null);
    setDate('');
    setSlot('');
    setForm({ passengerName: '', passengerPhone: '', passengerEmail: '', message: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40"
        style={{ zIndex: 40, pointerEvents: step === 'cart' ? 'auto' : 'none' }}
        onClick={step === 'cart' ? onClose : undefined}
      />

      <div
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl flex flex-col"
        style={{ zIndex: 50, maxHeight: '92vh', height: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {step === 'cart' && (
          <CartStep
            services={services}
            cartIds={preSelectedIds}
            onRemove={onRemoveFromCart}
            onBack={onClose}
            onNext={() => setStep('schedule')}
          />
        )}

        {step === 'schedule' && (
          <ScheduleStep
            onBack={() => setStep('cart')}
            onNext={() => setStep('details')}
            date={date} setDate={setDate}
            slot={slot} setSlot={setSlot}
            totalDuration={totalDuration}
          />
        )}

        {step === 'details' && (
          <DetailsStep
            onBack={() => setStep('schedule')}
            onSubmit={handleSubmit}
            loading={loading}
            form={form}
            setForm={setForm}
          />
        )}

        {step === 'success' && success && (
          <SuccessScreen booking={success} onDone={handleDone} />
        )}
      </div>
    </>
  );
}