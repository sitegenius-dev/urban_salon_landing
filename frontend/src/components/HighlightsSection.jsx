 import { useEffect, useRef, useState } from "react";

const data = [
  { id: "n1", end: 5,    suffix: "+", label: "Years\nExperience",      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M17 11l2 2 4-4"/></svg> },
  { id: "n2", end: 2000, suffix: "+", label: "Happy\nClients",         icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: "n3", end: 100,  suffix: "%", label: "Premium\nProducts",      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  { id: "n4", end: 50,   suffix: "+", label: "Expert\nStylists",       icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg> },
  { id: "n5", end: 99,   suffix: "%", label: "Clean &\nHygienic",      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
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

function CounterItem({ end, suffix, label, icon, started, isLast }) {
  const count = useCountUp(end, 2000, started);
  const lines = label.split("\n");
  return (
    <div style={{
      textAlign: "center",
      padding: "28px 10px",
      borderRight: isLast ? "none" : "1px solid rgba(255,255,255,0.1)",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    }}>
      <div style={{
        width: "44px", height: "44px", margin: "0 auto 14px",
        borderRadius: "50%", background: "rgba(200,168,75,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <span style={{ fontSize: "40px", fontWeight: "800", color: "#fff", fontFamily: "Georgia,serif", letterSpacing: "-1px", lineHeight: 1 }}>
          {count}
        </span>
        <span style={{ fontSize: "22px", fontWeight: "800", color: "#c8a84b" }}>
          {suffix}
        </span>
      </div>
      <div style={{ width: "28px", height: "3px", background: "#c8a84b", margin: "10px auto 8px", borderRadius: "2px" }} />
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
    <section ref={ref} style={{ background: "#111", padding: "60px 32px", fontFamily: "sans-serif" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        maxWidth: "1100px",
        margin: "0 auto",
      }}>
        {data.map((item, i) => (
          <CounterItem key={item.id} {...item} started={started} isLast={i === data.length - 1} />
        ))}
      </div>
    </section>
  );
}