 import { useState, useEffect } from 'react';
// import { MoreVertical, X } from 'lucide-react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ salonName }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

 const links = [
  { label: 'HOME', href: '#home' },
  { label: 'SERVICES', href: '#services' },
  { label: 'TRACK', href: '#tracking' },
  { label: 'ABOUT', href: '#about' },
  { label: 'REVIEWS', href: '#reviews' },
  { label: 'CONTACT', href: '#contact' },
];


 


// useEffect(() => {
//   const handleScroll = () => {
//     const scrollPos = window.scrollY + 200;

//     let current = 'home';

//     links.forEach((link) => {
//       const section = document.getElementById(
//         link.href.replace('#', '')
//       );

//       if (section && scrollPos >= section.offsetTop) {
//         current = section.id;
//       }
//     });

//     setActiveSection(current);
//   };

//   window.addEventListener('scroll', handleScroll);
//   handleScroll();

//   return () => {
//     window.removeEventListener('scroll', handleScroll);
//   };
// }, []);


useEffect(() => {
  const handleScroll = () => {

    // Bottom of page = Contact active
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 20
    ) {
      setActiveSection('contact');
      return;
    }

    const scrollPos = window.scrollY + 200;

    let current = 'home';

    links.forEach((link) => {
      const section = document.getElementById(
        link.href.replace('#', '')
      );

      if (section && scrollPos >= section.offsetTop) {
        current = section.id;
      }
    });

    setActiveSection(current);
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  // Smooth scroll handler with navbar offset
  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const navHeight = window.innerWidth >= 640 ? 90 : 56; // account for desktop secondary bar
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const rawName  = salonName || 'Urban Company';
  const parts    = rawName.trim().split(' ');
  const initials = parts.map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const line1    = parts[0] || '';
  const line2    = parts.slice(1).join(' ') || '';

  return (
    <>
      {/* Top Bar */}
       <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-[56px] flex items-center px-4">
  {/* <div className="flex-1 flex justify-center items-center gap-2"> */}
  <div className="flex items-center gap-2 mx-auto">
    <div className="w-8 h-8 bg-black rounded flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold tracking-tight">
        {initials}
      </span>
    </div>

    <div className="text-left leading-tight">
      <div className="text-[11px] font-semibold text-gray-900">
        {line1}
      </div>
      {line2 && (
        <div className="text-[11px] font-semibold text-gray-900">
          {line2}
        </div>
      )}
    </div>
  </div>

  {/* Mobile Hamburger */}
  <button
    onClick={() => setOpen(true)}
    className="p-1 text-gray-800 sm:hidden"
    aria-label="Open menu"
  >
    <Menu size={24} />
  </button>
</nav>

      {/* Desktop secondary nav bar — visible on sm+ */}
      <div className="fixed top-[56px] left-0 right-0 z-40 bg-white border-b border-gray-100 hidden sm:flex justify-center gap-6 px-6">
        {links.map(l => {
          const isActive = activeSection === l.href.slice(1);
          return (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleLinkClick(e, l.href)}
              className={`py-2.5 text-[11px] tracking-widest border-b-2 transition-colors duration-200 ${
                isActive
                  ? 'border-black text-black font-bold'
                  : 'border-transparent text-gray-500 font-medium hover:text-gray-800'
              }`}
            >
              {l.label}
            </a>
          );
        })}
      </div>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/30 transition-opacity duration-300 sm:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile slide-in panel */}
      {/* <div
        className={`fixed top-0 left-0 z-[110] h-full w-[260px] bg-white shadow-xl flex flex-col pt-6 px-8 transition-transform duration-300 ease-in-out sm:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      > */}
      <div
        className={`fixed top-0 left-0 z-[110] h-full w-[260px] bg-white shadow-xl flex flex-col pt-6 px-8 transition-transform duration-300 ease-in-out sm:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <button onClick={() => setOpen(false)} className="mb-8 text-gray-800 self-start" aria-label="Close menu">
          <X size={22} />
        </button>

        <nav className="flex flex-col">
          {links.map(l => {
            const isActive = activeSection === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleLinkClick(e, l.href)}
                className={`py-4 text-[15px] tracking-wide border-b border-gray-100 transition-colors ${
                  isActive ? 'font-bold text-black' : 'font-normal text-gray-600 hover:text-black'
                }`}
              >
                {l.label}
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
}