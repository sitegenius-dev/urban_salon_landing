import { useState } from 'react';
import { Clock } from 'lucide-react';

const SERVICE_MENU = [
  { category: 'Hair', items: ['Haircut', 'Styling', 'Coloring'] },
  { category: 'Beard', items: ['Trim', 'Shape', 'Grooming'] },
  { category: 'Skin', items: ['Facial', 'Cleanup', 'Detan'] },
  { category: 'Makeover', items: ['Party Look', 'Bridal', 'Full Styling'] },
];

export default function ServicesSection({ services = [] }) {
  const categories = [...new Set(services.map(s => s.category || 'Other'))].sort();
  const [active, setActive] = useState('All');

  const tabs = ['All', ...categories];
  const filtered = active === 'All'
    ? services
    : services.filter(s => (s.category || 'Other') === active);

  const grouped = filtered.reduce((acc, svc) => {
    const cat = svc.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  return (
    <section id="services" className="py-20 bg-white px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Figma-style dark service menu bar ── */}
        {/* <div
          style={{
            backgroundColor: '#000000',
            borderRadius: '4px',
            padding: '20px 28px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0',
            }}
          >
            {SERVICE_MENU.map((col) => (
              <div key={col.category} style={{ paddingRight: '10px' }}>
                <div
                  style={{
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '14px',
                    marginBottom: '10px',
                    letterSpacing: '0.01em',
                  }}
                >
                  {col.category}
                </div>
                {/* ✅ Figma sarkhe disc bullet list */}
        {/* <ul
                  style={{
                    listStyleType: 'disc',
                    paddingLeft: '12px',
                    margin: 0,
                  }}
                >
                  {col.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        color: '#ffffff',
                        fontSize: '10px',
                        lineHeight: '1.9',
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div> */}

        {/* ── Category filter tabs ── */}
        {services.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${active === tab
                    ? 'bg-[#0a0a0a] text-gold border-[#0a0a0a]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gold hover:text-gold'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ── Detailed service cards grouped by category ── */}
        {services.length > 0 && (
          // <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          // <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
          //   {Object.entries(grouped).map(([cat, svcs]) => (
          //     <div
          //       key={cat}
          //       className="border border-gray-100 rounded-xl p-5 hover:border-gold/40 hover:shadow-md transition-all"
          //     >
          <div className="columns-1 sm:columns-2 gap-5">
            {Object.entries(grouped).map(([cat, svcs]) => (
              <div
                key={cat}
                className="break-inside-avoid mb-5 border border-gray-100 rounded-xl p-5 hover:border-gold/40 hover:shadow-md transition-all"
              >
                <h3 className="text-base font-black text-gray-900 mb-3 pb-2 border-b border-gray-100 uppercase tracking-wide">
                  {cat}
                </h3>
                <div className="space-y-2.5">
                  {svcs.map(svc => (
                    <div key={svc.id} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-gold text-xs mt-1 flex-shrink-0">✦</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{svc.name}</div>
                          {svc.description && (
                            <div className="text-xs text-gray-400 leading-relaxed mt-0.5">{svc.description}</div>
                          )}
                          {svc.duration && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <Clock size={10} />
                              {svc.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      {svc.price > 0 && (
                        <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                          ₹{parseFloat(svc.price).toFixed(0)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}




      </div>
    </section>
  );
}