import { useState, useEffect } from 'react';
import { MoreVertical, X, User } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'HOME', href: '#home' },
    { label: 'BOOK', href: '#booking' },
    { label: 'SERVICES', href: '#services' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact' },
  ];

  const activeLabel = 'ABOUT'; // change to track active dynamically if needed

  return (
    <>
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-[56px] flex items-center px-4">
        {/* Left: three-dot menu */}
        <button
          onClick={() => setOpen(true)}
          className="p-1 text-gray-800"
          aria-label="Open menu"
        >
          <MoreVertical size={22} />
        </button>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center items-center gap-2">
          {/* UC badge */}
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">UC</span>
          </div>
           
          {/* Brand + user name */}
          <div className="text-left">
            <div className="text-[11px] font-semibold text-gray-900 leading-tight">Urban</div>
            <div className="text-[11px] font-semibold text-gray-900 leading-tight">Company</div>
          </div>
          {/* Divider */}
          <div className="h-6 w-px bg-gray-600" />
          <div className="text-left ml-1">
            <div className="text-[11px] text-gray-600 leading-tight">Rahul</div>
            <div className="text-[11px] text-gray-600 leading-tight">Rathod</div>
          </div>
        </div>

        {/* Right: user icon */}
        <button className="p-1 text-gray-800" aria-label="Profile">
          <User size={22} />
        </button>
      </nav>

      {/* Mobile Slide-in Menu Panel */}
      {open && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          {/* White panel */}
          <div className="relative bg-white w-[260px] h-full shadow-xl flex flex-col pt-6 px-8">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="mb-8 text-gray-800 self-start"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>

            {/* Nav links */}
            <nav className="flex flex-col gap-0">
              {links.map(l => {
                const isActive = l.label === activeLabel;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`py-4 text-[15px] tracking-wide border-b border-gray-100 ${isActive
                        ? 'font-bold text-black'
                        : 'font-normal text-gray-700'
                      }`}
                  >
                    {l.label}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}