import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Code2 } from 'lucide-react';

export default function DeveloperLogin() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, admin } = res.data;
      if (admin.role !== 'developer') {
        toast.error('Access denied. Developer only.');
        return;
      }
      login(token, admin);
      toast.success(`Welcome, ${admin.name}!`);
      navigate('/developer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4f8ef7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Code2 size={28} className="text-white" />
          </div>
          <h1 className="text-white font-black text-2xl">Root & Rise</h1>
          <p className="text-gray-500 text-sm mt-1">Developer CMS</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-[#4f8ef7] font-bold text-center text-sm uppercase tracking-widest mb-2">
            Developer Login
          </h2>

          <div>
            <label className="form-label">Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="developer@rootandrise.in"
              className="form-input" />
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="form-input pr-10" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            style={{ background: '#4f8ef7', color: '#fff' }}>
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Code2 size={16} /> Login</>
            }
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <Link to="/admin/login" className="text-xs text-gray-600 hover:text-gold transition-colors block">
            Admin Login →
          </Link>
          <Link to="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors block">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
