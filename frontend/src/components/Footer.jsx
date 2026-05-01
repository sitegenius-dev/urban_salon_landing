//  import { useEffect, useState } from "react";
// import api from "../api/axios";

// const DEFAULTS = {
//   service_name: "Sitegenius",
//   contact_phone: "+91 98765 43210",
//   contact_whatsapp: "919876543210",
//   contact_address: "Koregaon Park, Pune, Maharashtra 411001",
//   salon_opening_time: "09:00",
//   salon_closing_time: "21:00",
// };

// function fmt(t) {
//   if (!t) return "";
//   const parts = t.split(":");
//   const hr = parseInt(parts[0]);
//   const mn = parts[1];
//   const suffix = hr >= 12 ? "PM" : "AM";
//   const displayHr = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
//   return displayHr + ":" + mn + " " + suffix;
// }

// function ContactRow(props) {
//   return (
//     <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
//       <span style={{ fontSize: "13px" }}>{props.icon}</span>
//       <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: "1.5", whiteSpace: "pre-line" }}>{props.text}</span>
//     </div>
//   );
// }

// const HEAD = {
//   fontSize: "11px",
//   color: "#c8a84b",
//   letterSpacing: "2.5px",
//   textTransform: "uppercase",
//   fontWeight: "600",
//   marginBottom: "16px",
// };

// const LINK = {
//   display: "block",
//   fontSize: "13px",
//   color: "rgba(255,255,255,0.55)",
//   textDecoration: "none",
//   marginBottom: "10px",
// };

// const NAV = [
//   { label: "Services", href: "#services" },
//   { label: "Book Appointment", href: "#booking" },
//   { label: "Track Booking", href: "#track" },
//   { label: "About Us", href: "#about" },
//   { label: "Contact", href: "#contact" },
// ];

// export default function Footer() {
//   const [s, setS] = useState(DEFAULTS);

//   useEffect(function() {
//     api.get("/settings/public")
//       .then(function(res) {
//         setS(function(prev) {
//           return Object.assign({}, prev, res.data);
//         });
//       })
//       .catch(function() {});
//   }, []);

//   const waStyle = {
//     marginTop: "20px",
//     display: "inline-flex",
//     alignItems: "center",
//     gap: "10px",
//     background: "rgba(37,211,102,0.1)",
//     border: "1px solid rgba(37,211,102,0.25)",
//     borderRadius: "50px",
//     padding: "10px 20px",
//     textDecoration: "none",
//   };

//   const gridStyle = {
//     display: "grid",
//     gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
//     gap: "40px",
//     maxWidth: "1100px",
//     margin: "0 auto",
//   };

//   const footerStyle = {
//     background: "#0a0a0a",
//     padding: "56px 32px 24px",
//     fontFamily: "sans-serif",
//   };

//   const hrStyle = {
//     border: "none",
//     borderTop: "1px solid rgba(255,255,255,0.08)",
//     maxWidth: "1100px",
//     margin: "36px auto 20px",
//   };

//   const bottomStyle = {
//     maxWidth: "1100px",
//     margin: "0 auto",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     flexWrap: "wrap",
//     gap: "12px",
//   };

//   const copyStyle = {
//     fontSize: "11px",
//     color: "rgba(255,255,255,0.25)",
//     letterSpacing: "1px",
//   };

//   return (
//     <footer style={footerStyle}>
//       <div style={gridStyle}>

//         <div>
//           <div style={{ fontSize: "22px", fontWeight: "700", color: "#c8a84b", letterSpacing: "1px", marginBottom: "10px" }}>
//             {s.service_name}
//           </div>
//            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "18px" }}>
//             {s.hero_tagline}
//           </div>
//           <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: "1.8", maxWidth: "220px" }}>
//             {s.about_description}
//           </div>
//         </div>

//         <div>
//           <div style={HEAD}>Quick Links</div>
//           {NAV.map(function(item) {
//             return (
//               <a
//                 key={item.label}
//                 href={item.href}
//                 style={LINK}
//                 onMouseEnter={function(e) { e.currentTarget.style.color = "#c8a84b"; }}
//                 onMouseLeave={function(e) { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
//               >
//                 {item.label}
//               </a>
//             );
//           })}
//         </div>

//         <div>
//           <div style={HEAD}>Contact Us</div>
//           <ContactRow icon="📞" text={s.contact_phone} />
//           <ContactRow icon="✉️" text="hello@rootandrise.in" />
//           <ContactRow icon="📍" text={s.contact_address} />
//         </div>

