 import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Save, Settings, Upload, QrCode } from 'lucide-react';

const SETTING_FIELDS = [
  {
    section: 'Business Info',
    fields: [
      { key: 'service_name', label: 'Salon / Service Name', placeholder: 'Root & Rise', type: 'text' },
      { key: 'owner_name',   label: 'Owner Name',           placeholder: 'Balam Kumar',  type: 'text' },
    ],
  },
  {
    section: 'Contact Info',
    fields: [
      { key: 'contact_phone',    label: 'Phone Number',    placeholder: '+91 98765 43210',      type: 'text' },
      { key: 'contact_whatsapp', label: 'WhatsApp Number', placeholder: '+91 98765 43210',      type: 'text' },
      { key: 'contact_address',  label: 'Address',         placeholder: 'Koregaon Park, Pune', type: 'text' },
    ],
  },
  {
    section: 'Hero / Branding',
    fields: [
      { key: 'hero_tagline', label: 'Hero Tagline',              placeholder: 'Professional Grooming & Beauty Service', type: 'text' },
      { key: 'hero_image',   label: 'Hero Background Image URL', placeholder: 'https://...',                            type: 'text' },
    ],
  },
  {
    section: 'About',
    fields: [
      { key: 'about_description', label: 'About Description', placeholder: 'Tell your salon story...', type: 'textarea' },
    ],
  },
  {
    section: 'Payment Settings',
    fields: [
      {
        key: 'partial_payment_percent',
        label: 'Advance Payment %',
        placeholder: '0',
        type: 'number',
        help: 'Percentage of service price required as advance. Set 0 to disable advance payment.',
      },
    ],
  },
];

export default function AdminSettings() {
  const [settings,    setSettings]    = useState({});
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [qrFile,      setQrFile]      = useState(null);
  const [qrPreview,   setQrPreview]   = useState(null);
  const [qrUploading, setQrUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        const data = res.data || {};
        setSettings(data);
        if (data.payment_qr_image) {
          // setQrPreview(`${import.meta.env.VITE_API_URL}${data.payment_qr_image}`);
          setQrPreview(`${import.meta.env.VITE_BASE_URL}${data.payment_qr_image}`);
        }
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/settings/bulk', settings);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // ── QR file select ──────────────────────────────────────────────────────────
  const handleQrFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  // ── QR upload ───────────────────────────────────────────────────────────────
  const handleQrUpload = async () => {
    if (!qrFile) { toast.error('Please select a QR image first'); return; }
    setQrUploading(true);
    try {
      const formData = new FormData();
      formData.append('qrImage', qrFile);
      const res = await api.post('/settings/upload-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // setQrPreview(`${import.meta.env.VITE_API_URL}${res.data.url}`);
      setQrPreview(`${import.meta.env.VITE_BASE_URL}${res.data.url}`);
      setQrFile(null);
      toast.success('Payment QR uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'QR upload failed');
    } finally {
      setQrUploading(false);
    }
  };

  if (loading) return (
    <AdminLayout panel="admin">
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout panel="admin">
      <div className="max-w-2xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            <Settings size={18} className="text-gold" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl">Settings</h1>
            <p className="text-gray-500 text-sm">Manage site-wide configuration.</p>
          </div>
        </div>

        {/* ── Payment QR Upload ─────────────────────────────────────────────── */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <QrCode size={14} /> Payment QR Code
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Upload the UPI QR code that customers will scan to pay the advance amount.
          </p>

          <div className="flex items-start gap-5">
            {/* QR Preview */}
            <div
              className="w-36 h-36 border border-white/10 rounded-xl flex items-center justify-center bg-[#0a0a0a] overflow-hidden flex-shrink-0 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {qrPreview ? (
                <img src={qrPreview} alt="Payment QR" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center text-gray-600">
                  <QrCode size={32} className="mx-auto mb-1" />
                  <p className="text-xs">No QR set</p>
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleQrFileChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-white/10 rounded-xl py-2.5 px-4 text-sm text-gray-300 hover:border-gold/50 hover:text-gold transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={14} />
                {qrFile ? qrFile.name : 'Select QR Image'}
              </button>

              <button
                type="button"
                onClick={handleQrUpload}
                disabled={!qrFile || qrUploading}
                className="w-full bg-gold text-black rounded-xl py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {qrUploading
                  ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : <Upload size={14} />}
                {qrUploading ? 'Uploading...' : 'Upload QR'}
              </button>

              <p className="text-gray-600 text-xs">
                Supported: JPG, PNG, WebP. Max 5MB.<br />
                Click the image or button to select a new QR.
              </p>
            </div>
          </div>
        </div>

        {/* ── Other Settings ────────────────────────────────────────────────── */}
        <form onSubmit={handleSave} className="space-y-5">
          {SETTING_FIELDS.map(({ section, fields }) => (
            <div key={section} className="bg-[#111] border border-white/10 rounded-2xl p-5">
              <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">{section}</h3>
              <div className="space-y-4">
                {fields.map(({ key, label, placeholder, type, help }) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    {type === 'textarea' ? (
                      <textarea
                        value={settings[key] || ''}
                        onChange={e => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className="form-input resize-none"
                      />
                    ) : (
                      <input
                        type={type}
                        value={settings[key] || ''}
                        onChange={e => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                        min={type === 'number' ? 0 : undefined}
                        max={type === 'number' ? 100 : undefined}
                        className="form-input"
                      />
                    )}
                    {help && <p className="text-gray-600 text-xs mt-1">{help}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="btn-gold w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving
              ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        <div className="bg-[#111] border border-yellow-900/30 rounded-xl p-4 text-sm text-yellow-600">
          <strong className="text-yellow-500">Note:</strong> Contact info and hero content can also be
          managed from the <span className="text-gold">Developer CMS</span> panel via site-content APIs.
        </div>
      </div>
    </AdminLayout>
  );
}