import { useState } from 'react';
import { Clock, ChevronRight, ShoppingBag, Trash2, X, CheckCircle, Star } from 'lucide-react';

const BASE = import.meta.env.VITE_BASE_URL || '';

// ── Image with gradient fallback ──────────────────────────────────────
function ServiceThumb({ src, name, className = '' }) {
  const [err, setErr] = useState(false);
  const hue = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const fullSrc = src ? (src.startsWith('http') ? src : `${BASE}${src}`) : null;
  if (fullSrc && !err) {
    return <img src={fullSrc} alt={name} onError={() => setErr(true)}
      className={`w-full h-full object-cover ${className}`} />;
  }
  return (
    <div className={`w-full h-full flex items-center justify-center text-white font-bold text-xl ${className}`}
      style={{ background: `linear-gradient(135deg,hsl(${hue},55%,58%),hsl(${hue+45},60%,38%))` }}>
      {(name || '?').slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Detail Popup ──────────────────────────────────────────────────────
function ServiceDetailPopup({ svc, isSelected, onAdd, onRemove, onClose }) {
  if (!svc) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <div className="relative w-full h-56 bg-gray-100 flex-shrink-0">
          <ServiceThumb src={svc.imageUrl} name={svc.name} />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            <X size={16} className="text-gray-700" />
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 224px)' }}>
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-lg font-bold text-gray-900">{svc.name}</h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {svc.price > 0 && <span className="text-xl font-black text-gray-900">₹{parseFloat(svc.price).toFixed(0)}</span>}
              {svc.originalPrice && svc.originalPrice > svc.price && (
                <span className="text-sm text-gray-400 line-through">₹{parseFloat(svc.originalPrice).toFixed(0)}</span>
              )}
              {svc.duration && (
                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Clock size={11} /> {svc.duration} min
                </span>
              )}
            </div>
            {svc.rating && (
              <div className="flex items-center gap-1 mt-1.5">
                <Star size={13} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold">{svc.rating}</span>
                {svc.reviewCount && <span className="text-xs text-gray-400">({svc.reviewCount} reviews)</span>}
              </div>
            )}
          </div>
          {svc.description && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{svc.description}</p>
            </div>
          )}
          {svc.category && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2">
              <span className="text-xs text-gray-400">Category</span>
              <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">{svc.category}</span>
            </div>
          )}
          <div className="px-5 py-3 border-t border-gray-100">
            {['Professional & verified staff', 'Service at your convenience', '100% satisfaction guarantee'].map(h => (
              <div key={h} className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-600">{h}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          {!isSelected ? (
            <button onClick={() => { onAdd(String(svc.id)); onClose(); }}
              className="w-full bg-violet-600 text-white py-4 rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors">
              Add to Cart
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => { onRemove(String(svc.id)); onClose(); }}
                className="flex-1 border-2 border-red-200 text-red-500 py-4 rounded-xl text-sm font-bold hover:bg-red-50">Remove</button>
              <button onClick={onClose} className="flex-1 bg-violet-600 text-white py-4 rounded-xl text-sm font-bold">✓ Added</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Right Cart Panel (UC style) ───────────────────────────────────────
function CartPanel({ services, selectedIds, onRemove, onProceedToBook }) {
  const items = selectedIds.map(id => services.find(s => String(s.id) === String(id))).filter(Boolean);
  const total = items.reduce((s, svc) => s + parseFloat(svc.price || 0), 0);

  return (
    <div className="hidden lg:flex flex-col gap-3 w-[300px] flex-shrink-0 sticky top-[80px]">
      {/* Coupon */}
      <div className="flex items-start gap-2 border border-gray-200 rounded-xl p-3 bg-white">
        <span className="text-green-500 text-base">🏷️</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">Get ₹50 coupon</p>
          <p className="text-xs text-gray-400">After first service delivery</p>
        </div>
      </div>

      {/* Cart */}
      {items.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {items.map(svc => (
              <div key={svc.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <ServiceThumb src={svc.imageUrl} name={svc.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{svc.name}</p>
                  <p className="text-xs text-gray-400">₹{parseFloat(svc.price || 0).toFixed(0)}</p>
                </div>
                <button onClick={() => onRemove(String(svc.id))} className="text-gray-300 hover:text-red-400 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {/* UC-style bottom bar with price + View Cart */}
          <button onClick={onProceedToBook}
            className="w-full bg-violet-600 text-white py-4 flex items-center justify-between px-5 hover:bg-violet-700 transition-colors">
            <span className="text-base font-bold">₹{total.toFixed(0)}</span>
            <span className="text-sm font-bold">View Cart</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl bg-white">
          <ShoppingBag size={22} className="text-gray-200 mb-1" />
          <p className="text-xs text-gray-400">No services added</p>
        </div>
      )}
    </div>
  );
}

// ── Left Sidebar — UC style with category images ───────────────────────
// UC madhe actual service photos astat category icons sathi
// Aaplyakade category image naste, so gradient thumbnail vaparato
function CategorySidebar({ categories, categoryImages = {}, active, onSelect }) {
  const allCats = ['All', ...categories];

  return (
    <div className="hidden lg:block w-[200px] flex-shrink-0 sticky top-[80px]">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">Select a service</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {allCats.map((cat) => {
            const isActive = active === cat;
            const imgSrc = categoryImages[cat];
            const hue = [...cat].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
            return (
              <button key={cat} onClick={() => onSelect(cat)}
                className={`flex flex-col items-center gap-1.5 group`}>
                {/* Category image/thumbnail */}
                <div className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                  isActive ? 'ring-2 ring-violet-500' : 'ring-1 ring-gray-100 group-hover:ring-gray-300'
                }`}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={cat} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: `linear-gradient(135deg,hsl(${hue},50%,60%),hsl(${hue+40},55%,40%))` }}>
                      {cat.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className={`text-[11px] font-medium text-center leading-tight line-clamp-2 ${
                  isActive ? 'text-violet-700' : 'text-gray-600'
                }`}>
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Desktop Service Card — UC exact style ─────────────────────────────
// Banner image full width on top, then title + rating + price + Add row below
function DesktopServiceCard({ svc, isSelected, onAdd, onRemove, onOpenDetail }) {
  const discount = svc.originalPrice && parseFloat(svc.originalPrice) > parseFloat(svc.price)
    ? Math.round(((svc.originalPrice - svc.price) / svc.originalPrice) * 100)
    : null;

  return (
    <div className="py-6 border-b border-gray-100 last:border-0">

      {/* ── Full-width banner image (UC style) ── */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 cursor-pointer mb-4"
        style={{ paddingBottom: '42%' }} onClick={onOpenDetail}>
        <div className="absolute inset-0">
          <ServiceThumb src={svc.imageUrl} name={svc.name} />
        </div>
        {discount && (
          <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* ── Content row: info left, Add button right ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 leading-snug cursor-pointer hover:underline"
            onClick={onOpenDetail}>
            {svc.name}
          </h3>

          {/* Rating */}
          {svc.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">{svc.rating}</span>
              {svc.reviewCount && (
                <span className="text-sm text-violet-600 underline cursor-pointer">({svc.reviewCount} reviews)</span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center gap-2 mt-1">
            {svc.price > 0 && (
              <span className="text-base font-bold text-gray-900">
                {svc.originalPrice && parseFloat(svc.originalPrice) > parseFloat(svc.price) ? 'Starts at ' : ''}
                ₹{parseFloat(svc.price).toFixed(0)}
              </span>
            )}
            {svc.originalPrice && parseFloat(svc.originalPrice) > parseFloat(svc.price) && (
              <span className="text-sm text-gray-400 line-through">₹{parseFloat(svc.originalPrice).toFixed(0)}</span>
            )}
            {svc.duration && (
              <span className="text-sm text-gray-400">• {svc.duration} mins</span>
            )}
          </div>

          {/* Description bullets */}
          {svc.description && (
            <div className="mt-2">
              {svc.description.split('\n').filter(Boolean).slice(0, 2).map((line, i) => (
                <p key={i} className="text-sm text-gray-500 flex items-start gap-2 leading-relaxed">
                  <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                  <span>{line}</span>
                </p>
              ))}
            </div>
          )}

          <button className="text-sm text-violet-600 mt-2 block hover:underline" onClick={onOpenDetail}>
            View details
          </button>
        </div>

        {/* Add / counter — right side, top aligned */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
          {!isSelected ? (
            <button onClick={() => onAdd(String(svc.id))}
              className="px-8 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 hover:border-violet-500 hover:text-violet-600 transition-all whitespace-nowrap bg-white shadow-sm">
              Add
            </button>
          ) : (
            <div className="flex items-center border border-violet-500 rounded-lg overflow-hidden bg-white">
              <button onClick={() => onRemove(String(svc.id))}
                className="w-9 h-9 flex items-center justify-center text-violet-600 text-lg font-bold hover:bg-violet-50">−</button>
              <span className="w-8 text-center text-sm font-bold text-violet-700 border-x border-violet-300">1</span>
              <button disabled
                className="w-9 h-9 flex items-center justify-center text-gray-300 text-lg font-bold cursor-not-allowed">+</button>
            </div>
          )}
          {svc.optionCount && (
            <span className="text-xs text-gray-400">{svc.optionCount} options</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mobile Service Card — UC mobile style ─────────────────────────────
// Full width card: banner image top, content below, Add button inline right
function MobileServiceCard({ svc, isSelected, onAdd, onRemove, onOpenDetail }) {
  const discount = svc.originalPrice && parseFloat(svc.originalPrice) > parseFloat(svc.price)
    ? Math.round(((svc.originalPrice - svc.price) / svc.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white border-b border-gray-100 last:border-0 py-5">
      {/* Banner image */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 cursor-pointer mb-3"
        style={{ paddingBottom: '50%' }} onClick={onOpenDetail}>
        <div className="absolute inset-0">
          <ServiceThumb src={svc.imageUrl} name={svc.name} />
        </div>
        {discount && (
          <div className="absolute top-2 left-2 bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-snug" onClick={onOpenDetail}>{svc.name}</h3>

          {svc.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-semibold text-gray-700">{svc.rating}</span>
              {svc.reviewCount && <span className="text-xs text-violet-600">({svc.reviewCount} reviews)</span>}
            </div>
          )}

          <div className="flex items-center gap-2 mt-1">
            {svc.price > 0 && (
              <span className="text-sm font-bold text-gray-900">₹{parseFloat(svc.price).toFixed(0)}</span>
            )}
            {svc.originalPrice && parseFloat(svc.originalPrice) > parseFloat(svc.price) && (
              <span className="text-xs text-gray-400 line-through">₹{parseFloat(svc.originalPrice).toFixed(0)}</span>
            )}
            {svc.duration && <span className="text-xs text-gray-400">• {svc.duration} mins</span>}
          </div>

          {svc.description && (
            <div className="mt-1.5">
              {svc.description.split('\n').filter(Boolean).slice(0, 2).map((line, i) => (
                <p key={i} className="text-xs text-gray-500 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-gray-400 flex-shrink-0">•</span>
                  <span>{line}</span>
                </p>
              ))}
            </div>
          )}

          <button className="text-xs text-violet-600 mt-1.5 block hover:underline" onClick={onOpenDetail}>
            View details
          </button>
        </div>

        {/* Add button */}
        <div className="flex-shrink-0 pt-1">
          {!isSelected ? (
            <button onClick={() => onAdd(String(svc.id))}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 hover:border-violet-500 hover:text-violet-600 transition-all bg-white shadow-sm whitespace-nowrap">
              Add
            </button>
          ) : (
            <div className="flex items-center border border-violet-500 rounded-lg overflow-hidden bg-white">
              <button onClick={() => onRemove(String(svc.id))}
                className="w-8 h-8 flex items-center justify-center text-violet-600 text-base font-bold hover:bg-violet-50">−</button>
              <span className="w-7 text-center text-sm font-bold text-violet-700 border-x border-violet-300">1</span>
              <button disabled className="w-8 h-8 flex items-center justify-center text-gray-300 text-base font-bold cursor-not-allowed">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Main export
// ══════════════════════════════════════════════════════════════════════
export default function ServicesSection({
  services = [],
  selectedIds = [],
  onAdd,
  onRemove,
  onProceedToBook,
  categoryImages = {}, // optional: { 'Back Massage': '/img/back.jpg', ... }
}) {
  const categories = [...new Set(services.map(s => s.category || 'Other'))].sort();
  const [active, setActive] = useState('All');
  const [detailSvc, setDetailSvc] = useState(null);

  const tabs = ['All', ...categories];
  const filtered = active === 'All' ? services : services.filter(s => (s.category || 'Other') === active);

  const totalCount = selectedIds.length;
  const totalPrice = selectedIds.reduce((sum, id) => {
    const svc = services.find(s => String(s.id) === String(id));
    return sum + (svc ? parseFloat(svc.price || 0) : 0);
  }, 0);

  return (
    <section id="services" className="bg-white min-h-screen"
      style={{ paddingBottom: totalCount > 0 ? '88px' : '40px' }}>

      {/* ── Mobile: horizontal scrollable category tabs ── */}
      <div className="lg:hidden sticky top-[56px] z-20 bg-white border-b border-gray-100">
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden px-4">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActive(tab)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                active === tab ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-column layout ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 flex gap-6 items-start">

        {/* LEFT: Category sidebar (desktop only) */}
        <CategorySidebar
          categories={categories}
          categoryImages={categoryImages}
          active={active}
          onSelect={setActive}
        />

        {/* CENTER: Service list */}
        <div className="flex-1 min-w-0">
          {/* Category heading */}
          {active !== 'All' && (
            <h2 className="text-xl font-bold text-gray-900 mb-2">{active}</h2>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm">No services in this category</p>
            </div>
          )}

          {/* Desktop: UC list style */}
          <div className="hidden lg:block divide-y divide-gray-100">
            {filtered.map(svc => (
              <DesktopServiceCard key={svc.id} svc={svc}
                isSelected={selectedIds.includes(String(svc.id))}
                onAdd={onAdd} onRemove={onRemove}
                onOpenDetail={() => setDetailSvc(svc)} />
            ))}
          </div>

          {/* Mobile: same list style (UC mobile) */}
          <div className="lg:hidden divide-y divide-gray-100">
            {filtered.map(svc => (
              <MobileServiceCard key={svc.id} svc={svc}
                isSelected={selectedIds.includes(String(svc.id))}
                onAdd={onAdd} onRemove={onRemove}
                onOpenDetail={() => setDetailSvc(svc)} />
            ))}
          </div>
        </div>

        {/* RIGHT: Cart panel (desktop only) */}
        <CartPanel
          services={services}
          selectedIds={selectedIds}
          onRemove={onRemove}
          onProceedToBook={onProceedToBook}
        />
      </div>

      {/* ── Mobile floating cart bar ── */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          <button onClick={onProceedToBook}
            className="w-full bg-violet-600 text-white py-4 flex items-center justify-between px-5 shadow-2xl">
            <span className="text-sm font-bold">₹{totalPrice.toFixed(0)}</span>
            <span className="text-sm font-bold">View Cart ({totalCount})</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Detail popup */}
      {detailSvc && (
        <ServiceDetailPopup svc={detailSvc}
          isSelected={selectedIds.includes(String(detailSvc.id))}
          onAdd={onAdd} onRemove={onRemove}
          onClose={() => setDetailSvc(null)} />
      )}
    </section>
  );
}