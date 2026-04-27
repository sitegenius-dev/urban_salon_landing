import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { Trash2, Eye, EyeOff, Star } from 'lucide-react';

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={12}
          className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/admin/all');
      setReviews(res.data.reviews || []);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleVisibility = async (id) => {
    try {
      await api.put(`/reviews/admin/${id}/toggle`);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isVisible: r.isVisible ? 0 : 1 } : r));
      toast.success('Visibility updated');
    } catch { toast.error('Failed to update'); }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/admin/${id}`);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <h1 className="text-xl font-black text-gray-900 mb-6">Reviews</h1>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id}
                className={`bg-white rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start gap-3 ${
                  r.isVisible ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {r.name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                    <span className="text-gray-400 text-xs">{r.phone}</span>
                    <StarDisplay rating={r.rating} />
                    {!r.isVisible && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Hidden</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{r.review}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleVisibility(r.id)}
                    className={`p-2 rounded-lg border text-sm transition-all ${
                      r.isVisible
                        ? 'border-green-200 text-green-600 hover:bg-green-50'
                        : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                    title={r.isVisible ? 'Hide review' : 'Show review'}
                  >
                    {r.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                    title="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}