import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Save, Eye } from 'lucide-react';

export default function DevHero() {
  const [form,    setForm]    = useState({ title:'', subtitle:'', description:'', imageUrl:'' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get('/site-content/hero')
      .then(r => setForm({
        title:       r.data.title       || '',
        subtitle:    r.data.subtitle    || '',
        description: r.data.description || '',
        imageUrl:    r.data.imageUrl    || '',
      }))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/site-content/hero', form);
      toast.success('Hero section updated!');
    } catch { toast.error('Save failed'); }
    finally   { setSaving(false); }
  };

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
            <h1 className="text-white font-black text-xl">Hero Section</h1>
            <p className="text-gray-500 text-sm">Controls the main landing banner.</p>
          </div>
          <a href="/#home" target="_blank"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg">
            <Eye size={13} /> Preview
          </a>
        </div>

        <form onSubmit={handleSave}
          className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">

          <div>
            <label className="form-label">Title</label>
            <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
              className="form-input" placeholder="Root & Rise" />
            <p className="text-gray-600 text-xs mt-1">Main heading displayed on the hero banner.</p>
          </div>

          <div>
            <label className="form-label">Subtitle</label>
            <input value={form.subtitle} onChange={e => setForm(p => ({...p, subtitle: e.target.value}))}
              className="form-input" placeholder="Professional Grooming & Beauty Service" />
            <p className="text-gray-600 text-xs mt-1">Secondary text shown below the title.</p>
          </div>

          <div>
            <label className="form-label">Description / Tagline</label>
            <input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              className="form-input" placeholder="Haircuts · Beard · Skin · Makeup" />
            <p className="text-gray-600 text-xs mt-1">Short tagline. Use · to separate keywords.</p>
          </div>

          <div>
            <label className="form-label">Background Image URL</label>
            <input value={form.imageUrl} onChange={e => setForm(p => ({...p, imageUrl: e.target.value}))}
              className="form-input" placeholder="https://example.com/salon-photo.jpg" />
            <p className="text-gray-600 text-xs mt-1">Leave empty for default dark gradient background.</p>
          </div>

          {form.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-white/10">
              <img src={form.imageUrl} alt="Hero preview" className="w-full h-40 object-cover"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}

          <button type="submit" disabled={saving}
            className="btn-gold w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            {saving
              ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <><Save size={16} /> Save Changes</>
            }
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
