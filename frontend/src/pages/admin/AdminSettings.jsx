import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Save, Settings, Upload, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SETTING_FIELDS = [
  {
    section: 'Business Info',
    fields: [
      { key: 'service_name', label: ' Service Name', placeholder: 'Sitegenius', type: 'text' },
      { key: 'owner_name', label: 'Owner Name', placeholder: 'Balam Kumar', type: 'text' },
    ],
  },
  {
    section: 'Contact Info',
    fields: [
      { key: 'contact_phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'text' },
      { key: 'contact_whatsapp', label: 'WhatsApp Number', placeholder: '+91 98765 43210', type: 'text' },
      { key: 'contact_address', label: 'Address', placeholder: 'Koregaon Park, Pune', type: 'text' },
    ],
  },
  {
    section: 'Working Hours',
    fields: [
      { key: 'salon_opening_time', label: 'Opening Time', placeholder: '09:00', type: 'time' },
      { key: 'salon_closing_time', label: 'Closing Time', placeholder: '21:00', type: 'time' },
    ],
  },
  {
    section: 'footer / Branding',
    fields: [
      { key: 'hero_tagline', label: 'Hero Tagline', placeholder: 'Professional Grooming & Beauty Service', type: 'text' },
      // { key: 'hero_image', label: 'Hero Background Image URL', placeholder: 'https://...', type: 'text' },
    ],
  },
  {
    section: 'fotter',
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

// export default function AdminSettings() {
export default function AdminSettings() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [qrUploading, setQrUploading] = useState(false);
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [aboutFile, setAboutFile] = useState(null);
  const [aboutPreview, setAboutPreview] = useState(null);
  // const [aboutUploading, setAboutUploading] = useState(false);
  const [aboutUploading, setAboutUploading] = useState(false);
  const [aboutHeading, setAboutHeading] = useState('');
  const [aboutDesc, setAboutDesc] = useState('');
  const [aboutSaving, setAboutSaving] = useState(false);
  const fileInputRef = useRef();
  const heroFileInputRef = useRef();
  const aboutFileInputRef = useRef();

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        const data = res.data || {};
        setSettings(data);
        // if (data.payment_qr_image) {
        //   // setQrPreview(`${import.meta.env.VITE_API_URL}${data.payment_qr_image}`);
        //   setQrPreview(`${import.meta.env.VITE_BASE_URL}${data.payment_qr_image}`);
        // }
        if (data.payment_qr_image) {
          setQrPreview(`${import.meta.env.VITE_BASE_URL}${data.payment_qr_image}`);
        }
        if (data.hero_image) {
          setHeroPreview(`${import.meta.env.VITE_BASE_URL}${data.hero_image}`);
        }
        if (data.about_image) {
          setAboutPreview(`${import.meta.env.VITE_BASE_URL}${data.about_image}`);
        }
        // about heading + description load
        api.get('/site-content/about').then(r => {
          const a = r.data?.content || r.data || {};
          setAboutHeading(a.heading || '');
          setAboutDesc(a.description || '');
        }).catch(() => { });
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


  // ── Hero file select ───────────────────────────────────────────────────────
  const handleHeroFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const handleAboutContentSave = async () => {
    setAboutSaving(true);
    try {
      await api.put('/site-content/about', { heading: aboutHeading, description: aboutDesc });
      toast.success('About Us content saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setAboutSaving(false);
    }
  };

  const handleAboutFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAboutFile(file);
    setAboutPreview(URL.createObjectURL(file));
  };

  const handleAboutUpload = async () => {
    if (!aboutFile) { toast.error('Please select an image first'); return; }
    setAboutUploading(true);
    try {
      const formData = new FormData();
      formData.append('aboutImage', aboutFile);
      const res = await api.post('/settings/upload-about-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAboutPreview(`${import.meta.env.VITE_BASE_URL}${res.data.url}`);
      setAboutFile(null);
      toast.success('About Us image updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setAboutUploading(false);
    }
  };
  const handleHeroUpload = async () => {
    if (!heroFile) { toast.error('Please select an image first'); return; }
    setHeroUploading(true);
    try {
      const formData = new FormData();
      formData.append('heroImage', heroFile);
      const res = await api.post('/settings/upload-hero', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHeroPreview(`${import.meta.env.VITE_BASE_URL}${res.data.url}`);
      setHeroFile(null);
      toast.success('Hero image updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setHeroUploading(false);
    }
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

        <>
          {/* ── Payment QR Upload ─────────────────────────────────────────────── */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
            <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <QrCode size={14} /> Payment QR Code
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Upload the UPI QR code that customers will scan to pay the advance amount.
            </p>
            <div className="flex items-start gap-5">
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

          {isSuperAdmin && (
            <>
              {/* ── About Us Content ──────────────────────────────────────────────── */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Settings size={14} /> About Us Content
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Edit the heading and description shown in the About Us section.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Heading</label>
                    <input
                      type="text"
                      value={aboutHeading}
                      onChange={e => setAboutHeading(e.target.value)}
                      placeholder="About Us"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      value={aboutDesc}
                      onChange={e => setAboutDesc(e.target.value)}
                      placeholder="Tell your story..."
                      rows={4}
                      className="form-input resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAboutContentSave}
                    disabled={aboutSaving}
                    className="w-full bg-gold text-black rounded-xl py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {aboutSaving
                      ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      : <Save size={14} />}
                    {aboutSaving ? 'Saving...' : 'Save About Content'}
                  </button>
                </div>
              </div>
              {/* ── About Us Image Upload ─────────────────────────────────────────── */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Upload size={14} /> About Us Image
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Upload the image shown in the About Us section on the landing page.
                </p>
                <div className="flex items-start gap-5">
                  <div
                    className="w-40 h-40 border border-white/10 rounded-xl flex items-center justify-center bg-[#0a0a0a] overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => aboutFileInputRef.current?.click()}
                  >
                    {aboutPreview ? (
                      <img src={aboutPreview} alt="About Us" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-600">
                        <Upload size={28} className="mx-auto mb-1" />
                        <p className="text-xs">No image set</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      ref={aboutFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAboutFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => aboutFileInputRef.current?.click()}
                      className="w-full border border-white/10 rounded-xl py-2.5 px-4 text-sm text-gray-300 hover:border-gold/50 hover:text-gold transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      {aboutFile ? aboutFile.name : 'Select About Image'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAboutUpload}
                      disabled={!aboutFile || aboutUploading}
                      className="w-full bg-gold text-black rounded-xl py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      {aboutUploading
                        ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        : <Upload size={14} />}
                      {aboutUploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <p className="text-gray-600 text-xs">
                      Supported: JPG, PNG, WebP. Recommended: portrait or square ratio.
                    </p>
                  </div>
                </div>
              </div>
              {/* ── Hero Image Upload ─────────────────────────────────────────────── */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                <h3 className="text-gold text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Upload size={14} /> Hero Banner Image
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Upload the main banner image shown on the landing page hero section.
                </p>
                <div className="flex items-start gap-5">
                  <div
                    className="w-48 h-28 border border-white/10 rounded-xl flex items-center justify-center bg-[#0a0a0a] overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => heroFileInputRef.current?.click()}
                  >
                    {heroPreview ? (
                      <img src={heroPreview} alt="Hero Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-600">
                        <Upload size={28} className="mx-auto mb-1" />
                        <p className="text-xs">No image set</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      ref={heroFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleHeroFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => heroFileInputRef.current?.click()}
                      className="w-full border border-white/10 rounded-xl py-2.5 px-4 text-sm text-gray-300 hover:border-gold/50 hover:text-gold transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      {heroFile ? heroFile.name : 'Select Banner Image'}
                    </button>
                    <button
                      type="button"
                      onClick={handleHeroUpload}
                      disabled={!heroFile || heroUploading}
                      className="w-full bg-gold text-black rounded-xl py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      {heroUploading
                        ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        : <Upload size={14} />}
                      {heroUploading ? 'Uploading...' : 'Upload Banner'}
                    </button>
                    <p className="text-gray-600 text-xs">
                      Supported: JPG, PNG, WebP. Recommended: landscape ratio (e.g. 1200×530)
                    </p>
                  </div>
                </div>
              </div>

            </>
          )}
        </>
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


      </div>
    </AdminLayout>
  );
}