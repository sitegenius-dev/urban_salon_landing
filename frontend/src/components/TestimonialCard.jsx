 import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Star } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', rating: 5, review: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/reviews/public')
      .then(res => setReviews(res.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.review.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/reviews', form);
      setSubmitted(true);
      setShowForm(false);
      setForm({ name: '', phone: '', rating: 5, review: '' });
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <section className="py-12 sm:py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-1">What Clients Say</p>
          <h2 className="text-2xl font-black text-gray-900">Customer Reviews</h2>
        </div>

        {/* Reviews — scroll on mobile, grid on sm+ */}
        {reviews.length > 0 ? (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 mb-8 [&::-webkit-scrollbar]:hidden snap-x snap-mandatory sm:hidden">
              {reviews.map(r => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </div>

            {/* sm+: 2-col grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {reviews.map(r => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400 text-sm mb-8">
            No reviews yet. Be the first to share!
          </p>
        )}

        {/* Submit Review */}
        {submitted ? (
          <div className="text-center bg-green-50 border border-green-200 rounded-2xl py-5 px-4">
            <p className="text-green-700 font-semibold text-sm">
              ✅ Thank you! Your review has been submitted for approval.
            </p>
          </div>
        ) : showForm ? (
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 max-w-lg mx-auto">
            <h3 className="font-bold text-gray-900 mb-4 text-base">Write a Review</h3>

            <div className="space-y-4">
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your Name"
                className="w-full border-b border-gray-300 py-2 text-sm outline-none bg-transparent"
              />
              <input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="Phone Number"
                inputMode="tel"
                className="w-full border-b border-gray-300 py-2 text-sm outline-none bg-transparent"
              />

              {/* Star Rating Picker */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, rating: s }))}
                      className="touch-manipulation"
                    >
                      <Star
                        size={28}
                        className={s <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={form.review}
                onChange={e => setForm(p => ({ ...p, review: e.target.value }))}
                placeholder="Share your experience..."
                rows={3}
                className="w-full border-b border-gray-300 py-2 text-sm outline-none bg-transparent resize-none"
              />

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.name || !form.phone || !form.review}
                  className="flex-1 bg-black text-white py-3 text-sm font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 text-sm active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 border-2 border-black text-black text-sm font-bold rounded-xl hover:bg-black hover:text-white active:scale-95 transition-all"
            >
              Write a Review
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* Extracted card so it's reused in both mobile scroll & desktop grid */
function ReviewCard({ r }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex-shrink-0 w-[280px] sm:w-auto snap-start">
      <StarRating rating={r.rating} />
      <p className="text-gray-700 text-sm leading-relaxed mb-4">"{r.review}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {r.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
          <div className="text-gray-400 text-xs">
            {new Date(r.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}