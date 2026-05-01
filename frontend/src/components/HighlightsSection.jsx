 import { useEffect, useRef, useState } from "react";

const data = [
  { id: "n1", end: 5,    suffix: "+", label: "Years\nExperience",  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M17 11l2 2 4-4"/></svg> },
  { id: "n2", end: 2000, suffix: "+", label: "Happy\nClients",     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: "n3", end: 100,  suffix: "%", label: "Premium\nProducts",  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  { id: "n4", end: 50,   suffix: "+", label: "Expert\nStylists",   icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
  { id: "n5", end: 99,   suffix: "%", label: "Clean &\nHygienic",  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
];

function useCountUp(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(e * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, start]);
  return count;
}

function CounterItem({ end, suffix, label, icon, started, index, total }) {
  const count = useCountUp(end, 2000, started);
  const lines = label.split("\n");

  // Border logic:
  // Mobile (2-col): right border except col 2 (even index), bottom border always except last row
  // Tablet (3-col): right border except col 3 (index%3===2), bottom border except last row
  // Desktop (5-col): right border except last item, no bottom border

  return (
    <div className={[
      "flex flex-col items-center text-center px-3 py-7",
      // mobile: 2-col grid — right border on odd columns (0,2,4), bottom on all but last 2
      "border-b border-white/10",
      // right border: hidden on every 2nd col on mobile, every 3rd on md, last on lg
      "border-r border-white/10",
      // override: remove right border on mobile col 2 (nth-child even)
      "[&:nth-child(2n)]:border-r-0",
      // override: remove right border on md col 3
      "md:[&:nth-child(3n)]:border-r-0 md:[&:nth-child(2n)]:border-r",
      // override: on lg all have right border except last
      "lg:[&:nth-child(3n)]:border-r lg:[&:last-child]:border-r-0",
      // remove bottom border on last row — mobile: last 2, md: last 3, lg: none
      "[&:nth-last-child(-n+2)]:border-b-0",
      "md:[&:nth-last-child(-n+2)]:border-b md:[&:nth-last-child(-n+3)]:border-b-0",
      "lg:border-b-0",
    ].join(" ")}>
      {/* Icon circle */}
      <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
        style={{ background: "rgba(200,168,75,0.12)" }}>
        {icon}
      </div>

      {/* Number */}
      <div className="leading-none">
        <span style={{ fontSize: "clamp(28px,5vw,40px)", fontWeight: 800, color: "#fff", fontFamily: "Georgia,serif", letterSpacing: "-1px" }}>
          {count}
        </span>
        <span style={{ fontSize: "clamp(16px,3vw,22px)", fontWeight: 800, color: "#c8a84b" }}>
          {suffix}
        </span>
      </div>

      {/* Gold line */}
      <div className="w-7 h-0.5 rounded-full my-2.5" style={{ background: "#c8a84b" }} />

      {/* Label */}
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", letterSpacing: "2.5px", textTransform: "uppercase", lineHeight: 1.4 }}>
        {lines[0]}<br />{lines[1]}
      </div>
    </div>
  );
}

export default function HighlightsSection() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ background: "#111", fontFamily: "sans-serif" }} className="py-12 sm:py-16 px-4 sm:px-8">
      <div className={[
        "grid mx-auto max-w-5xl",
        // mobile: 2 cols, tablet: 3 cols, desktop: 5 cols
        "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
      ].join(" ")}>
        {data.map((item, i) => (
          <CounterItem key={item.id} {...item} started={started} index={i} total={data.length} />
        ))}
      </div>
    </section>
  );
}