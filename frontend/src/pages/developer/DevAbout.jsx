import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, Eye } from 'lucide-react';

const ICON_OPTIONS = ['star','users','award','zap','shield','heart','check','clock'];

export default function DevAbout() {
  const [form,    setForm]    = useState({
    heading: '', description: '', imageUrl: '', highlights: []
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get('/site-content/about')
      .then(r => setForm({
        heading:     r.data.heading     || '',
        description: r.data.description || '',
        imageUrl:    r.data.imageUrl    || '',
        highlights:  Array.isArray(r.data.highlights) ? r.data.highlights : [],
      }))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const addHighlight = () =>
    setForm(p => ({ ...p, highlights: [...p.highlights, { icon: 'star', text: '' }] }));

  const updateHighlight = (i, field, val) =>
    setForm(p => {
      const hl = [...p.highlights];
      hl[i] = { ...hl[i], [field]: val };
      return { ...p, highlights: hl };
    });

  const removeHighlight = (i) =>
    setForm(p => ({ ...p, highlights: p.highlights.filter((_, idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/site-content/about', form);
      toast.success('About section updated!');
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
            <h1 className="text-white font-black text-xl">About Section</h1>
            <p className="text-gray-500 text-sm">Manage the about/story section of your website.</p>
          </div>
          <a href="/#about" target="_blank"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg">
            <Eye size={13} /> Preview
          </a>
        </div>

        <form onSubmit={handleSave}
          className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">

          <div>
            <label className="form-label">Section Heading</label>
            <input value={form.heading} onChange={e => setForm(p => ({...p, heading: e.target.value}))}
              className="form-input" placeholder="About Us" />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea value={form.description}
              onChange={e => setForm(p => ({...p, description: e.target.value}))}
              className="form-input resize-none" rows={5}
              placeholder="Describe your salon, its story, values..." />
          </div>

          <div>
            <label className="form-label">Image URL (optional)</label>
            <input value={form.imageUrl} onChange={e => setForm(p => ({...p, imageUrl: e.target.value}))}
              className="form-input" placeholder="https://example.com/about.jpg" />
          </div>

          {form.imageUrl && (
            <img src={form.imageUrl} alt="About" className="w-full h-40 object-cover rounded-xl border border-white/10"
              onError={e => e.target.style.display='none'} />
          )}

          {/* Highlights */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="form-label mb-0">Highlights / Features</label>
              <button type="button" onClick={addHighlight}
                className="flex items-center gap-1 text-xs text-[#4f8ef7] hover:underline">
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={h.icon} onChange={e => updateHighlight(i, 'icon', e.target.value)}
                    className="form-input w-28 text-xs py-2">
                    {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <input value={h.text} onChange={e => updateHighlight(i, 'text', e.target.value)}
                    className="form-input flex-1 text-sm" placeholder="5+ Years Experience" />
                  <button type="button" onClick={() => removeHighlight(i)}
                    className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/30 rounded flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {form.highlights.length === 0 && (
                <p className="text-gray-600 text-xs">No highlights. Click "+ Add" to add feature points.</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white disabled:opacity-60"
            style={{ background: '#00cc88' }}>
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
