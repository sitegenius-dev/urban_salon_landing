 import { useEffect, useState } from "react";
import api from "../api/axios";

const DEFAULTS = {
  service_name: "Root & Rise",
  contact_phone: "+91 98765 43210",
  contact_whatsapp: "919876543210",
  contact_address: "Koregaon Park, Pune, Maharashtra 411001",
  salon_opening_time: "09:00",
  salon_closing_time: "21:00",
};

function fmt(t) {
  if (!t) return "";
  const parts = t.split(":");
  const hr = parseInt(parts[0]);
  const mn = parts[1];
  const suffix = hr >= 12 ? "PM" : "AM";
  const displayHr = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return displayHr + ":" + mn + " " + suffix;
}

function ContactRow(props) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
      <span style={{ fontSize: "13px" }}>{props.icon}</span>
      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: "1.5", whiteSpace: "pre-line" }}>{props.text}</span>
    </div>
  );
}

const HEAD = {
  fontSize: "11px",
  color: "#c8a84b",
  letterSpacing: "2.5px",
  textTransform: "uppercase",
  fontWeight: "600",
  marginBottom: "16px",
};

const LINK = {
  display: "block",
  fontSize: "13px",
  color: "rgba(255,255,255,0.55)",
  textDecoration: "none",
  marginBottom: "10px",
};

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Book Appointment", href: "#booking" },
  { label: "Track Booking", href: "#track" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const [s, setS] = useState(DEFAULTS);

  useEffect(function() {
    api.get("/settings/public")
      .then(function(res) {
        setS(function(prev) {
          return Object.assign({}, prev, res.data);
        });
      })
      .catch(function() {});
  }, []);

  const waStyle = {
    marginTop: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(37,211,102,0.1)",
    border: "1px solid rgba(37,211,102,0.25)",
    borderRadius: "50px",
    padding: "10px 20px",
    textDecoration: "none",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
    gap: "40px",
    maxWidth: "1100px",
    margin: "0 auto",
  };

  const footerStyle = {
    background: "#0a0a0a",
    padding: "56px 32px 24px",
    fontFamily: "sans-serif",
  };

  const hrStyle = {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    maxWidth: "1100px",
    margin: "36px auto 20px",
  };

  const bottomStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  };

  const copyStyle = {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "1px",
  };

  return (
    <footer style={footerStyle}>
      <div style={gridStyle}>

        <div>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#c8a84b", letterSpacing: "1px", marginBottom: "10px" }}>
            {s.service_name}
          </div>
           <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "18px" }}>
            {s.hero_tagline}
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: "1.8", maxWidth: "220px" }}>
            {s.about_description}
          </div>
        </div>

        <div>
          <div style={HEAD}>Quick Links</div>
          {NAV.map(function(item) {
            return (
              <a
                key={item.label}
                href={item.href}
                style={LINK}
                onMouseEnter={function(e) { e.currentTarget.style.color = "#c8a84b"; }}
                onMouseLeave={function(e) { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <div>
          <div style={HEAD}>Contact Us</div>
          <ContactRow icon="📞" text={s.contact_phone} />
          <ContactRow icon="✉️" text="hello@rootandrise.in" />
          <ContactRow icon="📍" text={s.contact_address} />
        </div>

        <div>
          <div style={HEAD}>Working Hours</div>
          <ContactRow
            icon="🕐"
            text={"Mon - Sun\n" + fmt(s.salon_opening_time) + " - " + fmt(s.salon_closing_time)}
          />
          <a
            href={"https://wa.me/" + s.contact_whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            style={waStyle}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            <span style={{ fontSize: "13px", color: "#25d366", fontWeight: "600" }}>WhatsApp Us</span>
          </a>
        </div>

      </div>

      <hr style={hrStyle} />

      <div style={bottomStyle}>
        <span style={copyStyle}>2025 {s.service_name}. All rights reserved.</span>
        <span style={copyStyle}>Designed with care in Pune</span>
      </div>
    </footer>
  );
}