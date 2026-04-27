import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Save, Eye } from 'lucide-react';

export default function DevContact() {
  const [form, setForm] = useState({
    heading: '', phone: '', whatsapp: '', address: '',
    email: '', workingHours: '', owner: '', mapEmbed: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get('/site-content/contact')
      .then(r => setForm({
        heading:      r.data.heading      || '',
        phone:        r.data.phone        || '',
        whatsapp:     r.data.whatsapp     || '',
        address:      r.data.address      || '',
        email:        r.data.email        || '',
        workingHours: r.data.workingHours || '',
        owner:        r.data.owner        || '',
        mapEmbed:     r.data.mapEmbed     || '',
      }))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/site-content/contact', form);
      toast.success('Contact section updated!');
    } catch { toast.error('Save failed'); }
    finally   { setSaving(false); }
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
    className: 'form-input',
  });

  if (loading) return (
    <AdminLayout panel="developer">
      <div className="flex justify-center py-20"><div className="spinner" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout panel="developer">
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-xl">Contact Section</h1>
            <p className="text-gray-500 text-sm">Update contact info shown on your website.</p>
          </div>
          <a href="/#contact" target="_blank"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg">
            <Eye size={13} /> Preview
          </a>
        </div>

        <form onSubmit={handleSave}
          className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">

          <div>
            <label className="form-label">Section Heading</label>
            <input {...f('heading')} placeholder="Get In Touch" />
          </div>

          <div>
            <label className="form-label">Owner / Salon Name</label>
            <input {...f('owner')} placeholder="Balam Kumar" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone Number</label>
              <input {...f('phone')} placeholder="+91 98765 43210" />
              <p className="text-gray-600 text-xs mt-1">Displayed on site and used for call link.</p>
            </div>
            <div>
              <label className="form-label">WhatsApp Number</label>
              <input {...f('whatsapp')} placeholder="+91 98765 43210" />
              <p className="text-gray-600 text-xs mt-1">Used for WhatsApp chat link. Leave empty to use phone number.</p>
            </div>
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <input type="email" {...f('email')} placeholder="salon@rootandrise.in" />
          </div>

          <div>
            <label className="form-label">Address / Location</label>
            <input {...f('address')} placeholder="Koregaon Park, Pune, Maharashtra" />
          </div>

          <div>
            <label className="form-label">Working Hours</label>
            <input {...f('workingHours')} placeholder="9am – 9pm, Mon – Sun" />
          </div>

          <div>
            <label className="form-label">Google Maps Embed URL (optional)</label>
            <textarea {...f('mapEmbed')} rows={3}
              className="form-input resize-none text-xs"
              placeholder="https://www.google.com/maps/embed?pb=..." />
            <p className="text-gray-600 text-xs mt-1">
              Go to Google Maps → Share → Embed a map → Copy the src URL only.
            </p>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white disabled:opacity-60"
            style={{ background: '#ff8800' }}>
            {saving
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Save size={16} /> Save Changes</>
            }
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
