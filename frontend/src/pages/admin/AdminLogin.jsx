import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function AdminLogin() {
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
      if (admin.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        return;
      }
      login(token, admin);
      toast.success(`Welcome, ${admin.name}!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-black text-2xl">R</span>
          </div>
          <h1 className="text-white font-black text-2xl">Root & Rise</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-gold font-bold text-center text-sm uppercase tracking-widest mb-2">
            Admin Login
          </h2>

          <div>
            <label className="form-label">Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="admin@rootandrise.in"
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
            className="btn-gold w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60">
            {loading
              ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <><LogIn size={16} /> Login</>
            }
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <Link to="/developer/login" className="text-xs text-gray-600 hover:text-gold transition-colors block">
            Developer Login →
          </Link>
          <Link to="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors block">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