//         <div>
//           <div style={HEAD}>Working Hours</div>
//           <ContactRow
//             icon="🕐"
//             text={"Mon - Sun\n" + fmt(s.salon_opening_time) + " - " + fmt(s.salon_closing_time)}
//           />
//           <a
//             href={"https://wa.me/" + s.contact_whatsapp}
//             target="_blank"
//             rel="noopener noreferrer"
//             style={waStyle}
//           >
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366">
//               <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
//             </svg>
//             <span style={{ fontSize: "13px", color: "#25d366", fontWeight: "600" }}>WhatsApp Us</span>
//           </a>
//         </div>

//       </div>

//       <hr style={hrStyle} />

//       <div style={bottomStyle}>
//         <span style={copyStyle}>2025 {s.service_name}. All rights reserved.</span>
//         <span style={copyStyle}>Designed with care in Pune</span>
//       </div>
//     </footer>
//   );
// }
import { useEffect, useState } from "react";
import api from "../api/axios";

function fmt(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  const suffix = hr >= 12 ? "PM" : "AM";
  const display = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${display}:${m} ${suffix}`;
}

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Book Appointment", href: "#booking" },
  { label: "Track Booking", href: "#track" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get("/settings/public")
      .then(res => setS(res.data))
      .catch(() => setS({}));
  }, []);

  if (!s) return null; // wait until settings load — no hardcoded fallback shown

  const hasHours = s.salon_opening_time && s.salon_closing_time;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] px-5 pt-12 pb-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          {s.service_name && (
            <div className="text-[20px] font-bold text-[#c8a84b] tracking-wide mb-1">
              {s.service_name}
            </div>
          )}
          {(s.footer_tagline || s.hero_tagline) && (
            <div className="text-[11px] text-white/40 uppercase tracking-[2px] mb-3">
              {s.footer_tagline || s.hero_tagline}
            </div>
          )}
          {s.about_description && (
            <p className="text-[13px] text-white/45 leading-relaxed max-w-xs">
              {s.about_description}
            </p>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-[11px] text-[#c8a84b] uppercase tracking-[2.5px] font-semibold mb-4">
            Quick Links
          </p>
          {NAV.map(item => (
            <a key={item.label} href={item.href}
              className="block text-[13px] text-white/55 mb-2.5 hover:text-[#c8a84b] transition-colors">
              {item.label}
            </a>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p className="text-[11px] text-[#c8a84b] uppercase tracking-[2.5px] font-semibold mb-4">
            Contact Us
          </p>
          {s.contact_phone && (
            <a href={`tel:${s.contact_phone}`}
              className="flex gap-2.5 mb-3 text-[13px] text-white/55 hover:text-white/80 transition-colors leading-relaxed">
              <span>📞</span><span>{s.contact_phone}</span>
            </a>
          )}
          {s.contact_email && (
            <a href={`mailto:${s.contact_email}`}
              className="flex gap-2.5 mb-3 text-[13px] text-white/55 hover:text-white/80 transition-colors leading-relaxed">
              <span>✉️</span><span>{s.contact_email}</span>
            </a>
          )}
          {s.contact_address && (
            <div className="flex gap-2.5 text-[13px] text-white/55 leading-relaxed">
              <span className="flex-shrink-0">📍</span>
              <span>{s.contact_address}</span>
            </div>
          )}
        </div>

        {/* Hours + WhatsApp */}
        <div>
          {hasHours && (
            <>
              <p className="text-[11px] text-[#c8a84b] uppercase tracking-[2.5px] font-semibold mb-4">
                Working Hours
              </p>
              <div className="flex gap-2.5 mb-5 text-[13px] text-white/55 leading-relaxed">
                <span>🕐</span>
                <span>
                  Mon – Sun<br />
                  {fmt(s.salon_opening_time)} – {fmt(s.salon_closing_time)}
                </span>
              </div>
            </>
          )}
          {s.contact_whatsapp && (
            <a
              href={`https://wa.me/${s.contact_whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25d36615] border border-[#25d36630] rounded-full px-4 py-2.5 hover:bg-[#25d36625] transition-colors"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#25d366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              <span className="text-[13px] text-[#25d366] font-semibold">WhatsApp Us</span>
            </a>
          )}
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-5xl mx-auto border-t border-white/[0.08] mt-10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-2">
        {s.service_name && (
          <span className="text-[11px] text-white/25 tracking-wide">
            © {currentYear} {s.service_name}. All rights reserved.
          </span>
        )}
      </div>
    </footer>
  );
}